import { View, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import SignInText from "@/components/login/signin.text";
import Button from "@/components/common/button";
import { external } from "@/styles/external.style";
import { router, useLocalSearchParams } from "expo-router";
import { commonStyles } from "@/styles/common.style";
import color from "@/themes/app.colors";
import OTPTextInput from "react-native-otp-textinput";
import { style } from "./style";
import AuthContainer from "@/utils/container/auth-container";
import { windowHeight } from "@/themes/app.constant";
import axios from "axios";
import { Toast } from "react-native-toast-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function PhoneNumberVerificationScreen() {
  const driver: any = useLocalSearchParams();
  const [otp, setOtp] = useState("");
  const [loader, setLoader] = useState(false);

  const handleSubmit = async () => {
    if (otp.length !== 6) {
      Toast.show("Enter complete 6-digit OTP!", {
        placement: "bottom",
      });
      return;
    }

    try {
      setLoader(true);

      if (driver.name) {
        const res = await axios.post(
          `${process.env.EXPO_PUBLIC_SERVER_URI}/driver/verify-otp`,
          {
            phone_number: driver.phone_number,
            otp: otp,
            ...driver,
          }
        );

        const driverData = {
          ...driver,
          token: res.data.token,
        };

        router.push({
          pathname: "/(routes)/email-verification",
          params: driverData,
        });
      } else {
        const res = await axios.post(
          `${process.env.EXPO_PUBLIC_SERVER_URI}/driver/login`,
          {
            phone_number: driver.phone_number,
            otp: otp,
          }
        );

        await AsyncStorage.setItem("accessToken", res.data.accessToken);
        router.push("/(tabs)/home");
      }
    } catch (error) {
      Toast.show("OTP is incorrect or expired!", {
        placement: "bottom",
        type: "danger",
      });
    } finally {
      setLoader(false);
    }
  };

  return (
    <AuthContainer
      topSpace={windowHeight(220)}
      imageShow={true}
      container={
        <View>
          <SignInText
            title={"Phone Number Verification"}
            subtitle={"Enter the 6-digit OTP sent to your phone"}
          />

          {/* ✅ FIXED OTP INPUT */}
          <OTPTextInput
            handleTextChange={(code) => setOtp(code)}
            inputCount={6} // 🔥 CHANGED FROM 4 → 6
            keyboardType="numeric"
            textInputStyle={{
              width: 45,
              height: 55,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: "#ddd",
              textAlign: "center",
              fontSize: 18,
              backgroundColor: "#f5f5f5",
              color: "#000",
            }}
            tintColor={color.primary}
            offTintColor="#ccc"
          />

          <View style={[external.mt_30]}>
            <Button
              title="Verify"
              height={windowHeight(30)}
              onPress={handleSubmit}
              disabled={loader}
            />
          </View>

          <View style={[external.mb_15]}>
            <View
              style={[
                external.pt_10,
                external.Pb_10,
                {
                  flexDirection: "row",
                  gap: 5,
                  justifyContent: "center",
                },
              ]}
            >
              <Text style={[commonStyles.regularText]}>
                Didn’t receive OTP?
              </Text>

              <TouchableOpacity>
                <Text style={[style.signUpText, { color: "#2563EB" }]}>
                  Resend
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      }
    />
  );
}