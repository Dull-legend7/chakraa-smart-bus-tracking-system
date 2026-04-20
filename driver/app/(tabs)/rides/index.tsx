import { View, Text, StyleSheet, FlatList, Button, Alert } from "react-native";
import React, { useEffect, useState, useRef } from "react";
import RideCard from "@/components/ride/ride.card";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useTheme } from "@react-navigation/native";
import fonts from "@/themes/app.fonts";

// 🔥 FIREBASE
import { ref, onValue, update } from "firebase/database";
import { database } from "../../../configs/firebase";

// 🔥 DISTANCE FUNCTION (UNCHANGED)
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// 🔥 DUMMY RIDES (UNCHANGED)
const dummyRides = [
  { id: "1", user: { name: "Rahul" }, charge: 250, distance: "12 km", currentLocationName: "Kazhakootam", destinationLocationName: "Technopark", createdAt: "2025-04-01" },
  { id: "2", user: { name: "Anjali" }, charge: 180, distance: "8 km", currentLocationName: "Pattom", destinationLocationName: "Medical College", createdAt: "2025-04-02" },
  { id: "3", user: { name: "Arjun" }, charge: 320, distance: "15 km", currentLocationName: "Kowdiar", destinationLocationName: "Lulu Mall", createdAt: "2025-04-03" },
  { id: "4", user: { name: "Sneha" }, charge: 210, distance: "10 km", currentLocationName: "Vattiyoorkavu", destinationLocationName: "East Fort", createdAt: "2025-04-04" },
  { id: "5", user: { name: "Kiran" }, charge: 400, distance: "20 km", currentLocationName: "Neyyattinkara", destinationLocationName: "Airport", createdAt: "2025-04-05" },
  { id: "6", user: { name: "Meera" }, charge: 150, distance: "6 km", currentLocationName: "Poojappura", destinationLocationName: "Thampanoor", createdAt: "2025-04-06" },
  { id: "7", user: { name: "Vishnu" }, charge: 275, distance: "13 km", currentLocationName: "Sreekaryam", destinationLocationName: "Infosys", createdAt: "2025-04-07" },
  { id: "8", user: { name: "Akhil" }, charge: 190, distance: "9 km", currentLocationName: "Kesavadasapuram", destinationLocationName: "PMG", createdAt: "2025-04-08" },
  { id: "9", user: { name: "Divya" }, charge: 350, distance: "18 km", currentLocationName: "Attingal", destinationLocationName: "TVM Central", createdAt: "2025-04-09" },
  { id: "10", user: { name: "Nikhil" }, charge: 220, distance: "11 km", currentLocationName: "Karamana", destinationLocationName: "Pattom", createdAt: "2025-04-10" },
];

export default function Rides() {
  const { colors } = useTheme();

  const [rides, setRides] = useState<any[]>([]);
  const [liveBooking, setLiveBooking] = useState<any>(null);

  // ✅ Prevent duplicate alerts
  const seenBookings = useRef<Set<string>>(new Set());

  // 🔥 FETCH HISTORY (UNCHANGED)
  const getRecentRides = async () => {
    try {
      const accessToken = await AsyncStorage.getItem("accessToken");

      const res = await axios.get(
        `${process.env.EXPO_PUBLIC_SERVER_URI}/driver/get-rides`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (res?.data?.rides?.length > 0) {
        setRides(res.data.rides);
      } else {
        setRides(dummyRides);
      }
    } catch (error) {
      console.log("Ride fetch error:", error);
      setRides(dummyRides);
    }
  };

  // 🔥 FIREBASE LISTENER (FIXED PROPERLY)
  useEffect(() => {
    console.log("🔥 DRIVER LISTENER STARTED");
    const bookingsRef = ref(database, "bookings");

    const unsubscribe = onValue(bookingsRef, (snapshot) => {
      console.log("🟡 BOOKINGS SNAPSHOT");

      const data = snapshot.val();
      if (!data) return;

      Object.entries(data).forEach(([id, val]: any) => {
        if (val.status !== "searching") return;

        // ❌ prevent repeat alerts
        if (seenBookings.current.has(id)) return;

        // 👉 TEMP DRIVER LOCATION
        const driverLat = 8.64824;
        const driverLng = 76.78528;

        const pickupLat = val.pickupCoords?.latitude;
        const pickupLng = val.pickupCoords?.longitude;

        if (!pickupLat || !pickupLng) return;

        const distance = getDistance(
          driverLat,
          driverLng,
          pickupLat,
          pickupLng
        );

        console.log("📏 Distance:", distance);

        // ✅ Nearby filter
        if (distance < 2) {
          seenBookings.current.add(id);

          const booking = { id, ...val };
          setLiveBooking(booking);

          console.log("🚨 SHOW ALERT");

          Alert.alert(
            "🚨 Nearby Ride Request",
            "Passenger nearby. Accept?",
            [
              {
                text: "Reject",
                style: "cancel",
              },
              {
                text: "Accept",
                onPress: async () => {
                  const bookingRef = ref(database, `bookings/${id}`);

                  await update(bookingRef, {
                    status: "accepted",
                    driverId: "driver_1",
                  });

                  console.log("✅ ACCEPTED");

                  setLiveBooking(null);
                },
              },
            ]
          );
        }
      });
    });

    return () => unsubscribe();
  }, []);

  // 🔥 LOAD HISTORY
  useEffect(() => {
    getRecentRides();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      {/* HEADER */}
      <Text style={[styles.title, { color: colors.text }]}>
        Driver Dashboard
      </Text>

      {/* 🚨 LIVE BOOKING CARD */}
      {liveBooking && (
        <View style={styles.liveCard}>
          <Text style={styles.liveTitle}>🚨 Nearby Ride Request</Text>

          <Text>
            Pickup: {liveBooking.pickupCoords?.latitude},{" "}
            {liveBooking.pickupCoords?.longitude}
          </Text>

          <Text>Price: ₹{liveBooking.price}</Text>

          <Button title="Accept Ride" onPress={async () => {
            const bookingRef = ref(database, `bookings/${liveBooking.id}`);

            await update(bookingRef, {
              status: "accepted",
              driverId: "driver_1",
            });

            Alert.alert("✅ Ride Accepted");
            setLiveBooking(null);
          }} />
        </View>
      )}

      {/* HISTORY TITLE */}
      <Text style={[styles.subtitle, { color: colors.text }]}>
        Ride History
      </Text>

      {/* LIST */}
      <FlatList
        data={rides}
        keyExtractor={(item, index) => item.id || index.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <RideCard item={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 50,
  },

  title: {
    fontSize: 24,
    fontFamily: fonts.bold,
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 18,
    marginVertical: 10,
  },

  liveCard: {
    backgroundColor: "#ffecec",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },

  liveTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 5,
  },
});