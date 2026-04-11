import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
} from "react-native";
import React from "react";
import { LinearGradient } from "expo-linear-gradient";

import { fontSizes, windowHeight, windowWidth } from "@/themes/app.constant";
import { useGetDriverData } from "@/hooks/useGetDriverData";
import Input from "@/components/common/input";
import SelectInput from "@/components/common/select-input";
import { countryNameItems } from "@/configs/country-name-list";
import Button from "@/components/common/button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export default function Profile() {
  const { driver, loading } = useGetDriverData();

  if (loading) return null;

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f6fa" }}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* 🔥 HEADER */}
        <LinearGradient
          colors={["#6366F1", "#4F46E5"]}
          style={styles.header}
        >
          <Text style={styles.title}>My Profile</Text>

          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri:
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png",
              }}
              style={styles.avatar}
            />
          </View>
        </LinearGradient>

        {/* 🔥 FORM */}
        <View style={styles.formContainer}>

          <Input
            title="Name"
            value={driver?.name}
            onChangeText={() => {}}
            placeholder={driver?.name}
          />

          <Input
            title="Email Address"
            value={driver?.email}
            onChangeText={() => {}}
            placeholder={driver?.email}
            disabled
          />

          <Input
            title="Phone Number"
            value={driver?.phone_number}
            onChangeText={() => {}}
            placeholder={driver?.phone_number}
            disabled
          />

          <SelectInput
            value={driver?.country}
            onValueChange={() => {}}
            title="Country"
            placeholder="Country"
            items={countryNameItems}
          />

          {/* 🔥 LOGOUT */}
          <View style={{ marginTop: 30 }}>
            <Button
              onPress={async () => {
                await AsyncStorage.removeItem("accessToken");
                router.push("/(routes)/login");
              }}
              title="Log Out"
              height={windowHeight(45)}
              backgroundColor="#EF4444"
            />
          </View>

        </View>

      </ScrollView>
    </View>
  );
}

/* 🔥 STYLES */
const styles = StyleSheet.create({
  header: {
    height: 200,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    color: "#fff",
    fontSize: fontSizes.FONT24,
    fontWeight: "600",
  },

  avatarContainer: {
    position: "absolute",
    bottom: -40,
    backgroundColor: "#fff",
    padding: 5,
    borderRadius: 50,
  },

  avatar: {
    height: 80,
    width: 80,
    borderRadius: 50,
  },

  formContainer: {
    marginTop: 60,
    paddingHorizontal: windowWidth(20),
  },
});