import {
  View,
  Text,
  StyleSheet,
  Image,
} from "react-native";
import React from "react";
import { useTheme } from "@react-navigation/native";
import fonts from "@/themes/app.fonts";
import color from "@/themes/app.colors";
import { Gps, Location, Star } from "@/utils/icons";

export default function RideCard({ item }: { item: any }) {
  const { colors } = useTheme();

  // ✅ SAFE DATA
  const userName = item?.user?.name || "Passenger";
  const avatar = item?.user?.avatar;
  const price = item?.charge || 250;
  const date = item?.createdAt?.slice(0, 10) || "Today";
  const distance = item?.distance || "5 km";
  const pickup = item?.currentLocationName || "Kazhakootam";
  const drop = item?.destinationLocationName || "Technopark";

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>

      {/* 🔥 TOP ROW */}
      <View style={styles.topRow}>
        <View style={styles.profileRow}>
          <Image
            source={
              avatar
                ? { uri: avatar }
                : {
                    uri: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                  }
            }
            style={styles.avatar}
          />

          <View>
            <Text style={[styles.name, { color: colors.text }]}>
              {userName}
            </Text>
            <Text style={styles.date}>{date}</Text>
          </View>
        </View>

        <View style={styles.priceBox}>
          <View style={styles.ratingRow}>
            <Star />
            <Text style={styles.rating}>4.8</Text>
          </View>

          <Text style={styles.price}>₹ {price}</Text>
        </View>
      </View>

      {/* 🔥 ROUTE (FIXED ALIGNMENT) */}
      <View style={styles.routeRow}>

        {/* ICON COLUMN */}
        <View style={styles.iconColumn}>
          <Location color={colors.text} />
          <View style={styles.dottedLine} />
          <Gps colors={colors.text} />
        </View>

        {/* TEXT COLUMN */}
        <View style={styles.locationColumn}>
          <View style={styles.row}>
            <Text
              numberOfLines={1}
              style={[styles.pickup, { color: colors.text }]}
            >
              {pickup}
            </Text>
          </View>

          <View style={styles.row}>
            <Text
              numberOfLines={1}
              style={[styles.drop, { color: colors.text }]}
            >
              {drop}
            </Text>
          </View>
        </View>
      </View>

      {/* 🔥 FOOTER */}
      <View style={styles.footer}>
        <View style={styles.distanceRow}>
          <Location color={colors.text} />
          <Text style={[styles.distance, { color: colors.text }]}>
            {distance}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    padding: 16,
    marginVertical: 8,
    elevation: 3,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  profileRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    height: 45,
    width: 45,
    borderRadius: 50,
    marginRight: 10,
  },

  name: {
    fontSize: 16,
    fontFamily: fonts.bold,
  },

  date: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },

  priceBox: {
    alignItems: "flex-end",
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  rating: {
    fontSize: 13,
    fontFamily: fonts.medium,
  },

  price: {
    marginTop: 4,
    fontSize: 18,
    fontFamily: fonts.bold,
    color: color.primary,
  },

  routeRow: {
    flexDirection: "row",
    marginTop: 14,
  },

  iconColumn: {
    alignItems: "center",
    marginRight: 10,
    paddingTop: 2,
  },

  dottedLine: {
    height: 24, // ✅ FIXED alignment
    borderLeftWidth: 1,
    borderColor: "#ccc",
    marginVertical: 2,
  },

  locationColumn: {
    flex: 1,
    justifyContent: "space-between",
  },

  row: {
    height: 24, // ✅ ensures alignment
    justifyContent: "center",
  },

  pickup: {
    fontSize: 14,
    fontFamily: fonts.medium,
  },

  drop: {
    fontSize: 14,
    fontFamily: fonts.medium,
  },

  footer: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "flex-end",
  },

  distanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  distance: {
    fontSize: 13,
    fontFamily: fonts.medium,
  },
});