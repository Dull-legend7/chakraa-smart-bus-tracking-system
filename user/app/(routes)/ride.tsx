import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
} from "react-native";
import { WebView } from "react-native-webview";
import { useLocalSearchParams, router } from "expo-router";
import { ref, onValue, set, get, update, push } from "firebase/database";
import { database } from "../../lib/firebase";



const { width, height } = Dimensions.get("window");

export default function RideScreen() {
  const { bookingId } = useLocalSearchParams();
  const [bus, setBus] = useState<any>(null);

  // 🔥 LISTEN BUS LOCATION
  useEffect(() => {
    const busRef = ref(database, "buses/bus_1");

    const unsubscribe = onValue(busRef, async (snapshot) => {
      const data = snapshot.val();
      if (data) setBus(data);
    });

    return () => unsubscribe();
  }, []);

  // 🔥 LISTEN BOOKING STATUS (IMPORTANT)
  useEffect(() => {
    if (!bookingId) return;

    const bookingRef = ref(database, `bookings/${bookingId}`);

    const unsubscribe = onValue(bookingRef, async (snapshot) => {
      const data = snapshot.val();

      if (!data) return;

      console.log("📡 BOOKING STATUS:", data.status);

      // ✅ SAVE ROUTE WHEN DRIVER ACCEPTS
if (data.status === "accepted") {
  console.log("✅ RIDE ACCEPTED — SAVING ROUTE");

  const userId = "user1";

  await push(ref(database, `users/${userId}/routes`), {
    from: data.from || data.pickup || "Unknown",
    to: data.to || data.destination || "Unknown",
    timestamp: Date.now(),
  });
}

      // ❌ If cancelled from anywhere
      if (data.status === "cancelled") {
        Alert.alert("Ride Cancelled ❌");
        router.replace("/(tabs)/home");
      }
    });

    return () => unsubscribe();
  }, [bookingId]);

  // ❌ CANCEL FUNCTION
const handleCancel = async () => {
  Alert.alert(
    "Cancel Ride?",
    "20% cancellation fee will be applied",
    [
      { text: "No" },
      {
        text: "Yes",
        onPress: async () => {
          try {
            if (!bookingId) return;

            const bookingRef = ref(database, `bookings/${bookingId}`);
            const snapshot = await get(bookingRef);

            const data = snapshot.val();
            if (!data) return;

            const originalPrice = data.price || 100;

            const penalty = Math.round(originalPrice * 0.2);
            console.log("🚨 CANCEL PRESSED IN RIDE SCREEN");
            const refund = originalPrice - penalty;

            // 🔥 DRIVER UPDATE LOGIC
const driverRef = ref(database, "drivers/driver1");
const driverSnap = await get(driverRef);
const driverData = driverSnap.val() || {};

console.log("🔥 DRIVER BEFORE CANCEL:", driverData);
console.log("🔥 REFUND:", refund);

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

            await set(bookingRef, {
              ...data,
              status: "cancelled",
              refund,
              penalty,
            });

            Alert.alert(
              "Refund Processed 💰",
              `Refund: ₹${refund}\nPenalty: ₹${penalty}`
            );

            router.replace("/(tabs)/home");
          } catch (err) {
            console.log("Cancel error:", err);
          }
        },
      },
    ]
  );
};

  // 🗺 MAP HTML
  const mapHTML = (lat: number, lng: number) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css"/>
    <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
    <style>
      body { margin:0; }
      #map { height:100vh; width:100vw; }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script>
      var map = L.map('map').setView([${lat}, ${lng}], 13);

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(map);

      var marker = L.marker([${lat}, ${lng}]).addTo(map)
        .bindPopup("Bus Location")
        .openPopup();
    </script>
  </body>
  </html>
  `;

  // ⏳ LOADING STATE
  if (!bus) {
    return (
      <View style={styles.center}>
        <Text>Loading bus location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      {/* 🗺 MAP */}
      <View style={styles.map}>
        <WebView
          originWhitelist={["*"]}
          source={{
            html: mapHTML(
              bus.location.latitude,
              bus.location.longitude
            ),
          }}
        />
      </View>

      {/* 📦 CARD */}
      <View style={styles.card}>
        <Text style={styles.title}>🚌 Seat Confirmed</Text>

        <Text style={styles.subtitle}>
          Your seat has been successfully booked
        </Text>

        <View style={styles.bookingBox}>
          <Text style={styles.label}>Booking ID</Text>
          <Text style={styles.value}>{bookingId}</Text>
        </View>

        <Text style={styles.info}>🚌 Bus: {bus.busNumber}</Text>
        <Text style={styles.info}>📍 Route: {bus.route}</Text>

        <Text style={styles.info}>
          📍 Bus will arrive at your pickup point shortly
        </Text>

        <Text style={styles.info}>
          ⏱ Please be ready before departure
        </Text>

        {/* 💰 REFUND INFO */}
{bookingId && (
  <Text
    style={{
      color: "green",
      textAlign: "center",
      marginTop: 10,
      fontWeight: "600",
    }}
  >
    Refund: ₹{bus.refund}
  </Text>
)}

        {/* 🔴 CANCEL BUTTON */}
        <TouchableOpacity
          onPress={handleCancel}
          style={styles.cancelBtn}
        >
          <Text style={styles.cancelText}>
            Cancel Ride ❌
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#fff",
  },

  map: {
    width: width,
    height: height * 0.55,
  },

  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    elevation: 10,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    marginVertical: 10,
  },

  bookingBox: {
    backgroundColor: "#f3f3f3",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: "center",
  },

  label: {
    fontSize: 12,
    color: "#888",
  },

  value: {
    fontSize: 15,
    fontWeight: "600",
  },

  info: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
    color: "#444",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  cancelBtn: {
    marginTop: 20,
    backgroundColor: "#ef4444",
    padding: 14,
    borderRadius: 10,
    alignSelf: "center",
    width: "80%",
  },

  cancelText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
});