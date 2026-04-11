import { View, Text, StyleSheet, FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import RideCard from "@/components/ride/ride.card";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useTheme } from "@react-navigation/native";
import fonts from "@/themes/app.fonts";

// 🔥 10 DUMMY RIDES
const dummyRides = [
  { id: "1", user: { name: "Rahul" }, charge: 250, distance: "12 km", currentLocationName: "Kazhakootam", destinationLocationName: "Technopark", createdAt: "2025-04-01" },
  { id: "2", user: { name: "Anjali" }, charge: 180, distance: "8 km", currentLocationName: "Pattom", destinationLocationName: "Medical College", createdAt: "2025-04-02" },
  { id: "3", user: { name: "Arjun" }, charge: 320, distance: "15 km", currentLocationName: "Kowdiar", destinationLocationName: "Lulu Mall", createdAt: "2025-04-03" },
  { id: "4", user: { name: "Sneha" }, charge: 210, distance: "10 km", currentLocationName: "Vattiyoorkavu", destinationLocationName: "East Fort", createdAt: "2025-04-04" },
  { id: "5", user: { name: "Kiran" }, charge: 400, distance: "20 km", currentLocationName: "Neyyattinkara", destinationLocationName: "Airport", createdAt: "2025-04-05" },
  { id: "6", user: { name: "Meera" }, charge: 150, distance: "6 km", currentLocationName: "Poojappura", destinationLocationName: "Thampanoor", createdAt: "2025-04-06" },
  { id: "7", user: { name: "Vishnu" }, charge: 275, distance: "13 km", currentLocationName: "Sreekaryam", destinationLocationName: "Infosys", createdAt: "2025-04-07" },
  { id: "8", user: { name: "Akhil" }, charge: 190, distance: "9 km", currentLocationName: "Kesavadasapuram", destinationLocationName: "PMG", createdAt: "2025-04-08" },
  { id: "9", user: { name: "Divya" }, charge: 350, distance: "18 km", currentLocationName: "Attingal", destinationLocationName: "TVM Central", createdAt: "2025-04-09" },
  { id: "10", user: { name: "Nikhil" }, charge: 220, distance: "11 km", currentLocationName: "Karamana", destinationLocationName: "Pattom", createdAt: "2025-04-10" },
];

export default function Rides() {
  const { colors } = useTheme();
  const [rides, setRides] = useState<any[]>([]);

  const getRecentRides = async () => {
    try {
      const accessToken = await AsyncStorage.getItem("accessToken");

      const res = await axios.get(
        `${process.env.EXPO_PUBLIC_SERVER_URI}/driver/get-rides`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (res?.data?.rides?.length > 0) {
        setRides(res.data.rides);
      } else {
        setRides(dummyRides);
      }
    } catch (error) {
      console.log("Ride fetch error:", error);
      setRides(dummyRides); // 🔥 fallback
    }
  };

  useEffect(() => {
    getRecentRides();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* 🔥 HEADER */}
      <Text style={[styles.title, { color: colors.text }]}>
        Ride History
      </Text>

      {/* 🔥 LIST */}
      <FlatList
        data={rides}
        keyExtractor={(item, index) => item.id || index.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <RideCard item={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 50,
  },

  title: {
    fontSize: 24,
    fontFamily: fonts.bold,
    marginBottom: 15,
  },
});