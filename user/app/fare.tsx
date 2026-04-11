import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import axios from "axios";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

export default function FareScreen() {
  const [origin, setOrigin] = useState<any>(null);
  const [destination, setDestination] = useState<any>(null);

  const [distance, setDistance] = useState<string | null>(null);
  const [fare, setFare] = useState<any>(null);

  const calculateFare = async () => {
    if (!origin || !destination) return;

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

      const element = res?.data?.rows?.[0]?.elements?.[0];

      if (!element || element.status !== "OK") return;

      const distanceKm = element.distance.value / 1000;
      setDistance(distanceKm.toFixed(2));

      // 🔥 Realistic Kerala pricing
      const busFare = Math.round(10 + distanceKm * 2);
      const autoFare = Math.round(30 + distanceKm * 10);
      const taxiFare = Math.round(80 + distanceKm * 18);

      setFare({
        bus: busFare,
        auto: autoFare,
        taxi: taxiFare,
      });
    } catch (error) {
      console.log("Fare error:", error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff", paddingTop: 10 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ padding: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* ✅ FIXED HEADER */}
          <View style={{ paddingTop: 5, marginBottom: 10 }}>
            <Text style={{ fontSize: 26, fontWeight: "700" }}>
              Fare Estimator
            </Text>
          </View>

          {/* FROM */}
          <View style={{ marginTop: 10, zIndex: 2 }}>
            <GooglePlacesAutocomplete
              placeholder="From location"
              fetchDetails
              onPress={(data, details: any = null) => {
                if (!details) return;
                setOrigin({
                  lat: details.geometry.location.lat,
                  lng: details.geometry.location.lng,
                });
              }}
              query={{
                key: process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY!,
                language: "en",
              }}
              styles={autoStyles}
            />
          </View>

          {/* TO */}
          <View style={{ marginTop: 10, zIndex: 1 }}>
            <GooglePlacesAutocomplete
              placeholder="To destination"
              fetchDetails
              onPress={(data, details: any = null) => {
                if (!details) return;
                setDestination({
                  lat: details.geometry.location.lat,
                  lng: details.geometry.location.lng,
                });
              }}
              query={{
                key: process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY!,
                language: "en",
              }}
              styles={autoStyles}
            />
          </View>

          {/* BUTTON */}
          <TouchableOpacity style={button} onPress={calculateFare}>
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}>
              Calculate Fare
            </Text>
          </TouchableOpacity>

          {/* RESULT */}
          {fare && (
            <View style={resultCard}>
              <Text style={{ fontSize: 16 }}>
                Distance: {distance} km
              </Text>

              <Text style={fareText}>🚌 Bus: ₹{fare.bus}</Text>
              <Text style={fareText}>🛺 Auto: ₹{fare.auto}</Text>
              <Text style={fareText}>🚕 Taxi: ₹{fare.taxi}</Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const autoStyles = {
  container: {
    flex: 0,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
  },
};

const button = {
  backgroundColor: "#2563EB",
  padding: 16,
  borderRadius: 12,
  alignItems: "center" as const,
  marginTop: 15,
};

const resultCard = {
  marginTop: 20,
  padding: 18,
  borderRadius: 14,
  backgroundColor: "#f5f5f5",
};

const fareText = {
  marginTop: 6,
  fontSize: 16,
  fontWeight: "600" as const,
};