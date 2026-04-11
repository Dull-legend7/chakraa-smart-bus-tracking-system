import { Home } from "@/assets/icons/home";
import { HomeLight } from "@/assets/icons/homeLight";
import { Person } from "@/assets/icons/person";
import { History } from "@/assets/icons/history";
import { Ionicons } from "@expo/vector-icons"; // for MAP icon
import color from "@/themes/app.colors";
import { Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 60,
          paddingBottom: 5,
        },

        tabBarIcon: ({ focused }) => {
          let icon;

          // ✅ HOME
          if (route.name === "home") {
            icon = focused ? (
              <Home colors={color.buttonBg} width={24} height={24} />
            ) : (
              <HomeLight />
            );
          }

          // ✅ MAP (NEW 🔥)
          else if (route.name === "map") {
            icon = (
              <Ionicons
                name="map"
                size={26}
                color={focused ? color.buttonBg : "#8F8F8F"}
              />
            );
          }

          // ✅ HISTORY
          else if (route.name === "rides/index") {
            icon = (
              <History
                colors={focused ? color.buttonBg : "#8F8F8F"}
              />
            );
          }

          // ✅ PROFILE
          else if (route.name === "profile/index") {
            icon = (
              <Person
                fill={focused ? color.buttonBg : "#8F8F8F"}
              />
            );
          }

          return icon;
        },
      })}
    >
      {/* HOME */}
      <Tabs.Screen name="home" />

      {/* MAP 🔥 */}
      <Tabs.Screen name="map" />

      {/* HISTORY */}
      <Tabs.Screen name="rides/index" />

      {/* PROFILE */}
      <Tabs.Screen name="profile/index" />
    </Tabs>
  );
}