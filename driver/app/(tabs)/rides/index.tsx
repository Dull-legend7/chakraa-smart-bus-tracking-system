import { View, Text, StyleSheet, FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import RideCard from "@/components/ride/ride.card";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useTheme } from "@react-navigation/native";
import fonts from "@/themes/app.fonts";

/* 🔥 DUMMY RIDES */
const dummyRides = [
  {
    id: "RIDE001",
    pickup: "Kazhakootam",
    drop: "Technopark Phase 3",
    price: 120,
    status: "completed",
    date: "Today • 9:15 AM",
  },
  {
    id: "RIDE002",
    pickup: "Technopark",
    drop: "Attingal Bus Stand",
    price: 180,
    status: "completed",
    date: "Today • 10:30 AM",
  },
  {
    id: "RIDE003",
    pickup: "Varkala Cliff",
    drop: "Kollam Junction",
    price: 250,
    status: "completed",
    date: "Yesterday • 6:45 PM",
  },
  {
    id: "RIDE004",
    pickup: "Attingal",
    drop: "Kazhakootam",
    price: 140,
    status: "completed",
    date: "Yesterday • 2:10 PM",
  },
  {
    id: "RIDE005",
    pickup: "Trivandrum Central",
    drop: "Technopark",
    price: 200,
    status: "completed",
    date: "Yesterday • 11:00 AM",
  },
  {
    id: "RIDE006",
    pickup: "Kollam",
    drop: "Attingal",
    price: 300,
    status: "completed",
    date: "2 days ago • 4:30 PM",
  },
  {
    id: "RIDE007",
    pickup: "Kazhakootam",
    drop: "Varkala",
    price: 220,
    status: "completed",
    date: "2 days ago • 1:15 PM",
  },
  {
    id: "RIDE008",
    pickup: "Technopark",
    drop: "Kollam",
    price: 350,
    status: "completed",
    date: "3 days ago • 9:00 AM",
  },
  {
    id: "RIDE009",
    pickup: "Attingal",
    drop: "Trivandrum Central",
    price: 190,
    status: "completed",
    date: "3 days ago • 7:20 AM",
  },
  {
    id: "RIDE010",
    pickup: "Varkala",
    drop: "Kazhakootam",
    price: 210,
    status: "completed",
    date: "4 days ago • 5:50 PM",
  },
];

export default function Rides() {
  const { colors } = useTheme();
  const [rides, setRides] = useState<any[]>([]);

  // 🔥 FETCH HISTORY (UNCHANGED LOGIC)
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
      setRides(dummyRides);
    }
  };

  useEffect(() => {
    getRecentRides();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      <Text style={[styles.title, { color: colors.text }]}>
        Driver Dashboard
      </Text>

      <Text style={[styles.subtitle, { color: colors.text }]}>
        Ride History
      </Text>

      <FlatList
        data={rides}
        keyExtractor={(item, index) => item.id || index.toString()}
        renderItem={({ item }) => <RideCard item={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

/* 🔥 STYLES */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 50,
  },

  title: {
    fontSize: 24,
    fontFamily: fonts.bold,
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 18,
    marginVertical: 10,
  },
});