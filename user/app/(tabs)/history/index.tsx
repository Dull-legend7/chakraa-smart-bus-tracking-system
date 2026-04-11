import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import styles from "@/screens/home/styles";
import color from "@/themes/app.colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { windowHeight } from "@/themes/app.constant";

export default function History() {
  const [recentRides, setRecentRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ BUS-ONLY DUMMY DATA (REALISTIC)
  const dummyRides = [
    {
      from: "Kollam KSRTC Stand",
      to: "Trivandrum Central",
      price: 140,
      date: "Today, 10:30 AM",
      distance: "64 km",
      type: "KSRTC Fast",
    },
    {
      from: "Technopark",
      to: "Kazhakootam",
      price: 45,
      date: "Today, 8:15 AM",
      distance: "6 km",
      type: "Private Bus",
    },
    {
      from: "Varkala",
      to: "Attingal",
      price: 60,
      date: "Yesterday",
      distance: "18 km",
      type: "Private Bus",
    },
    {
      from: "Kollam",
      to: "Ernakulam",
      price: 220,
      date: "3 days ago",
      distance: "130 km",
      type: "KSRTC Super Fast",
    },
    {
      from: "Trivandrum",
      to: "Varkala",
      price: 90,
      date: "Last week",
      distance: "40 km",
      type: "Private Bus",
    },
    {
      from: "Attingal",
      to: "Kollam",
      price: 110,
      date: "Last week",
      distance: "50 km",
      type: "KSRTC Ordinary",
    },
  ];

  const getRecentRides = async () => {
    try {
      const accessToken = await AsyncStorage.getItem("accessToken");

      const res = await axios.get(
        `${process.env.EXPO_PUBLIC_SERVER_URI}/get-rides`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // ✅ filter only bus rides (if backend sends mixed data)
      const busRides =
        res.data?.rides?.filter(
          (ride: any) =>
            ride.type?.toLowerCase().includes("bus") ||
            ride.type?.toLowerCase().includes("ksrtc")
        ) || [];

      if (busRides.length === 0) {
        setRecentRides(dummyRides);
      } else {
        setRecentRides(busRides);
      }
    } catch (error) {
      console.log("Ride history error:", error);

      // fallback
      setRecentRides(dummyRides);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getRecentRides();
  }, []);

  return (
    <View
      style={[
        styles.rideContainer,
        {
          backgroundColor: color.lightGray,
          paddingTop: windowHeight(40),
        },
      ]}
    >
      {/* HEADER */}
      <Text
        style={[
          styles.rideTitle,
          {
            color: color.primaryText,
            fontWeight: "700",
            fontSize: 26,
            marginBottom: 15,
          },
        ]}
      >
        Bus Ride History
      </Text>

      {/* LOADING */}
      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {recentRides.length === 0 ? (
            <View style={{ marginTop: 50, alignItems: "center" }}>
              <Text style={{ fontSize: 16, color: "gray" }}>
                No bus rides yet 🚍
              </Text>
            </View>
          ) : (
            recentRides.map((item: any, index: number) => (
              <View
                key={index}
                style={{
                  backgroundColor: "#fff",
                  marginBottom: 12,
                  borderRadius: 15,
                  padding: 15,
                  shadowColor: "#000",
                  shadowOpacity: 0.05,
                  shadowRadius: 5,
                  elevation: 2,
                }}
              >
                {/* TOP ROW */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ fontWeight: "600", fontSize: 16 }}>
                    🚍 {item.type || "Bus"}
                  </Text>

                  <Text
                    style={{
                      color: "#2563EB",
                      fontWeight: "700",
                      fontSize: 16,
                    }}
                  >
                    ₹{item.price || 0}
                  </Text>
                </View>

                {/* ROUTE */}
                <Text style={{ marginTop: 8, fontSize: 15 }}>
                  {item.from || "Unknown"} → {item.to || "Unknown"}
                </Text>

                {/* DETAILS */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginTop: 8,
                  }}
                >
                  <Text style={{ color: "gray" }}>
                    {item.distance || "--"}
                  </Text>
                  <Text style={{ color: "gray" }}>
                    {item.date || "Recently"}
                  </Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}