import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
  StatusBar,
  Platform,
} from "react-native";
import React, { useState } from "react";
import { WebView } from "react-native-webview";
import axios from "axios";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

import { ref, push, set } from "firebase/database";
import { database } from "../../lib/firebase";

import { router } from "expo-router";

export default function RidePlanScreen() {
  const [origin, setOrigin] = useState<any>(null);
  const [destination, setDestination] = useState<any>(null);
  const [routes, setRoutes] = useState<any[]>([]);
  const [selectedRide, setSelectedRide] = useState<any>(null);
  const [paymentHtml, setPaymentHtml] = useState<string | null>(null);

  // ================= ROUTE =================
  const calculateRoute = async () => {
    if (!origin || !destination) {
      Alert.alert("Error", "Select both locations first");
      return;
    }

    try {
      const res = await axios.get(
        "https://maps.googleapis.com/maps/api/distancematrix/json",
        {
          params: {
            origins: `${origin.lat},${origin.lng}`,
            destinations: `${destination.lat},${destination.lng}`,
            key: process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY,
          },
        }
      );

      const distance = res?.data?.rows?.[0]?.elements?.[0]?.distance?.value;
      if (!distance) return;

      const distKm = distance / 1000;

      setRoutes([
        {
          id: 1,
          name: "Local Private Bus",
          price: Math.round(10 + distKm * 1.5),
          time: `${Math.round(distKm * 2)} mins`,
        },
        {
          id: 2,
          name: "KSRTC Ordinary",
          price: Math.round(8 + distKm * 1.2),
          time: `${Math.round(distKm * 2 + 10)} mins`,
        },
        {
          id: 3,
          name: "Fast Passenger",
          price: Math.round(15 + distKm * 1.8),
          time: `${Math.max(Math.round(distKm * 2 - 10), 10)} mins`,
        },
      ]);
    } catch (err) {
      console.log("❌ ROUTE ERROR:", err);
    }
  };

  // ================= BOOKING =================
  const createBooking = async () => {
    try {
      const bookingRef = ref(database, "bookings");
      const newBooking = push(bookingRef);

      await set(newBooking, {
        userId: "demo_user",
        pickupCoords: origin,
        destinationCoords: destination,
        price: selectedRide.price,
        status: "searching",
        driverId: null,
        createdAt: Date.now(),
      });

      router.push(`/searching?bookingId=${newBooking.key}`);
    } catch (err) {
      console.log("BOOKING ERROR:", err);
    }
  };

  // ================= PAYMENT =================
  const handlePayment = async () => {
    if (!selectedRide) {
      Alert.alert("Select Ride", "Please select a ride first");
      return;
    }

    try {
      const { data } = await axios.post(
        "http://10.33.5.41:5000/api/payment/create-order",
        {
          amount: selectedRide.price,
        }
      );

      const order = data.order;

      const html = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              margin: 0;
              padding-top: ${Platform.OS === "android" ? "50px" : "20px"};
              background-color: #2563EB;
            }
          </style>
        </head>
        <body>
          <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
          <script>
            var options = {
              key: "rzp_test_SeUkDn1LPWqwUS",
              amount: "${order.amount}",
              currency: "INR",
              name: "Chaakra",
              description: "Ride Payment",
              order_id: "${order.id}",
              method: {
                upi: true,
                card: true,
                netbanking: true,
                wallet: true
              },
              handler: function (response) {
                window.ReactNativeWebView.postMessage(JSON.stringify(response));
              },
              theme: { color: "#2563EB" }
            };
            var rzp = new Razorpay(options);
            rzp.open();
          </script>
        </body>
      </html>
      `;

      setPaymentHtml(html);
    } catch (err) {
      console.log("PAYMENT ERROR:", err);
      Alert.alert("Payment Failed ❌");
    }
  };

  // ================= MAP =================
  const mapHTML = `
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
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

      ${origin ? `L.marker([${origin.lat}, ${origin.lng}]).addTo(map);` : ""}
      ${destination ? `L.marker([${destination.lat}, ${destination.lng}]).addTo(map);` : ""}

      ${
        origin && destination
          ? `L.polyline([[${origin.lat}, ${origin.lng}], [${destination.lat}, ${destination.lng}]], {color:'blue'}).addTo(map);`
          : ""
      }
    </script>
  </body>
  </html>
  `;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <StatusBar
        backgroundColor={paymentHtml ? "#2563EB" : "#f8fafc"}
        barStyle={paymentHtml ? "light-content" : "dark-content"}
      />

      {paymentHtml ? (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#2563EB" }}>
          <View
            style={{
              flex: 1,
              paddingTop: Platform.OS === "android" ? 30 : 0,
              backgroundColor: "#2563EB",
            }}
          >
            <WebView
              originWhitelist={["*"]}
              source={{ html: paymentHtml }}
              style={{ flex: 1 }}
              onMessage={() => {
                Alert.alert("Success", "Payment Successful ✅");
                setPaymentHtml(null);
                createBooking();
              }}
            />
          </View>
        </SafeAreaView>
      ) : (
        <>
          <WebView source={{ html: mapHTML }} style={{ flex: 1 }} />

          <View
            style={{
              position: "absolute",
              bottom: 0,
              width: "100%",
              backgroundColor: "#fff",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 18,
              elevation: 20,
            }}
          >
            <Text style={{ fontSize: 22, fontWeight: "700" }}>
              Plan your ride
            </Text>

            <GooglePlacesAutocomplete
              placeholder="From location"
              fetchDetails
              onPress={(data, details = null) => {
                const loc = details?.geometry?.location;
                setOrigin({ lat: loc.lat, lng: loc.lng });
              }}
              query={{
                key: process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY,
                language: "en",
              }}
            />

            <GooglePlacesAutocomplete
              placeholder="Where to?"
              fetchDetails
              onPress={(data, details = null) => {
                const loc = details?.geometry?.location;
                setDestination({ lat: loc.lat, lng: loc.lng });
              }}
              query={{
                key: process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY,
                language: "en",
              }}
            />

            <TouchableOpacity
              style={{
                backgroundColor: "#2563EB",
                padding: 14,
                borderRadius: 14,
                marginTop: 10,
                alignItems: "center",
              }}
              onPress={calculateRoute}
            >
              <Text style={{ color: "#fff" }}>Search Ride</Text>
            </TouchableOpacity>

            <FlatList
              data={routes}
              keyExtractor={(item) => item.id.toString()}
              style={{ marginTop: 10, maxHeight: 200 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => setSelectedRide(item)}
                  style={{
                    backgroundColor:
                      selectedRide?.id === item.id
                        ? "#dbeafe"
                        : "#f1f5f9",
                    padding: 14,
                    borderRadius: 14,
                    marginTop: 8,
                  }}
                >
                  <Text style={{ fontWeight: "600" }}>{item.name}</Text>
                  <Text>{item.time}</Text>
                  <Text style={{ color: "#2563EB", fontWeight: "700" }}>
                    ₹{item.price}
                  </Text>
                </TouchableOpacity>
              )}
            />

            {selectedRide && (
              <TouchableOpacity
                style={{
                  backgroundColor: "#111",
                  padding: 14,
                  borderRadius: 14,
                  marginTop: 10,
                  alignItems: "center",
                }}
                onPress={handlePayment}
              >
                <Text style={{ color: "#fff" }}>
                  Pay ₹{selectedRide.price}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      )}
    </SafeAreaView>
  );
}