import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";

import { useLocalSearchParams, router } from "expo-router";
import { ref, set, onValue, get, update, push } from "firebase/database";
import { database } from "../lib/firebase";
import { useEffect } from "react";

export default function SearchingScreen() {
  const { bookingId } = useLocalSearchParams();

  // ================= CANCEL =================
const handleCancel = async () => {
  console.log("🚨 CANCEL FUNCTION TRIGGERED"); // 👈 ADD HERE (VERY FIRST LINE)

  try {
    if (!bookingId) return;

    // 🔥 GET BOOKING DATA (to know price)
    const bookingRef = ref(database, `bookings/${bookingId}`);
    const snapshot = await get(bookingRef);
    const bookingData = snapshot.val();

    const price = bookingData?.price || 0;

    // 🔥 CALCULATE REFUND (80%)
    const refund = Math.round(price * 0.8);

    console.log("🔥 REFUND:", refund);



    // 🔥 UPDATE DRIVER DATA
    const driverRef = ref(database, "drivers/driver1");
    const driverSnap = await get(driverRef);
    const driverData = driverSnap.val() || {};

    console.log("🔥 DRIVER BEFORE CANCEL:", driverData);

    await update(driverRef, {
      totalEarning: (driverData.totalEarning || 0) - refund,
      cancelRides: (driverData.cancelRides || 0) + 1,
    });

    await push(ref(database, "drivers/driver1/earningsHistory"), {
  amount: -refund,
  type: "refund",
  timestamp: Date.now(),
});

    console.log("🔥 DRIVER UPDATED AFTER CANCEL");

    // ✅ 5️⃣ NOW CANCEL BOOKING (MOVE HERE)
    await set(
      ref(database, `bookings/${bookingId}/status`),
      "cancelled"
    );

    Alert.alert("Cancelled ❌", `Refund: ₹${refund}`);

    router.replace("/");

  } catch (err) {
    console.log("Cancel error:", err);
  }
};
  // ================= REAL-TIME LISTENER =================
  useEffect(() => {
    if (!bookingId) return;

    const bookingRef = ref(database, `bookings/${bookingId}`);

    const unsubscribe = onValue(bookingRef, (snapshot) => {
      const data = snapshot.val();

      console.log("📡 LIVE STATUS:", data?.status);

      // 🚖 DRIVER ACCEPTED
      if (data?.status === "accepted") {
        Alert.alert("Driver Found 🚖");
        router.replace("/map");
      }

      // ❌ CANCELLED (driver/user)
      if (data?.status === "cancelled") {
        router.replace("/");
      }
    });

    return () => unsubscribe();
  }, [bookingId]);

  // ================= UI =================
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
      }}
    >
      <ActivityIndicator size="large" color="#2563EB" />

      <Text
        style={{
          fontSize: 20,
          fontWeight: "600",
          marginTop: 20,
        }}
      >
        🔍 Searching for driver...
      </Text>

      <Text style={{ marginTop: 10, color: "#666" }}>
        Status: searching
      </Text>

      <TouchableOpacity
        style={{
          marginTop: 30,
          backgroundColor: "red",
          padding: 14,
          borderRadius: 10,
          width: 200,
        }}
        onPress={handleCancel}
      >
        <Text style={{ color: "#fff", textAlign: "center" }}>
          Cancel Ride ❌
        </Text>
      </TouchableOpacity>
    </View>
  );
}