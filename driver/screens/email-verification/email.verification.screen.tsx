import { View, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import AuthContainer from "@/utils/container/auth-container";
import { windowHeight } from "@/themes/app.constant";
import SignInText from "@/components/login/signin.text";
import { commonStyles } from "@/styles/common.style";
import { external } from "@/styles/external.style";
import Button from "@/components/common/button";
import color from "@/themes/app.colors";
import { Toast } from "react-native-toast-notifications";
import OTPTextInput from "react-native-otp-textinput";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function EmailVerificationScreen() {
  const [otp, setOtp] = useState("");
  const [loader, setLoader] = useState(false);

  const params = useLocalSearchParams() as any;

  let parsedUser: any = null;

  try {
    parsedUser = params?.user ? JSON.parse(params.user) : null;
  } catch (error) {
    console.log("❌ JSON PARSE ERROR:", error);
  }

  // 🔥 FIX: STORE TOKEN IN STATE
  const [token, setToken] = useState(parsedUser?.token);

  const handleSubmit = async () => {
    if (!otp || otp.length < 4) {
      Toast.show("Please enter valid OTP", {
        placement: "bottom",
        type: "danger",
      });
      return;
    }

    if (!token) {
      Toast.show("Session expired. Please signup again.", {
        placement: "bottom",
        type: "danger",
      });
      return;
    }

    try {
      setLoader(true);

      // 🔥 CLEAN OTP
      const cleanOtp = otp.replace(/\s/g, "");

      console.log("📩 OTP:", cleanOtp);
      console.log("🔐 TOKEN:", token);

      const res = await axios.put(
        `${process.env.EXPO_PUBLIC_SERVER_URI}/api/v1/driver/email-otp-verify`,
        {
          token: token, // ✅ FIXED
          otp: cleanOtp,
        }
      );

      console.log("✅ SUCCESS:", res.data);

      await AsyncStorage.setItem("accessToken", res.data.accessToken);

      Toast.show("Email verified successfully 🎉", {
        placement: "bottom",
        type: "success",
      });

      router.replace("/(tabs)/home");

    } catch (error: any) {
      console.log("❌ ERROR:", error.response?.data || error.message);

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
            subtitle={"Check your email for the OTP"}
          />

          {/* 🔥 OTP INPUT */}
          <OTPTextInput
            handleTextChange={(code) => setOtp(code)}
            inputCount={4}
            tintColor={color.subtitle}
            autoFocus={true}
            textInputStyle={{
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 12,
              width: 60,
              height: 60,
              textAlign: "center",
              fontSize: 20,
            }}
          />

          {/* 🔥 VERIFY BUTTON */}
          <View style={[external.mt_30]}>
            <Button
              title={loader ? "Verifying..." : "Verify"}
              height={windowHeight(50)}
              onPress={handleSubmit}
              disabled={loader}
            />
          </View>

          {/* 🔥 RESEND OTP (FIXED) */}
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
                onPress={async () => {
                  try {
                    const res = await axios.post(
                      `${process.env.EXPO_PUBLIC_SERVER_URI}/api/v1/driver/email-otp-request`,
                      parsedUser?.driver
                    );

                    // 🔥 UPDATE TOKEN HERE (VERY IMPORTANT)
                    setToken(res.data.token);

                    Toast.show("New OTP sent", {
                      placement: "bottom",
                      type: "success",
                    });

                  } catch (err) {
                    Toast.show("Failed to resend OTP", {
                      placement: "bottom",
                      type: "danger",
                    });
                  }
                }}
              >
                <Text style={{ color: "#000", fontWeight: "600" }}>
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