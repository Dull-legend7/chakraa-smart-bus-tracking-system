import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { rideIcons } from "@/configs/constants";
import color from "@/themes/app.colors";
import fonts from "@/themes/app.fonts";
import { useGetDriverData } from "@/hooks/useGetDriverData";

export default function RenderRideItem({
  item,
  colors,
  overrideValue,
}: any) {
  const { driver } = useGetDriverData();

  // ✅ SAFE ICON
  const iconIndex = Number(item?.id) - 1;
  const icon = rideIcons?.[iconIndex] || "🚌";

  // ✅ VALUE LOGIC (REAL-TIME FIREBASE)
  const value =
    overrideValue ??
    (item.title === "Total Earning"
      ? `₹ ${driver?.totalEarning || 0}`
      : item.title === "Complete Ride"
      ? driver?.totalRides || 0
      : item.title === "Pending Ride"
      ? driver?.pendingRides || 0
      : item.title === "Cancel Ride"
      ? driver?.cancelRides || 0
      : 0);

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
          },
        ]}
      >
        {/* 🔥 TOP ROW */}
        <View style={styles.topRow}>
          <Text style={styles.value}>{value}</Text>

          <View style={styles.iconBox}>
            {typeof icon === "string" ? (
              <Text style={styles.iconText}>{icon}</Text>
            ) : (
              icon
            )}
          </View>
        </View>

        {/* 🔥 TITLE */}
        <Text style={[styles.title, { color: colors.text }]}>
          {item.title}
        </Text>
      </View>
    </View>
  );
}

/* 🔥 STYLES */
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    padding: 6, // ✅ fixes overlapping issue
  },

  card: {
    borderRadius: 18,
    padding: 14,

    // 🔥 CLEAN SHADOW
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  value: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: color.primary,
  },

  iconBox: {
    height: 38,
    width: 38,
    borderRadius: 12,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
  },

  iconText: {
    fontSize: 18,
  },

  title: {
    marginTop: 8,
    fontSize: 13,
    fontFamily: fonts.medium,
  },
});