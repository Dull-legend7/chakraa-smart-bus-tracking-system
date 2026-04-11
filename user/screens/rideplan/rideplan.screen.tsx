import {
  View,
  Text,
  SafeAreaView,
  FlatList,
} from "react-native";
import React, { useState } from "react";
import { WebView } from "react-native-webview";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import axios from "axios";

export default function RidePlanScreen() {
  const [origin, setOrigin] = useState<any>(null);
  const [destination, setDestination] = useState<any>(null);
  const [routes, setRoutes] = useState<any[]>([]);

  const calculateRoute = async (orig: any, dest: any) => {
    try {
      const res = await axios.get(
        "https://maps.googleapis.com/maps/api/distancematrix/json",
        {
          params: {
            origins: `${orig.lat},${orig.lng}`,
            destinations: `${dest.lat},${dest.lng}`,
            key: process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY,
          },
        }
      );

      const distKm = res.data.rows[0].elements[0].distance.value / 1000;

      const privateBus = Math.round(10 + distKm * 1.5);
      const ksrtc = Math.round(8 + distKm * 1.2);
      const fast = Math.round(15 + distKm * 1.8);

      const timeMin = Math.round(distKm * 2);

      setRoutes([
        { name: "Local Private Bus", price: privateBus, time: `${timeMin} mins` },
        { name: "KSRTC Ordinary", price: ksrtc, time: `${timeMin + 10} mins` },
        { name: "Fast Passenger", price: fast, time: `${Math.max(timeMin - 10, 10)} mins` },
      ]);
    } catch (err) {
      console.log(err);
    }
  };

  // 🔥 LEAFLET MAP HTML
  const mapHTML = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css"/>
    <style>
      body { margin:0; }
      #map { height:100vh; width:100vw; }
    </style>
  </head>
  <body>
    <div id="map"></div>

    <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
    <script>
      var map = L.map('map').setView([8.8932, 76.6141], 10);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'OSM'
      }).addTo(map);

      ${origin ? `L.marker([${origin.latitude}, ${origin.longitude}]).addTo(map);` : ""}
      ${destination ? `L.marker([${destination.latitude}, ${destination.longitude}]).addTo(map);` : ""}

      ${
        origin && destination
          ? `L.polyline([[${origin.latitude}, ${origin.longitude}], [${destination.latitude}, ${destination.longitude}]], {color:'blue'}).addTo(map);`
          : ""
      }
    </script>
  </body>
  </html>
  `;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      
      {/* ✅ REAL OSM MAP */}
      <WebView source={{ html: mapHTML }} style={{ flex: 1 }} />

      {/* BOTTOM PANEL */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          backgroundColor: "#fff",
          borderTopLeftRadius: 25,
          borderTopRightRadius: 25,
          padding: 20,
          maxHeight: "55%",
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "700" }}>
          Plan your ride
        </Text>

        {/* FROM */}
        <GooglePlacesAutocomplete
          placeholder="From"
          fetchDetails
          onPress={(data, details: any = null) => {
            const orig = {
              latitude: details.geometry.location.lat,
              longitude: details.geometry.location.lng,
              lat: details.geometry.location.lat,
              lng: details.geometry.location.lng,
            };
            setOrigin(orig);
            if (destination) calculateRoute(orig, destination);
          }}
          query={{
            key: process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY!,
            language: "en",
          }}
          styles={autoStyles}
        />

        {/* TO */}
        <GooglePlacesAutocomplete
          placeholder="Where to?"
          fetchDetails
          onPress={(data, details: any = null) => {
            const dest = {
              latitude: details.geometry.location.lat,
              longitude: details.geometry.location.lng,
              lat: details.geometry.location.lat,
              lng: details.geometry.location.lng,
            };
            setDestination(dest);
            if (origin) calculateRoute(origin, dest);
          }}
          query={{
            key: process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY!,
            language: "en",
          }}
          styles={autoStyles}
        />

        {/* ROUTES */}
        <FlatList
          data={routes}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => (
            <View style={card}>
              <Text style={{ fontWeight: "600" }}>{item.name}</Text>
              <Text>{item.time}</Text>
              <Text style={{ color: "#2563EB", fontWeight: "700" }}>
                ₹{item.price}
              </Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const autoStyles = {
  container: { flex: 0, marginTop: 10 },
  textInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
  },
};

const card = {
  backgroundColor: "#f5f5f5",
  padding: 15,
  borderRadius: 12,
  marginTop: 10,
};