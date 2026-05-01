import { Home } from "@/assets/icons/home";
import { HomeLight } from "@/assets/icons/homeLight";
import { Person } from "@/assets/icons/person";
import { History } from "@/assets/icons/history";
import { Ionicons } from "@expo/vector-icons";
import color from "@/themes/app.colors";
import { Tabs } from "expo-router";
import React, { useEffect, useRef, useState } from "react";

import { database } from "@/configs/firebase";
import { ref, onValue, update } from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { useRouter } from "expo-router";

/* ================== GLOBAL LOCK ================== */
let isListenerAttached = false;

/* ================== DISTANCE ================== */
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function getETA(distance: number) {
  return Math.round((distance / 30) * 60);
}

/* ================== REVERSE GEOCODING ================== */
async function getPlaceName(lat: number, lng: number) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    const data = await res.json();

    if (data?.display_name) {
      const parts = data.display_name.split(",");
      return parts[0] + (parts[1] ? `, ${parts[1]}` : "");
    }

    return `${lat.toFixed(3)}, ${lng.toFixed(3)}`;
  } catch {
    return `${lat.toFixed(3)}, ${lng.toFixed(3)}`;
  }
}

/* ================== BUS STOP ================== */
function getNearestBusStop(lat: number, lng: number) {
  const stops = [
    { name: "Kazhakootam", lat: 8.6485, lng: 76.7850 },
    { name: "Technopark", lat: 8.5570, lng: 76.8816 },
    { name: "Karyavattom", lat: 8.5700, lng: 76.8900 },
      // 🔥 NEW (ADD THESE)
    { name: "Kulathoor", lat: 8.6300, lng: 76.8200 },
    { name: "Sreekaryam", lat: 8.5500, lng: 76.9100 },
    { name: "Pallithura", lat: 8.6500, lng: 76.7700 },
    { name: "Menamkulam", lat: 8.6400, lng: 76.8000 },
    { name: "Vetturoad", lat: 8.6600, lng: 76.7800 },
    // 🔥 ADD THESE BELOW EXISTING STOPS

{ name: "Chittattumukku", lat: 8.6050, lng: 76.8200 },
{ name: "Pangappara", lat: 8.5850, lng: 76.8800 },
{ name: "Engineering College", lat: 8.5750, lng: 76.9050 },
{ name: "Akkulam", lat: 8.5100, lng: 76.8900 },
{ name: "Kazhakootam Junction", lat: 8.6505, lng: 76.7865 },
{ name: "Alathara", lat: 8.6305, lng: 76.8050 },
{ name: "Infosys Phase 2", lat: 8.5605, lng: 76.8750 },
{ name: "Technopark Phase 3", lat: 8.5555, lng: 76.8905 },
{ name: "Kaniyapuram", lat: 8.6800, lng: 76.7800 },
{ name: "Pothencode", lat: 8.6000, lng: 76.9100 },
  ];

  let nearest = stops[0];
  let minDist = Infinity;

  stops.forEach((stop) => {
    const dist =
      Math.sqrt(
        Math.pow(lat - stop.lat, 2) +
        Math.pow(lng - stop.lng, 2)
      );

    if (dist < minDist) {
      minDist = dist;
      nearest = stop;
    }
  });

  return nearest;
}

