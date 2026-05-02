import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import styles from "@/screens/home/styles";
import color from "@/themes/app.colors";

import { windowHeight } from "@/themes/app.constant";
import { ref, onValue } from "firebase/database";
import { database } from "@/lib/firebase";

export default function History() {
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ BUS-ONLY DUMMY DATA (REALISTIC)
useEffect(() => {
  const ridesRef = ref(database, "users/demo_user/rides");

  const unsubscribe = onValue(ridesRef, (snapshot) => {
    const data = snapshot.val();

    if (!data) {
      setRides([]);
      setLoading(false);
      return;
    }

    const ridesArray = Object.keys(data).map((key) => ({
      id: key,
      ...data[key],
    }));

    // 🔥 latest first
    const sorted = ridesArray.sort(
      (a, b) => b.createdAt - a.createdAt
    );

    setRides(sorted);
    setLoading(false);
  });

  return () => unsubscribe();
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
          {rides.length === 0 ? (
            <View style={{ marginTop: 50, alignItems: "center" }}>
              <Text style={{ fontSize: 16, color: "gray" }}>
                No bus rides yet 🚍
              </Text>
            </View>
          ) : (
            rides.map((item: any) => (
              <View
                key={item.id}
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

<Text
  style={{
    marginTop: 4,
    fontWeight: "600",
    color:
      item.status === "cancelled"
        ? "#ef4444"
        : item.status === "completed"
        ? "#555"
        : "#16a34a",
  }}
>
  {item.status}
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
                    {new Date(item.createdAt).toLocaleString()}
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