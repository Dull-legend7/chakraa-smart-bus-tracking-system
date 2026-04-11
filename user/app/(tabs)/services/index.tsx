import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import React from "react";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { router } from "expo-router";

export default function Services() {
  const services = [
    {
      name: "Bus",
      icon: "directions-bus",
      type: "MaterialIcons",
      route: "/(tabs)/track",
    },
    {
      name: "Auto",
      icon: "auto-awesome",
      type: "MaterialIcons",
      route: "/(tabs)/rideplan",
    },
    {
      name: "Taxi",
      icon: "taxi",
      type: "FontAwesome5",
      route: "/(tabs)/rideplan",
    },
    {
      name: "Bike",
      icon: "motorcycle",
      type: "FontAwesome5",
      route: "/(tabs)/rideplan",
    },
  ];

  const renderIcon = (item: any) => {
    if (item.type === "MaterialIcons") {
      return <MaterialIcons name={item.icon} size={32} color="#2563EB" />;
    }
    return <FontAwesome5 name={item.icon} size={26} color="#2563EB" />;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar barStyle="dark-content" />

      {/* ✅ FIXED HEADER SPACING */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 10,
        }}
      >
        <Text
          style={{
            fontSize: 28,
            fontWeight: "700",
          }}
        >
          Services
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20 }}
      >
        {/* GRID */}
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}
        >
          {services.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => router.push(item.route as any)}
              style={{
                width: "47%",
                backgroundColor: "#f5f5f5",
                borderRadius: 18,
                paddingVertical: 25,
                marginBottom: 15,
                alignItems: "center",
              }}
            >
              {renderIcon(item)}
              <Text
                style={{
                  marginTop: 10,
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* QUICK ACTIONS */}
        <Text
          style={{
            fontSize: 20,
            fontWeight: "600",
            marginTop: 10,
          }}
        >
          Quick Actions
        </Text>

        <View style={{ marginTop: 10 }}>
          <TouchableOpacity
            style={card}
            onPress={() => router.push("/(tabs)/track")}
          >
            <Text style={title}>Nearby Bus Stops</Text>
            <Text style={desc}>Find stops near your location</Text>
          </TouchableOpacity>

          <TouchableOpacity style={card}>
            <Text style={title}>Saved Routes</Text>
            <Text style={desc}>Access your frequent routes quickly</Text>
          </TouchableOpacity>

          {/* ✅ NEW NAVIGATION */}
          <TouchableOpacity
            style={card}
            onPress={() => router.push("/fare")}
          >
            <Text style={title}>Fare Estimator</Text>
            <Text style={desc}>Estimate ticket prices before travel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const card = {
  backgroundColor: "#f5f5f5",
  padding: 16,
  borderRadius: 14,
  marginBottom: 12,
};

const title = {
  fontSize: 16,
  fontWeight: "600",
};

const desc = {
  fontSize: 13,
  color: "gray",
};