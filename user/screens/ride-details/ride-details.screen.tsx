import { View, Text, Linking, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { fontSizes, windowHeight, windowWidth } from "@/themes/app.constant";
import MapView, { Marker } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import color from "@/themes/app.colors";
import Button from "@/components/common/button";

export default function RideDetailsScreen() {
  const { orderData: orderDataObj } = useLocalSearchParams() as any;
  const orderData = JSON.parse(orderDataObj);

  const [region, setRegion] = useState<any>({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // 🔥 CALCULATE AMOUNT (FIXED)
  const amount = (
    orderData.driver?.distance *
    Number(orderData?.driver?.rate || 0)
  ).toFixed(2);

  useEffect(() => {
    if (orderData?.driver?.currentLocation && orderData?.driver?.marker) {
      const latitudeDelta =
        Math.abs(
          orderData.driver.marker.latitude -
            orderData.driver.currentLocation.latitude
        ) * 2;

      const longitudeDelta =
        Math.abs(
          orderData.driver.marker.longitude -
            orderData.driver.currentLocation.longitude
        ) * 2;

      setRegion({
        latitude:
          (orderData.driver.marker.latitude +
            orderData.driver.currentLocation.latitude) /
          2,
        longitude:
          (orderData.driver.marker.longitude +
            orderData.driver.currentLocation.longitude) /
          2,
        latitudeDelta: Math.max(latitudeDelta, 0.0922),
        longitudeDelta: Math.max(longitudeDelta, 0.0421),
      });
    }
  }, []);

  // 🔥 UPI PAYMENT FUNCTION
  const handleUPIPayment = async () => {
    try {
      const upiId = "athuls2580@oksbi"; // 🔥 YOUR UPI ID

      const upiUrl = `upi://pay?pa=${upiId}&pn=Athul&am=${amount}&cu=INR`;

      const supported = await Linking.canOpenURL(upiUrl);

      if (supported) {
        await Linking.openURL(upiUrl);
      } else {
        Alert.alert("Error", "No UPI app found on this device");
      }
    } catch (error) {
      console.log("UPI ERROR:", error);
      Alert.alert("Error", "Unable to initiate payment");
    }
  };

  return (
    <View>
      {/* 🔥 MAP */}
      <View style={{ height: windowHeight(450) }}>
        <MapView
          provider="google"
          style={{ flex: 1 }}
          region={region}
          onMapReady={() => console.log("User RideDetails Map loaded")}
          onRegionChangeComplete={(region) => setRegion(region)}
        >
          {orderData?.driver?.marker && (
            <Marker coordinate={orderData?.driver?.marker} />
          )}

          {orderData?.driver?.currentLocation && (
            <Marker coordinate={orderData?.driver?.currentLocation} />
          )}

          {orderData?.driver?.currentLocation &&
            orderData?.driver?.marker && (
              <MapViewDirections
                origin={orderData?.driver?.currentLocation}
                destination={orderData?.driver?.marker}
                apikey={process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY!}
                strokeWidth={4}
                strokeColor="blue"
                onError={(error) =>
                  console.log(
                    "User RideDetails Directions error:",
                    error
                  )
                }
              />
            )}
        </MapView>
      </View>

      {/* 🔥 DETAILS */}
      <View style={{ padding: windowWidth(20) }}>
        <Text
          style={{
            fontSize: fontSizes.FONT20,
            fontWeight: "500",
            paddingVertical: windowHeight(5),
          }}
        >
          Driver Name: {orderData?.driver?.name}
        </Text>

        {/* 🔥 CALL DRIVER */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text
            style={{
              fontSize: fontSizes.FONT20,
              fontWeight: "500",
              paddingVertical: windowHeight(5),
            }}
          >
            Phone Number:
          </Text>

          <Text
            style={{
              color: color.buttonBg,
              paddingLeft: 5,
              fontSize: fontSizes.FONT20,
              fontWeight: "500",
              paddingVertical: windowHeight(5),
            }}
            onPress={() =>
              Linking.openURL(`tel:${orderData?.driver?.phone_number}`)
            }
          >
            {orderData?.driver?.phone_number}
          </Text>
        </View>

        {/* 🔥 VEHICLE INFO */}
        <Text style={{ fontSize: fontSizes.FONT20, fontWeight: "500" }}>
          {orderData?.driver?.vehicle_type} Color:{" "}
          {orderData?.driver?.vehicle_color}
        </Text>

        {/* 🔥 AMOUNT */}
        <Text
          style={{
            fontSize: fontSizes.FONT20,
            fontWeight: "500",
            paddingVertical: windowHeight(5),
          }}
        >
          Payable amount: {amount} INR
        </Text>

        {/* 🔥 UPI BUTTON */}
        <View style={{ marginTop: windowHeight(20) }}>
          <Button
            title="Pay via UPI"
            height={windowHeight(45)}
            backgroundColor="#2ecc71"
            onPress={handleUPIPayment}
          />
        </View>

        {/* 🔥 NOTE */}
        <Text
          style={{
            fontSize: fontSizes.FONT14,
            fontWeight: "400",
            paddingVertical: windowHeight(10),
          }}
        >
          **Complete payment after reaching your destination.
        </Text>
      </View>
    </View>
  );
}