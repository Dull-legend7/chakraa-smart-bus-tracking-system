import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from "react-native";
import { WebView } from "react-native-webview";
import { useLocalSearchParams } from "expo-router";
import { ref, onValue } from "firebase/database";
import { database } from "../../lib/firebase";

const { width, height } = Dimensions.get("window");

export default function RideScreen() {
  const { bookingId } = useLocalSearchParams();
  const [bus, setBus] = useState<any>(null);

  useEffect(() => {
    const busRef = ref(database, "buses/bus_1");

    const unsubscribe = onValue(busRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setBus(data);
    });

    return () => unsubscribe();
  }, []);

  // 🗺 Leaflet Map HTML
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

  if (!bus) {
    return (
      <View style={styles.center}>
        <Text>Loading bus location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>

      {/* 🗺 OSM MAP (FIXED) */}
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

      {/* 📦 BOTTOM CARD */}
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
});