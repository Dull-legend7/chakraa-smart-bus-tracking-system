import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

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

/* 🔥 PROFESSIONAL DUMMY RIDES (10+) */
const dummyRides = [
  {
    id: "1",
    user: { name: "Rahul" },
    charge: 250,
    distance: "12 km",
    createdAt: "2026-04-04",
    currentLocationName: "Kazhakootam",
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
  {
    id: "3",
    user: { name: "Arjun" },
    charge: 320,
    distance: "15 km",
    createdAt: "2026-04-02",
    currentLocationName: "Kowdiar",
    destinationLocationName: "Airport",
  },
  {
    id: "4",
    user: { name: "Neha" },
    charge: 210,
    distance: "9 km",
    createdAt: "2026-04-01",
    currentLocationName: "Attingal",
    destinationLocationName: "Kazhakootam",
  },
  {
    id: "5",
    user: { name: "Vikram" },
    charge: 300,
    distance: "18 km",
    createdAt: "2026-03-31",
    currentLocationName: "Varkala",
    destinationLocationName: "Kollam",
  },
  {
    id: "6",
    user: { name: "Sneha" },
    charge: 170,
    distance: "7 km",
    createdAt: "2026-03-30",
    currentLocationName: "Technopark",
    destinationLocationName: "Sreekaryam",
  },
  {
    id: "7",
    user: { name: "Rohit" },
    charge: 260,
    distance: "11 km",
    createdAt: "2026-03-29",
    currentLocationName: "Kazhakootam",
    destinationLocationName: "Pattom",
  },
  {
    id: "8",
    user: { name: "Divya" },
    charge: 190,
    distance: "6 km",
    createdAt: "2026-03-28",
    currentLocationName: "Ulloor",
    destinationLocationName: "Medical College",
  },
  {
    id: "9",
    user: { name: "Kiran" },
    charge: 350,
    distance: "20 km",
    createdAt: "2026-03-27",
    currentLocationName: "Attingal",
    destinationLocationName: "Trivandrum Central",
  },
  {
    id: "10",
    user: { name: "Meera" },
    charge: 230,
    distance: "10 km",
    createdAt: "2026-03-26",
    currentLocationName: "Kazhakootam",
    destinationLocationName: "Veli",
  },
];

export default function HomeScreen() {
  const { colors } = useTheme();

  const [isOn, setIsOn] = useState(false);

  // ✅ FIREBASE + API DATA
  const { driver } = useGetDriverData();

  /* 🔥 LOAD SAVED ONLINE STATUS */
  useEffect(() => {
    const loadStatus = async () => {
      const saved = await AsyncStorage.getItem("driverOnline");
      if (saved !== null) {
        setIsOn(JSON.parse(saved));
      }
    };
    loadStatus();
  }, []);

  /* 🔥 TOGGLE FUNCTION */
  const toggleSwitch = async () => {
    const newValue = !isOn;
    setIsOn(newValue);

    await AsyncStorage.setItem("driverOnline", JSON.stringify(newValue));

    console.log("🟢 Driver Online Status:", newValue);
  };

  return (
    <View style={styles.container}>
      
      {/* HEADER */}
      <Header isOn={isOn} toggleSwitch={toggleSwitch} />

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
                driver={driver}
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