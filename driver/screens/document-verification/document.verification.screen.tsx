import { View, Text, ScrollView } from "react-native";
import React, { useState } from "react";
import { windowHeight, windowWidth } from "@/themes/app.constant";
import ProgressBar from "@/components/common/progress.bar";
import styles from "../signup/styles";
import { useTheme } from "@react-navigation/native";
import TitleView from "@/components/signup/title.view";
import Input from "@/components/common/input";
import SelectInput from "@/components/common/select-input";
import Button from "@/components/common/button";
import color from "@/themes/app.colors";
import { router, useLocalSearchParams } from "expo-router";
import axios from "axios";
import { Toast } from "react-native-toast-notifications";

export default function DocumentVerificationScreen() {
  const driverData = useLocalSearchParams() as any;
  const { colors } = useTheme();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    vehicleType: "Car",
    registrationNumber: "",
    registrationDate: "",
    drivingLicenseNumber: "",
    color: "",
    rate: "",
  });

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async () => {
    if (
      !formData.registrationNumber ||
      !formData.drivingLicenseNumber ||
      !formData.registrationDate
    ) {
      Toast.show("Please fill all required fields", {
        placement: "bottom",
        type: "danger",
      });
      return;
    }

    try {
      setLoading(true);

      const driver = {
        name: driverData?.name,
        country: driverData?.country,
        phone_number: driverData?.phone_number,
        email: driverData?.email,

        vehicle_type: formData.vehicleType,
        registration_number: formData.registrationNumber,
        registration_date: formData.registrationDate,
        driving_license: formData.drivingLicenseNumber,
        vehicle_color: formData.color,
        rate: formData.rate,
      };

      console.log("🚀 DRIVER DATA:", driver);

      /* ✅ FIXED API (IMPORTANT) */
      const res = await axios.post(
        `${process.env.EXPO_PUBLIC_SERVER_URI}/api/v1/driver/email-otp-request`,
        driver
      );

      console.log("✅ OTP SENT:", res.data);

      /* ✅ NAVIGATE TO OTP SCREEN */
      router.push({
        pathname: "/(routes)/email-verification",
        params: {
          user: JSON.stringify(res.data),
        },
      });

    } catch (error: any) {
      console.log("❌ ERROR:", error.response?.data || error.message);

      Toast.show(
        error.response?.data?.message || "Failed to send OTP",
        {
          placement: "bottom",
          type: "danger",
        }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView>
      <View>
        <Text
          style={{
            fontFamily: "TT-Octosquares-Medium",
            fontSize: windowHeight(22),
            paddingTop: windowHeight(50),
            textAlign: "center",
          }}
        >
          Chakraa
        </Text>

        <View style={{ padding: windowWidth(20) }}>
          <ProgressBar fill={2} />

          <View
            style={[styles.subView, { backgroundColor: colors.background }]}
          >
            <View style={styles.space}>
              <TitleView
                title={"Vehicle Registration"}
                subTitle={"Complete your driver profile"}
              />

              <SelectInput
                title="Vehicle Type"
                value={formData.vehicleType}
                onValueChange={(text) => handleChange("vehicleType", text)}
                items={[
                  { label: "Car", value: "Car" },
                  { label: "Bike", value: "Bike" },
                  { label: "Auto", value: "Auto" },
                ]}
              />

              <Input
                title="Registration Number"
                placeholder="Enter vehicle number"
                keyboardType="numeric"
                value={formData.registrationNumber}
                onChangeText={(text) =>
                  handleChange("registrationNumber", text)
                }
              />

              <Input
                title="Registration Date"
                placeholder="DD-MM-YYYY"
                value={formData.registrationDate}
                onChangeText={(text) =>
                  handleChange("registrationDate", text)
                }
              />

              <Input
                title="Driving License"
                placeholder="Enter license number"
                keyboardType="numeric"
                value={formData.drivingLicenseNumber}
                onChangeText={(text) =>
                  handleChange("drivingLicenseNumber", text)
                }
              />

              <Input
                title="Vehicle Color"
                placeholder="Enter vehicle color"
                value={formData.color}
                onChangeText={(text) => handleChange("color", text)}
              />

              <Input
                title="Rate per km"
                placeholder="Enter price per km"
                keyboardType="numeric"
                value={formData.rate}
                onChangeText={(text) => handleChange("rate", text)}
              />
            </View>

            <View style={styles.margin}>
              <Button
                onPress={handleSubmit}
                title={loading ? "Sending OTP..." : "Continue"}
                height={windowHeight(45)}
                backgroundColor={color.buttonBg}
                textColor={color.whiteColor}
              />
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}