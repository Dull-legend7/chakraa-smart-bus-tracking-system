import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { ref, onValue, off } from "firebase/database";
import { database } from "../../lib/firebase";
import { useLocalSearchParams, router } from "expo-router";

export default function SearchingScreen() {
  const { bookingId } = useLocalSearchParams();
  const [status, setStatus] = useState("searching");
  const [handled, setHandled] = useState(false); // ✅ prevent multiple triggers

  useEffect(() => {
    if (!bookingId) return;

    const bookingRef = ref(database, `bookings/${bookingId}`);

    const unsubscribe = onValue(bookingRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      console.log("LIVE STATUS:", data.status);

      setStatus(data.status);

      // 🔥 HANDLE ACCEPTED (CURRENT FLOW)
      if (data.status === "accepted" && !handled) {
        console.log("DRIVER FOUND 🚗");

        setHandled(true);

        // ✅ Navigate to next screen
        router.replace(`/ride?bookingId=${bookingId}`);
      }

      // 🔮 FUTURE (when driver assigns properly)
      if (data.status === "assigned" && !handled) {
        setHandled(true);
        router.replace(`/ride?bookingId=${bookingId}`);
      }
    });

    return () => {
      off(bookingRef);
    };
  }, [bookingId, handled]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 20,
      }}
    >
      <ActivityIndicator size="large" color="#2563EB" />

      <Text
        style={{
          marginTop: 20,
          fontSize: 18,
          fontWeight: "600",
          textAlign: "center",
        }}
      >
        Searching for driver...
      </Text>

      <Text
        style={{
          marginTop: 10,
          color: "#555",
          fontSize: 14,
        }}
      >
        Status: {status}
      </Text>
    </View>
  );
}