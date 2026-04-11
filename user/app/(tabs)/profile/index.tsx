import {
  View,
  Text,
  SafeAreaView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { fontSizes, windowWidth } from "@/themes/app.constant";
import Input from "@/components/common/input";
import Button from "@/components/common/button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useGetUserData } from "@/hooks/useGetUserData";

export default function Profile() {
  const { user, loading } = useGetUserData();

  const [image, setImage] = useState<string | null>(null);

  // ✅ Pick image
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission required", "Allow gallery access");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#2563EB" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      
      {/* 🔥 HEADER + IMAGE */}
      <View
        style={{
          alignItems: "center",
          marginTop: 40, // ✅ FIXED POSITION (was too high)
        }}
      >
        <TouchableOpacity onPress={pickImage}>
          <Image
            source={{
              uri:
                image ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png", // ✅ default avatar
            }}
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              borderWidth: 2,
              borderColor: "#2563EB",
            }}
          />
        </TouchableOpacity>

        <Text
          style={{
            fontSize: fontSizes.FONT24,
            fontWeight: "700",
            marginTop: 10,
          }}
        >
          My Profile
        </Text>

        <Text style={{ color: "gray", fontSize: 12 }}>
          Tap image to change
        </Text>
      </View>

      {/* 🔥 CARD */}
      <View
        style={{
          backgroundColor: "#fff",
          margin: windowWidth(20),
          borderRadius: 15,
          padding: 20,
          elevation: 4,
        }}
      >
        <Input
          title="Name"
          value={user?.name || ""}
          onChangeText={() => {}}
          placeholder="Name"
        />

        <Input
          title="Email Address"
          value={user?.email || ""}
          onChangeText={() => {}}
          placeholder="Email"
          disabled={true}
        />

        <Input
          title="Phone Number"
          value={user?.phone_number || ""}
          onChangeText={() => {}}
          placeholder="Phone"
          disabled={true}
        />
      </View>

      {/* 🔥 LOGOUT */}
      <View style={{ marginHorizontal: 20 }}>
        <Button
          onPress={async () => {
            await AsyncStorage.removeItem("accessToken");
            router.replace("/(routes)/login");
          }}
          title="Log Out"
          backgroundColor="#ef4444"
        />
      </View>
    </SafeAreaView>
  );
}