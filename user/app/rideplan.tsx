import { View, Text, SafeAreaView } from "react-native";
import React from "react";

export default function RidePlan() {
  return (
    <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 22, fontWeight: "600" }}>
        Ride Plan Screen 🚗
      </Text>
      <Text style={{ marginTop: 10 }}>
        This is where route planning will happen
      </Text>
    </SafeAreaView>
  );
}