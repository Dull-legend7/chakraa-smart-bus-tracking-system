import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useEffect, useState } from "react";
import { ref, onValue, getDatabase } from "firebase/database";
import { app } from "@/configs/firebase";

export const useGetDriverData = () => {
  const [driver, setDriver] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 🔥 Firebase LIVE DATA
  const [liveData, setLiveData] = useState({
    latitude: 0,
    longitude: 0,
    totalEarning: 0,
    totalRides: 0,
    pendingRides: 0,
    cancelRides: 0,
  });

  // ✅ API DRIVER DATA
  useEffect(() => {
    const getDriver = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");

        const res = await axios.get(
          `${process.env.EXPO_PUBLIC_SERVER_URI}/driver/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setDriver(res.data.driver);
      } catch (error) {
        console.log("❌ API ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    getDriver();
  }, []);

  // ✅ FIREBASE REALTIME LISTENER
  useEffect(() => {
    const db = getDatabase(app);

    const driverId = "driver1"; // 🔥 IMPORTANT (match Firebase EXACTLY)

    const driverRef = ref(db, `drivers/${driverId}`);

    const unsubscribe = onValue(driverRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();

        console.log("🔥 FIREBASE LIVE:", data); // ✅ DEBUG

        setLiveData({
          latitude: data.latitude || 0,
          longitude: data.longitude || 0,
          totalEarning: data.totalEarning || 0,
          totalRides: data.totalRides || 0,
          pendingRides: data.pendingRides || 0,
          cancelRides: data.cancelRides || 0,
        });
      } else {
        console.log("⚠️ No Firebase data found");
      }
    });

    return () => unsubscribe();
  }, []);

  // ✅ MERGE API + FIREBASE DATA
  const mergedDriver = {
    ...(driver || {}),
    ...liveData,
  };

  return {
    loading,
    driver: mergedDriver,
  };
};