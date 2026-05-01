declare const process: {
  env: {
    EXPO_PUBLIC_SERVER_URI: string;
    EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY: string;
  };
};

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

import { WebView } from "react-native-webview";
import axios from "axios";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

import { ref, push, set, get, update } from "firebase/database";
import { database } from "../../lib/firebase";

import { router } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
import polyline from "@mapbox/polyline";


import { activateKeepAwakeAsync } from "expo-keep-awake";


export default function RidePlanScreen() {
  const [origin, setOrigin] = useState<any>(null);
  const [destination, setDestination] = useState<any>(null);
  const [routes, setRoutes] = useState<any[]>([]);
  const [selectedRide, setSelectedRide] = useState<any>(null);
  const [paymentHtml, setPaymentHtml] = useState<string | null>(null);
  const [currentBookingId, setCurrentBookingId] = useState<string | null>(null);
  const params = useLocalSearchParams();
  const [routeCoords, setRouteCoords] = useState<string | null>(null);
  const [mapKey, setMapKey] = useState(0);


  useEffect(() => {
  const keepAwake = async () => {
    try {
      const { activateKeepAwakeAsync } = await import("expo-keep-awake");
      await activateKeepAwakeAsync();
      console.log("🔥 KEEP AWAKE ACTIVATED");
    } catch (e) {
      console.log("❌ KEEP AWAKE ERROR:", e);
    }
  };

  keepAwake();
}, []);

  // ================= ROUTE =================


useEffect(() => {
  const fetchCoords = async () => {
    if (params.from && params.to && !origin && !destination) {
      console.log("🚀 FETCHING REAL COORDS");

      const res1 = await axios.get(
        "https://maps.googleapis.com/maps/api/geocode/json",
        {
          params: {
            address: params.from,
            key: process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY,
          },
        }
      );

      const res2 = await axios.get(
        "https://maps.googleapis.com/maps/api/geocode/json",
        {
          params: {
            address: params.to,
            key: process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY,
          },
        }
      );

      const fromLoc = res1.data.results[0]?.geometry.location;
      const toLoc = res2.data.results[0]?.geometry.location;

      if (!fromLoc || !toLoc) return;

      setOrigin({
        lat: fromLoc.lat,
        lng: fromLoc.lng,
        description: params.from,
      });

      setDestination({
        lat: toLoc.lat,
        lng: toLoc.lng,
        description: params.to,
      });
    }
  };

  fetchCoords();
}, [params]);

const addMinutes = (time: string, extra: number) => {
  const mins = extractMinutes(time) + extra;
  return `${mins} mins`;
};

const reduceMinutes = (time: string, reduce: number) => {
  const mins = Math.max(extractMinutes(time) - reduce, 5);
  return `${mins} mins`;
};

const extractMinutes = (time: string) => {
  const hours = time.match(/(\d+)\s*hour/)?.[1];
  const mins = time.match(/(\d+)\s*min/)?.[1];

  return (Number(hours || 0) * 60) + Number(mins || 0);
};

  const calculateRoute = async () => {
    if (!origin || !destination) {
      Alert.alert("Error", "Select both locations first");
      return;
    }

      // 🔥 ADD THIS


    console.log("📍 ORIGIN:", origin);
    console.log("📍 DEST:", destination);

    try {
      const res = await axios.get(
        "https://maps.googleapis.com/maps/api/directions/json",
        {
          params: {
            origin: `${origin.lat},${origin.lng}`,
            destination: `${destination.lat},${destination.lng}`,
            mode: "driving", // 🔥 ADD THIS
            key: process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY,
          },
        }
      );
console.log("🧠 FULL DIRECTIONS RESPONSE:", res.data);

const route = res.data.routes[0];

const overviewPolyline = route?.overview_polyline?.points;

if (!overviewPolyline) {
  console.log("❌ NO OVERVIEW POLYLINE");
  setRouteCoords(null);
  return;
}

console.log("✅ USING OVERVIEW POLYLINE");

if (!route) {
  console.log("❌ NO ROUTE FOUND — USING FALLBACK");

  setRouteCoords(null);

  setRoutes([
    {
      id: 1,
      name: "Local Bus",
      price: 80,
      time: "30 mins",
    },
  ]);

  return;
}
const leg = route.legs[0];




if (!overviewPolyline || overviewPolyline.length < 20) {
  console.log("❌ INVALID POLYLINE");
  setRouteCoords(null);
  return;
}

console.log("✅ POLYLINE RECEIVED (OVERVIEW)");

const decodedCoords = polyline.decode(overviewPolyline).map(
  ([lat, lng]: [number, number]) => ({
    lat,
    lng,
  })
);

setRouteCoords(JSON.stringify(decodedCoords));
setMapKey(prev => prev + 1);

if (!leg || !leg.distance || !leg.duration) {
  console.log("❌ INVALID ROUTE DATA");
  setRoutes([]);
  return;
}

const distance = leg.distance.value;
const duration = leg.duration.text;

const distKm = distance / 1000;

// 🔥 ADD THIS LINE ALSO

    setRoutes([
  {
    id: 1,
    name: "Local Private Bus",
    price: Math.round(10 + distKm * 1.5),
    time: duration, // ✅ REAL TIME
  },
  {
    id: 2,
    name: "KSRTC Ordinary",
    price: Math.round(8 + distKm * 1.2),
    time: addMinutes(duration, 10), // slightly slower,
  },
  {
    id: 3,
    name: "Fast Passenger",
    price: Math.round(15 + distKm * 1.8),
    time: reduceMinutes(duration, 15), // faster
  },
]);
    } catch (err) {
      console.log("❌ ROUTE ERROR:", err);
    }
  };



useEffect(() => {
  if (!origin || !destination) return;

calculateRoute();
}, [origin?.lat, origin?.lng, destination?.lat, destination?.lng]);

useEffect(() => {
  console.log("🔥 ROUTES SET:", routes);
}, [routes]);

  // ================= BOOKING =================
 const createBooking = async () => {
  try {
    const bookingRef = ref(database, "bookings");
    const newBooking = push(bookingRef);

    

    await set(newBooking, {
      userId: "demo_user",
      source: "user_app",
      pickupCoords: origin,
      destinationCoords: destination,

      // 🔥 ADD THIS
      from: origin?.description || "Unknown",
      to: destination?.description || "Unknown",
      
      price: selectedRide?.price || 0,
      status: "searching",
      driverId: null,
      createdAt: Date.now(),
    });
    // ✅ MOVE THIS HERE (AFTER set)
    setCurrentBookingId(newBooking.key);

    console.log("BOOKING PRICE:", selectedRide?.price);

    const driverRef = ref(database, "drivers/driver1");
    const snapshot = await get(driverRef);
    const driverData = snapshot.val() || {};

    console.log("🔥 DRIVER BEFORE:", driverData);

    await update(driverRef, {
      totalEarning:
        (driverData.totalEarning || 0) + (selectedRide?.price || 0),
      totalRides: (driverData.totalRides || 0) + 1,
    });

    await push(ref(database, "drivers/driver1/earningsHistory"), {
  amount: selectedRide?.price || 0,
  type: "booking",
  timestamp: Date.now(),
});



    console.log("🔥 DRIVER UPDATED");

    // ✅ MUST BE HERE
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
      console.log(
        "API:",
        "http://10.24.28.41:5000/api/payment/create-order",
      );

      const { data } = await axios.post(
        "http://10.24.28.41:5000/api/payment/create-order",
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
window.onerror = function(e) {
  console.log("🔥 JS ERROR:", e);
};
console.log("🚀 SCRIPT STARTED");
          
try {
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
            } catch (e) {
  console.log("🔥 MAP CRASH:", e);
}
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
    body { margin:0; padding:0; }
    #map { height:100vh; width:100vw; }
  </style>
</head>
<body>
<div id="map"></div>

<script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>

<script>
(function() {

  function sendLog() {
    try {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ type: "log", data: Array.from(arguments) })
      );
    } catch(e){}
    console.log.apply(console, arguments);
  }

  sendLog("🚀 SCRIPT STARTED");

  var mapDiv = document.getElementById("map");
  if (!mapDiv) {
    console.log("❌ MAP DIV NOT FOUND");
    return;
  }

  sendLog("🟢 MAP DIV FOUND");

  var map = L.map('map');

if (${origin && destination ? "true" : "false"}) {
  map.setView([${origin?.lat || 8.6}, ${origin?.lng || 76.8}], 10);
} else {
  map.setView([8.6, 76.8], 10); // Kerala default
}

  sendLog("🗺️ MAP INITIALIZED");

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
  }).addTo(map);

  var origin = [${origin?.lat || 8.6}, ${origin?.lng || 76.8}];
  var destination = [${destination?.lat || 8.7}, ${destination?.lng || 76.9}];

var hasOrigin = ${origin ? "true" : "false"};
var hasDestination = ${destination ? "true" : "false"};

if (hasOrigin) {
  L.marker([${origin?.lat || 0}, ${origin?.lng || 0}]).addTo(map);
}

if (hasDestination) {
  L.marker([${destination?.lat || 0}, ${destination?.lng || 0}]).addTo(map);
}

  var coords = ${routeCoords || "[]"};

  sendLog("📦 COORD COUNT:", coords.length);

if (coords && coords.length > 2) {

  var latlngs = coords.map(function(c) {
    return [c.lat, c.lng];
  });

  sendLog("📍 FIRST:", latlngs[0]);
  sendLog("📍 LAST:", latlngs[latlngs.length - 1]);

  var line = L.polyline(latlngs, {
    color: "#2563EB",
    weight: 5
  }).addTo(map);

  map.fitBounds(line.getBounds(), { padding: [50, 50] });

  sendLog("🗺️ ROUTE DRAWN");

} else {
  sendLog("⚠️ NO VALID COORDS");
  map.fitBounds([origin, destination]);
}






})();
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
          <View style={{ flex: 1, paddingTop: Platform.OS === "android" ? 30 : 0 }}>
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
<WebView
  key={`map-${mapKey}`}
  originWhitelist={["*"]}
  javaScriptEnabled={true}
  domStorageEnabled={true}
  cacheEnabled={false}
  mixedContentMode="always"
  allowFileAccess={true}
  source={{ html: mapHTML }}
  style={{ flex: 1 }}

  injectedJavaScript={`
    (function() {
      window.ReactNativeWebView.postMessage("🚀 INJECTED JS RUNNING");
    })();
  `}

  onMessage={(event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "log") {
        console.log("🌐 WEBVIEW:", ...data.data);
      }
    } catch {
      console.log("🌐 RAW:", event.nativeEvent.data);
    }
  }}
/>


          <View style={{ position: "absolute", bottom: 0, width: "100%", backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 18 }}>
            <Text style={{ fontSize: 22, fontWeight: "700" }}>
              Plan your ride
            </Text>

            <GooglePlacesAutocomplete
              placeholder="From location"
              fetchDetails
              onPress={(data, details = null) => {
                const loc = details?.geometry?.location;
                setOrigin({
  lat: loc.lat,
  lng: loc.lng,
  description: data.description,
});

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
                setDestination({
  lat: loc.lat,
  lng: loc.lng,
  description: data.description,
});

              }}
              query={{
                key: process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY,
                language: "en",
              }}
            />

            <TouchableOpacity
              style={{ backgroundColor: "#2563EB", padding: 14, borderRadius: 14, marginTop: 10, alignItems: "center" }}
onPress={() => {
  if (!origin || !destination) {
    Alert.alert("Error", "Select both locations");
    return;
  }

  // 🔥 prevent double call
calculateRoute();
}}
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
                      selectedRide?.id === item.id ? "#dbeafe" : "#f1f5f9",
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
              <>
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

             
              
              </>
            )}
          </View>
        </>
      )}
    </SafeAreaView>
  );
}