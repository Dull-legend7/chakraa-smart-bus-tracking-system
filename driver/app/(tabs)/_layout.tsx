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

import { Alert } from "react-native";

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

/* ================== 🔥 REVERSE GEOCODING (FIXED) ================== */
async function getPlaceName(lat: number, lng: number) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    const data = await res.json();

    console.log("🌍 GEOCODE RESPONSE:", data);

    const addr = data?.address;

    const area =
      addr?.suburb ||
      addr?.neighbourhood ||
      addr?.village ||
      addr?.town ||
      addr?.city ||
      addr?.county;

    const city =
      addr?.city ||
      addr?.town ||
      addr?.state_district ||
      addr?.state;

    // ✅ CLEAN FORMAT
// ✅ PRIORITIZE DISPLAY NAME FIRST
if (data?.display_name) {
  const parts = data.display_name.split(",");

  const short =
    parts[0]?.trim() + (parts[1] ? `, ${parts[1].trim()}` : "");

  return short;
}

// fallback structured
if (area && city) return `${area}, ${city}`;
if (area) return area;

// final fallback
return `${lat.toFixed(3)}, ${lng.toFixed(3)}`;
  } catch (e) {
    return `${lat.toFixed(3)}, ${lng.toFixed(3)}`;
  }
}
/* ================== MAIN ================== */
export default function TabLayout() {
  const [driverLocation, setDriverLocation] = useState<any>(null);
  const driverLocationRef = useRef<any>(null);
  const lastShownBooking = useRef<string | null>(null);

  useEffect(() => {
    const driverRef = ref(database, "drivers/driver1/location");

    const unsub = onValue(driverRef, (snap) => {
      const loc = snap.val();
      if (loc) {
        setDriverLocation(loc);
        driverLocationRef.current = loc;
      }
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    console.log("🔥 DRIVER LISTENER ACTIVE");

    const bookingsRef = ref(database, "bookings");

    const unsubscribe = onValue(bookingsRef, async (snapshot) => {
      console.log("📡 SNAPSHOT TRIGGERED");

      const data = snapshot.val();
      console.log("📦 RAW BOOKINGS:", data);

      if (!data) return;

      const entries = Object.entries(data);

      const searchingBookings = entries.filter(
        ([_, val]: any) => val?.status === "searching"
      );

      if (searchingBookings.length === 0) {
        console.log("❌ No searching bookings");
        return;
      }

      const latest = searchingBookings.sort((a: any, b: any) => {
        const t1 = a[1]?.createdAt || 0;
        const t2 = b[1]?.createdAt || 0;

        if (!t1 && !t2) return a[0] < b[0] ? 1 : -1;

        return t2 - t1;
      })[0];

      if (!latest) return;

      const [id, val]: any = latest;

      console.log("📦 Checking booking:", id, val);

      const isOnline = true;
      if (!isOnline) return;

      if (lastShownBooking.current === id) return;

      const pickup = val.pickupCoords;
      const driverLoc = driverLocationRef.current;

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

      if (distance < 50) {
        console.log("🚨 MATCH FOUND");

        lastShownBooking.current = id;

        const placeName = await getPlaceName(pickupLat, pickupLng);

        const nearestStop = {
          name: placeName,
          lat: pickupLat,
          lng: pickupLng,
        };

        console.log("🧠 DYNAMIC PICKUP:", nearestStop);

        const stopDistance = getDistance(
          driverLoc.latitude,
          driverLoc.longitude,
          nearestStop.lat,
          nearestStop.lng
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
              onPress: () => {
                lastShownBooking.current = null;
              },
            },
            {
              text: "Accept",
              onPress: () => {
                update(ref(database, `bookings/${id}`), {
                  status: "accepted",
                  driverId: "driver1",
                  assignedStop: nearestStop,
                  createdAt: Date.now(),
                });

                console.log("✅ ACCEPTED:", nearestStop);

                globalThis.navigateToStop?.(
                  nearestStop.lat,
                  nearestStop.lng,
                  nearestStop.name
                );

                lastShownBooking.current = null;
              },
            },
          ]
        );
      }
    });

    return () => unsubscribe();
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
              <History
                colors={focused ? color.buttonBg : "#8F8F8F"}
              />
            );
          }

          if (route.name === "profile/index") {
            return (
              <Person
                fill={focused ? color.buttonBg : "#8F8F8F"}
              />
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