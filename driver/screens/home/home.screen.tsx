import React, { useState, useEffect, useRef } from "react";

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

import { ref, onValue } from "firebase/database";
import { database } from "@/configs/firebase";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

/* 🔥 DASHBOARD */
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
    currentLocationName: "Kazhakootam",
    destinationLocationName: "Technopark",
  },
   {
    id: "2",
    user: { name: "Anjali" },
    charge: 180,
    distance: "8 km",
    createdAt: "2026-04-05",
    currentLocationName: "Kollam",
    destinationLocationName: "Paravur",
  },
  {
    id: "3",
    user: { name: "Arjun" },
    charge: 320,
    distance: "15 km",
    createdAt: "2026-04-06",
    currentLocationName: "Attingal",
    destinationLocationName: "Trivandrum",
  },
  {
    id: "4",
    user: { name: "Sneha" },
    charge: 140,
    distance: "6 km",
    createdAt: "2026-04-07",
    currentLocationName: "Varkala",
    destinationLocationName: "Kallambalam",
  },
  {
    id: "5",
    user: { name: "Vishnu" },
    charge: 290,
    distance: "13 km",
    createdAt: "2026-04-08",
    currentLocationName: "Technopark",
    destinationLocationName: "Kazhakootam",
  },
  {
    id: "6",
    user: { name: "Meera" },
    charge: 210,
    distance: "10 km",
    createdAt: "2026-04-09",
    currentLocationName: "Pattom",
    destinationLocationName: "Palayam",
  },
];


export default function HomeScreen() {
  const { colors } = useTheme();

  const [isOn, setIsOn] = useState(false);
  const shownBookingIdRef = useRef<string | null>(null);

  const { driver } = useGetDriverData();

  // 📊 GRAPH STATE
const [earnings, setEarnings] = useState<number[]>([]);
const [labels, setLabels] = useState<string[]>([]);
const screenWidth = Dimensions.get("window").width;

  /* 🔥 LOAD ONLINE STATUS */
  useEffect(() => {
    const loadStatus = async () => {
      const saved = await AsyncStorage.getItem("driverOnline");
      if (saved !== null) {
        setIsOn(JSON.parse(saved));
      }
    };
    loadStatus();
  }, []);

  /* 🔥 FIREBASE LISTENER */
  useEffect(() => {
    console.log("🔥 DRIVER LISTENER ACTIVE (HOME SCREEN)");

    if (!isOn) return; // ❗ only when online

    const bookingsRef = ref(database, "bookings");

    const unsubscribe = onValue(bookingsRef, (snapshot) => {
      console.log("📡 SNAPSHOT TRIGGERED (HOME)");

      const data = snapshot.val();
      if (!data) return;

      const entries = Object.entries(data);

      entries.forEach(([id, val]: any) => {
        if (!val || typeof val !== "object") return;

        console.log("🔍 BOOKING (HOME):", id, val?.status);

        if (val?.status === "searching") {
          if (shownBookingIdRef.current === id) return;

          shownBookingIdRef.current = id;

          // ❌ POPUP REMOVED — handled in layout.tsx
          console.log("🚫 HomeScreen ignored popup for:", id);

          // reset so future updates still process
          setTimeout(() => {
            shownBookingIdRef.current = null;
          }, 2000);
        }
      });
    });

    return () => unsubscribe();
  }, [isOn]);

  /* 📊 EARNINGS GRAPH LISTENER */
useEffect(() => {
  const earningsRef = ref(database, "drivers/driver1/earningsHistory");

  const unsubscribe = onValue(earningsRef, (snapshot) => {
    const data = snapshot.val();

    if (!data) {
      setEarnings([]);
      setLabels([]);
      return;
    }

    const values = Object.values(data) as any[];

    values.sort((a, b) => (a?.timestamp || 0) - (b?.timestamp || 0));

    let total = 0;
    const graphData: number[] = [];
    const graphLabels: string[] = [];

    values.forEach((item, i) => {
      const amount = item?.amount || 0;
      total += amount;
      graphData.push(total);
      graphLabels.push((i + 1).toString());
    });

    // 👇 ADD THIS EXACTLY HERE
    console.log("📊 GRAPH DATA:", graphData);

    setEarnings(graphData);
    setLabels(graphLabels);
  });

  return () => unsubscribe();
}, []);

  /* 🔥 TOGGLE */
  const toggleSwitch = async () => {
    const newValue = !isOn;
    setIsOn(newValue);

    await AsyncStorage.setItem("driverOnline", JSON.stringify(newValue));

    console.log("🟢 Driver Online:", newValue);
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <Header isOn={isOn} toggleSwitch={toggleSwitch} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* DASHBOARD */}
        <View style={styles.grid}>
          {dashboardData.map((item, index) => (
            <View key={index} style={styles.cardWrapper}>
              <RenderRideItem item={item} colors={colors} driver={driver} />
            </View>
          ))}
        </View>

        {/* 📊 EARNINGS GRAPH */}
        
<View style={styles.graphContainer}>
  <Text style={styles.graphTitle}>📊 Earnings Trend</Text>

  <LineChart
  data={{
    labels: labels.length ? labels : ["1"],
    datasets: [
      {
        data: earnings.length ? earnings : [0],
      },
    ],
  }}
  width={screenWidth - 32}
  height={220}
  yAxisLabel="₹ "
  yLabelsOffset={20}
  fromZero
  bezier
  withDots
  withInnerLines
  withVerticalLines
  withHorizontalLines

  chartConfig={{
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,

    color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
    labelColor: () => "#333",

    fillShadowGradient: "#3B82F6",
    fillShadowGradientOpacity: 0.2,

    propsForDots: {
      r: "5",
      strokeWidth: "2",
      stroke: "#3B82F6",
    },

    propsForBackgroundLines: {
      strokeDasharray: "4",
      stroke: "#e5e7eb",
    },
  }}

  style={{
    borderRadius: 16,
    marginLeft: -20,
    paddingLeft: 10,
  }}
/>

  <Text
    style={{
      textAlign: "center",
      marginTop: 8,
      color: "#666",
      fontSize: 12,
    }}
  >
    Rides / Time
  </Text>
</View>
        {/* RECENT RIDES */}
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

  graphContainer: {
  marginHorizontal: 12,
  marginTop: 15,
  backgroundColor: "#fff",
  borderRadius: 16,
  padding: 12,

  shadowColor: "#000",
  shadowOpacity: 0.05,
  shadowRadius: 8,
  elevation: 3,
},

graphTitle: {
  fontSize: 18,
  fontWeight: "600",
  marginBottom: 10,
},
});