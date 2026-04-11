import { View, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import AuthContainer from "@/utils/container/auth-container";
import { windowHeight } from "@/themes/app.constant";
import SignInText from "@/components/login/signin.text";
import { commonStyles } from "@/styles/common.style";
import { external } from "@/styles/external.style";
import Button from "@/components/common/button";
import { style } from "../verification/style";
import color from "@/themes/app.colors";
import { Toast } from "react-native-toast-notifications";
import OTPTextInput from "react-native-otp-textinput";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function EmailVerificationScreen() {
  const [otp, setOtp] = useState("");
  const [loader, setLoader] = useState(false);

  const { user } = useLocalSearchParams() as any;
  const parsedUser = JSON.parse(user);

  const handleSubmit = async () => {
    if (!otp || otp.length < 4) {
      Toast.show("Please enter valid OTP", {
        placement: "bottom",
        type: "danger",
      });
      return;
    }

    try {
      setLoader(true);

      const otpNumbers = otp.trim(); // 🔥 important

      console.log("📩 Sending OTP:", otpNumbers);
      console.log("🔐 Token:", parsedUser.token);

      const res = await axios.put(
        `${process.env.EXPO_PUBLIC_SERVER_URI}/api/v1/email-otp-verify`,
        {
          token: parsedUser.token,
          otp: otpNumbers,
        }
      );

      console.log("✅ VERIFY SUCCESS:", res.data);

      await AsyncStorage.setItem("accessToken", res.data.accessToken);

      Toast.show("Email verified successfully 🎉", {
        placement: "bottom",
        type: "success",
      });

      router.replace("/(tabs)/home");
    } catch (error: any) {
      console.log("❌ VERIFY ERROR:", error.response?.data || error.message);

      Toast.show(
        error.response?.data?.message || "Invalid or expired OTP",
        {
          placement: "bottom",
          type: "danger",
        }
      );
    } finally {
      setLoader(false);
    }
  };

  return (
    <AuthContainer
      topSpace={windowHeight(240)}
      imageShow={true}
      container={
        <View>
          <SignInText
            title={"Email Verification"}
            subtitle={"Check your email address for the OTP"}
          />

          {/* 🔥 OTP INPUT */}
          <OTPTextInput
            handleTextChange={(code) => setOtp(code)}
            inputCount={4}
            textInputStyle={style.otpTextInput}
            tintColor={color.subtitle}
            autoFocus={true}
          />

          {/* 🔥 VERIFY BUTTON */}
          <View style={[external.mt_30]}>
            <Button
              title={loader ? "Verifying..." : "Verify"}
              onPress={handleSubmit}
              disabled={loader}
            />
          </View>

          {/* 🔥 RESEND */}
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
                Not received yet?
              </Text>

              <TouchableOpacity
                onPress={() => {
                  Toast.show("Resend OTP coming soon", {
                    placement: "bottom",
                  });
                }}
              >
                <Text style={[style.signUpText, { color: "#000" }]}>
                  Resend it
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      }
    />
  );
}