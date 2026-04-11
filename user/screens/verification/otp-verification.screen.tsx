import { View, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import AuthContainer from "@/utils/container/auth-container";
import { windowHeight } from "@/themes/app.constant";
import SignInText from "@/components/login/signin.text";
import OTPTextInput from "react-native-otp-textinput";
import { style } from "./style";
import color from "@/themes/app.colors";
import { external } from "@/styles/external.style";
import Button from "@/components/common/button";
import { router, useLocalSearchParams } from "expo-router";
import { commonStyles } from "@/styles/common.style";
import { useToast } from "react-native-toast-notifications";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function OtpVerificationScreen() {
  const [otp, setOtp] = useState("");
  const [loader, setLoader] = useState(false);
  const [resendLoader, setResendLoader] = useState(false);

  const toast = useToast();
  const { phoneNumber } = useLocalSearchParams();

  // ✅ VERIFY OTP
  const handleSubmit = async () => {
    if (otp.length !== 6) {
      toast.show("Please enter 6-digit OTP!", {
        placement: "bottom",
      });
      return;
    }

    setLoader(true);

    try {
      const res = await axios.post(
        `${process.env.EXPO_PUBLIC_SERVER_URI}/verify-otp`,
        {
          phone_number: phoneNumber,
          otp,
        }
      );

      if (res.data.user.email === null) {
        router.push({
          pathname: "/(routes)/registration",
          params: { user: JSON.stringify(res.data.user) },
        });

        toast.show("Account verified!");
      } else {
        await AsyncStorage.setItem(
          "accessToken",
          res.data.accessToken
        );

        router.push("/(tabs)/home");
      }
    } catch (error: any) {
      console.error(
        "OTP API Error:",
        error.message,
        error.response?.status,
        error.config?.url
      );

      toast.show(
        `Verification failed: ${
          error.response?.data?.message || error.message
        }`,
        {
          type: "danger",
          placement: "bottom",
        }
      );
    } finally {
      setLoader(false);
    }
  };

  // ✅ RESEND OTP
  const handleResend = async () => {
    if (resendLoader) return;

    setResendLoader(true);

    try {
      await axios.post(
        `${process.env.EXPO_PUBLIC_SERVER_URI}/send-otp`,
        {
          phone_number: phoneNumber,
        }
      );

      toast.show("OTP resent successfully!", {
        placement: "bottom",
      });

      setOtp("");
    } catch (error: any) {
      toast.show(
        `Resend failed: ${
          error.response?.data?.message || error.message
        }`,
        {
          type: "danger",
          placement: "bottom",
        }
      );
    } finally {
      setResendLoader(false);
    }
  };

  return (
    <AuthContainer
      topSpace={windowHeight(240)}
      imageShow={true}
      container={
        <View>
          <SignInText
            title={"OTP Verification"}
            subtitle={"Check your phone number for the otp!"}
          />

          {/* ✅ 6 DIGIT OTP INPUT */}
          <OTPTextInput
            handleTextChange={(code) => setOtp(code)}
            inputCount={6} // 🔥 FIXED
            textInputStyle={style.otpTextInput}
            tintColor={color.subtitle}
            autoFocus={true}
          />

          <View style={[external.mt_30]}>
            <Button
              title={loader ? "Verifying..." : "Verify"}
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
                Not Received yet?
              </Text>

              <TouchableOpacity
                onPress={handleResend}
                disabled={resendLoader}
              >
                <Text style={[style.signUpText, { color: "#000" }]}>
                  {resendLoader ? "Resending..." : "Resend it"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      }
    />
  );
}