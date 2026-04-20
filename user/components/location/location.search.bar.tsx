import { View, Text, Pressable } from "react-native";
import color from "@/themes/app.colors";
import { Clock, Search } from "@/utils/icons";
import { windowHeight } from "@/themes/app.constant";
import DownArrow from "@/assets/icons/downArrow";
import { router } from "expo-router";

export default function LocationSearchBar() {
  return (
    <Pressable
      onPress={() => router.push("/(routes)/rideplan")}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#f1f3f5",
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 14,
        marginTop: 12,
      }}
    >
      {/* 🔍 LEFT SIDE */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Search />

        <Text
          style={{
            marginLeft: 10,
            fontSize: 16,
            color: "#666",
            fontWeight: "500",
          }}
        >
          Where to?
        </Text>
      </View>

      {/* 🕒 RIGHT SIDE */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#fff",
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 20,
        }}
      >
        <Clock />

        <Text
          style={{
            marginHorizontal: 6,
            fontSize: windowHeight(12),
            fontWeight: "600",
          }}
        >
          Now
        </Text>

        <DownArrow />
      </View>
    </Pressable>
  );
}