import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import color from "@/themes/app.colors";
import fonts from "@/themes/app.fonts";
import { Notification } from "@/utils/icons";
import SwitchToggle from "react-native-switch-toggle";

export default function Header({ isOn, toggleSwitch }: any) {
  return (
    <View style={styles.container}>
      
      {/* 🔥 TOP ROW */}
      <View style={styles.topRow}>
        <Text style={styles.title}>Chakraa</Text>

        <TouchableOpacity style={styles.iconBox}>
          <Notification color="#fff" />
        </TouchableOpacity>
      </View>

      {/* 🔥 STATUS CARD */}
      <View style={styles.statusCard}>
        <View>
          <Text style={[styles.status, { color: isOn ? "green" : "red" }]}>
            {isOn ? "Online" : "Offline"}
          </Text>

          <Text style={styles.subText}>
            You are {isOn ? "available" : "not available"} for rides
          </Text>
        </View>

        <SwitchToggle
          switchOn={isOn}
          onPress={toggleSwitch}
          containerStyle={styles.switchContainer}
          circleStyle={styles.switchCircle}
          backgroundColorOn="#ddd"
          backgroundColorOff="#ddd"
          circleColorOn={color.primary}
          circleColorOff="#000"
        />
      </View>
    </View>
  );
}

/* 🔥 CLEAN HEADER UI */
const styles = StyleSheet.create({
  container: {
    backgroundColor: color.primary,
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 22,
    fontFamily: fonts.bold,
    color: "#fff",
  },

  iconBox: {
    height: 40,
    width: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },

  statusCard: {
    marginTop: 20,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  status: {
    fontSize: 18,
    fontFamily: fonts.bold,
  },

  subText: {
    fontSize: 13,
    color: "#555",
    marginTop: 4,
  },

  switchContainer: {
    width: 50,
    height: 26,
    borderRadius: 25,
    padding: 3,
  },

  switchCircle: {
    width: 20,
    height: 20,
    borderRadius: 20,
  },
});