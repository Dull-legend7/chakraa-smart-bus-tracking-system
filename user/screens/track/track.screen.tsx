import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";
import type { LocationObjectCoords } from "expo-location";
import { ref, onValue } from "firebase/database";
import { database } from "@/lib/firebase";
import axios from "axios";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function TrackScreen() {
  const insets = useSafeAreaInsets();

  const [currentLocation, setCurrentLocation] =
    useState<LocationObjectCoords | null>(null);

  const [busLocation, setBusLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [destination, setDestination] = useState<any>(null);

  const [eta, setEta] = useState<string>("...");
  const [time, setTime] = useState<string>("");

  const GOOGLE_API_KEY =
    process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY ?? "";

  // 📍 USER LOCATION
  useEffect(() => {
    (async () => {
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") return;

      const loc = await Location.getCurrentPositionAsync({});
      setCurrentLocation(loc.coords);
    })();
  }, []);

  // 🔥 FIREBASE GPS
  useEffect(() => {
    const gpsRef = ref(database, "GPS");

    const unsubscribe = onValue(gpsRef, (snapshot) => {
      if (!snapshot.exists()) return;

      const data = snapshot.val();

      if (!data?.lat || !data?.lng) return;

      const loc = {
        latitude: Number(data.lat),
        longitude: Number(data.lng),
      };

      setBusLocation(loc);
      setTime(data.time || "");

      if (destination) calculateETA(loc);
    });

    return () => unsubscribe();
  }, [destination]);

  // ⏱ ETA CALCULATION
  const calculateETA = async (busLoc: {
    latitude: number;
    longitude: number;
  }) => {
    if (!destination) return;

    try {
      const res = await axios.get(
        "https://maps.googleapis.com/maps/api/distancematrix/json",
        {
          params: {
            origins: `${busLoc.latitude},${busLoc.longitude}`,
            destinations: `${destination.latitude},${destination.longitude}`,
            key: GOOGLE_API_KEY,
            mode: "driving",
          },
        }
      );

      const duration =
        res?.data?.rows?.[0]?.elements?.[0]?.duration?.text;

      setEta(duration || "N/A");
    } catch {
      setEta("Error");
    }
  };

  // 🗺 MODERN MAP HTML (FIXED)
  const mapHTML = (
    lat: number,
    lng: number,
    dest?: any
  ) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css"/>
    <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>

    <style>
      html, body, #map {
        height: 100%;
        margin: 0;
      }
    </style>
  </head>
  <body>
    <div id="map"></div>

    <script>
      var map = L.map('map', { zoomControl: false }).setView([${lat}, ${lng}], 13);

      // ✅ BEAUTIFUL MAP STYLE
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap & Carto'
      }).addTo(map);

      // 🚌 BUS ICON
      var busIcon = L.icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/512/61/61231.png",
        iconSize: [35, 35]
      });

      L.marker([${lat}, ${lng}], { icon: busIcon })
        .addTo(map)
        .bindPopup("Bus Location");

      ${dest ? `
      var destIcon = L.icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
        iconSize: [35, 35]
      });

      L.marker([${dest.latitude}, ${dest.longitude}], { icon: destIcon })
        .addTo(map)
        .bindPopup("Destination");

      fetch("https://router.project-osrm.org/route/v1/driving/${lng},${lat};${dest.longitude},${dest.latitude}?overview=full&geometries=geojson")
        .then(res => res.json())
        .then(data => {
          var coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);

          var route = L.polyline(coords, {
            color: "#2563eb",
            weight: 6
          }).addTo(map);

          map.fitBounds(route.getBounds(), { padding: [50, 50] });
        });
      ` : ""}
    </script>
  </body>
  </html>
  `;

  if (!busLocation) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Waiting for GPS...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      
      {/* 🔍 SEARCH */}
      <View
        style={{
          position: "absolute",
          top: insets.top + 10,
          width: "90%",
          alignSelf: "center",
          zIndex: 1000,
        }}
      >
        <GooglePlacesAutocomplete
          placeholder="Search destination..."
          fetchDetails={true}
          onPress={(data, details = null) => {
            if (!details) return;

            setDestination({
              latitude: details.geometry.location.lat,
              longitude: details.geometry.location.lng,
            });
          }}
          query={{
            key: GOOGLE_API_KEY,
            language: "en",
          }}
          styles={{
            textInput: {
              backgroundColor: "#fff",
              borderRadius: 10,
              height: 45,
              paddingHorizontal: 10,
            },
          }}
        />
      </View>

      {/* 🗺 MAP */}
      <WebView
        originWhitelist={["*"]}
        source={{
          html: mapHTML(
            busLocation.latitude,
            busLocation.longitude,
            destination
          ),
        }}
        style={{ flex: 1 }}
      />

      {/* 📊 INFO */}
      <View style={styles.overlay}>
        <Text style={styles.title}>Live Bus Tracking</Text>

        <View style={styles.card}>
          <Text style={styles.route}>Bus GPS</Text>

          <View style={styles.row}>
            <Text style={styles.time}>
              Updated: {time || "---"}
            </Text>
            <Text style={styles.eta}>{eta}</Text>
          </View>

          <Text>Lat: {busLocation.latitude.toFixed(5)}</Text>
          <Text>Lng: {busLocation.longitude.toFixed(5)}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 100,
    left: 20,
    right: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    elevation: 5,
  },
  route: {
    fontSize: 16,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  time: {
    fontSize: 12,
    color: "#777",
  },
  eta: {
    fontSize: 20,
    color: "orange",
    fontWeight: "bold",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});