/* ================== MAIN ================== */
export default function TabLayout() {
  const [driverLocation, setDriverLocation] = useState<any>(null);

  const driverLocationRef = useRef<any>(null);
  const lastShownBooking = useRef<string | null>(null);
  const isPopupActive = useRef(false);
  const appStartTime = useRef(Date.now());
  const hasInitialLoadPassed = useRef(false);

  const router = useRouter(); 

  useEffect(() => {
    if (driverLocation) {
      driverLocationRef.current = driverLocation;
    }
  }, [driverLocation]);

  /* 🔥 DRIVER LOCATION FROM FIREBASE */
useEffect(() => {
  const driverRef = ref(database, "drivers/driver1"); // change ID if needed

  const unsubscribe = onValue(driverRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    const loc = data.location || data;

    if (loc?.latitude && loc?.longitude) {
      const coords = {
        latitude: loc.latitude,
        longitude: loc.longitude,
      };

      setDriverLocation(coords);

      console.log("📍 DRIVER LOCATION SET:", coords);
    }
  });

  return () => unsubscribe();
}, []);

  /* 🔥 LOAD LAST BOOKING */
  useEffect(() => {
    const loadLastBooking = async () => {
      const saved = await AsyncStorage.getItem("lastBookingId");
      if (saved) {
        lastShownBooking.current = saved;
        console.log("💾 Loaded last booking:", saved);
      }
    };
    loadLastBooking();
  }, []);

  /* 🔥 BOOKINGS LISTENER */
  useEffect(() => {
    if (isListenerAttached) {
      console.log("⛔ Listener already attached");
      return;
    }

    isListenerAttached = true;
    console.log("🔥 DRIVER LISTENER ACTIVE");

    const bookingsRef = ref(database, "bookings");

    const unsubscribe = onValue(bookingsRef, async (snapshot) => {
      console.log("📡 SNAPSHOT TRIGGERED");

      const data = snapshot.val();

      if (!hasInitialLoadPassed.current) {
        hasInitialLoadPassed.current = true;
       
        console.log("⛔ Initial load passed (no skip)");
        
        
      }

      if (!data) return;

      const entries = Object.entries(data);

      const searchingBookings = entries.filter(
        ([_, val]: any) =>
          val &&
          typeof val === "object" &&
          val?.status === "searching" &&
          val?.pickupCoords &&
          !val?.driverId
);
             // ✅ only last 15 sec ;
          

      if (searchingBookings.length === 0) return;

      /* 🔥 ONLY LATEST */
      searchingBookings.sort(
        (a: any, b: any) =>
          (b[1].createdAt || 0) - (a[1].createdAt || 0)

      );

      const [id, val]: any = searchingBookings[0];

      console.log("🧪 DEBUG:", {
        id,
        popupActive: isPopupActive.current,
        lastShown: lastShownBooking.current,
        driverLoc: driverLocationRef.current,
      });

      if (lastShownBooking.current === id) return;
      if (isPopupActive.current) return;

      const pickup = val.pickupCoords;
      const driverLoc = driverLocationRef.current || driverLocation;

      if (!pickup || !driverLoc) return;

      const pickupLat = pickup.latitude ?? pickup.lat;
      const pickupLng = pickup.longitude ?? pickup.lng;

      if (!pickupLat || !pickupLng) return;

      const distance = getDistance(
        driverLoc.latitude,
        driverLoc.longitude,
        pickupLat,
        pickupLng
      );
      console.log("📏 Distance:", distance);
      if (distance >= 20) return;

      isPopupActive.current = true;

      /* 🔥 BUS STOP */
      const nearestStop = getNearestBusStop(pickupLat, pickupLng);

      const stopDistance = getDistance(
        driverLoc.latitude,
        driverLoc.longitude,
        pickupLat,
        pickupLng
      );

      const eta = getETA(stopDistance);

      Alert.alert(
        "🚌 New Ride Assigned",
        `Go to ${nearestStop.name}\n${stopDistance.toFixed(
          1
        )} km • ${eta} mins`,
        [
          {
            text: "Reject",
            style: "cancel",
            onPress: async () => {
              lastShownBooking.current = id;
              await AsyncStorage.setItem("lastBookingId", id);
              isPopupActive.current = false;

              await update(ref(database, `bookings/${id}`), {
                status: "rejected",
              });
            },
          },
          {
            text: "Accept",
            onPress: async () => {
              console.log("✅ ACCEPT PRESSED");
              // 🔥 CLEAR ALL OLD ACCEPTED BOOKINGS (ADD HERE)
const bookingsSnapshot = await new Promise<any>((resolve) => {
  onValue(ref(database, "bookings"), (snap) => resolve(snap), {
    onlyOnce: true,
  });
});

if (bookingsSnapshot.exists()) {
  const data = bookingsSnapshot.val();

  Object.entries(data).forEach(([key, val]: any) => {
    if (val?.status === "accepted") {
      update(ref(database, `bookings/${key}`), {
        status: "completed",
      });
    }
  });
}

              // 🔥 CLEAR OLD RIDE
              await AsyncStorage.removeItem("activeRide");

              lastShownBooking.current = id;
              await AsyncStorage.setItem("lastBookingId", id);
              isPopupActive.current = false;

              await update(ref(database, `bookings/${id}`), {
                status: "accepted",
                driverId: "driver1",
                assignedStop: nearestStop,
              });

              await AsyncStorage.setItem(
                "activeRide",
                  JSON.stringify({
                  pickup: val.pickupCoords,
                  stop: nearestStop,
               })
              );
              //✅ NAVIGATION (PUT IT HERE — LAST LINE)
              setTimeout(() => {
                router.push("/map");
                }, 500);
            },
          },
        ]
      );
    });

    return () => {
      console.log("🧹 CLEANING LISTENER");
      unsubscribe();
      isListenerAttached = false;
    };
  }, []);

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 60,
          paddingBottom: 5,
        },
        tabBarIcon: ({ focused }) => {
          if (route.name === "home") {
            return focused ? (
              <Home colors={color.buttonBg} width={24} height={24} />
            ) : (
              <HomeLight />
            );
          }

          if (route.name === "map") {
            return (
              <Ionicons
                name="map"
                size={26}
                color={focused ? color.buttonBg : "#8F8F8F"}
              />
            );
          }

          if (route.name === "rides/index") {
            return (
              <History colors={focused ? color.buttonBg : "#8F8F8F"} />
            );
          }

          if (route.name === "profile/index") {
            return (
              <Person fill={focused ? color.buttonBg : "#8F8F8F"} />
            );
          }
        },
      })}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="map" />
      <Tabs.Screen name="rides/index" />
      <Tabs.Screen name="profile/index" />
    </Tabs>
  );
}