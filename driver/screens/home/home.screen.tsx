import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from "react-native";

import Header from "@/components/common/header";
import { useTheme } from "@react-navigation/native";
import RenderRideItem from "@/components/ride/render.ride.item";
import RideCard from "@/components/ride/ride.card";
import { useGetDriverData } from "@/hooks/useGetDriverData";

/* 🔥 DASHBOARD STRUCTURE ONLY (NO VALUES HERE) */
const dashboardData = [
  { id: "1", title: "Total Earning" },
  { id: "2", title: "Complete Ride" },
  { id: "3", title: "Pending Ride" },
  { id: "4", title: "Cancel Ride" },
];

/* 🔥 DUMMY RIDES */
const dummyRides = [
  {
    id: "1",
    user: { name: "Rahul" },
    charge: 250,
    distance: "12 km",
    createdAt: "2026-04-04",
    currentLocationName: "Kazhakoottam",
    destinationLocationName: "Technopark",
  },
  {
    id: "2",
    user: { name: "Anjali" },
    charge: 180,
    distance: "8 km",
    createdAt: "2026-04-03",
    currentLocationName: "Pattom",
    destinationLocationName: "Medical College",
  },
];

export default function HomeScreen() {
  const { colors } = useTheme();
  const [isOn, setIsOn] = useState(false);

  // ✅ FIREBASE + API DATA
  const { driver } = useGetDriverData();

  return (
    <View style={styles.container}>
      
      {/* HEADER */}
      <Header isOn={isOn} toggleSwitch={() => setIsOn(!isOn)} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >

        {/* 🔥 DASHBOARD (LIVE DATA) */}
        <View style={styles.grid}>
          {dashboardData.map((item, index) => (
            <View key={index} style={styles.cardWrapper}>
              <RenderRideItem
                item={item}
                colors={colors}
                driver={driver}   // ✅ IMPORTANT FIX
              />
            </View>
          ))}
        </View>

        {/* 🔥 RECENT RIDES */}
        <View
          style={[
            styles.recentContainer,
            { backgroundColor: colors.card },
          ]}
        >
          <Text style={[styles.title, { color: colors.text }]}>
            Recent Rides
          </Text>

          {dummyRides.map((ride, index) => (
            <RideCard item={ride} key={index} />
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

/* 🔥 STYLES */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
  },

  scroll: {
    paddingTop: 20,
    paddingBottom: 20,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },

  cardWrapper: {
    width: "48%",
    marginBottom: 12,
  },

  recentContainer: {
    marginHorizontal: 12,
    marginTop: 10,
    borderRadius: 16,
    padding: 14,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
});