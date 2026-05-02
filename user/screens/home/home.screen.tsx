import {
  View,
  Text,
  
  ScrollView,
} from "react-native";
import styles from "./styles";
import { commonStyles } from "@/styles/common.style";
import { external } from "@/styles/external.style";
import LocationSearchBar from "@/components/location/location.search.bar";
import color from "@/themes/app.colors";
import { useEffect, useState } from "react";
import { TouchableOpacity } from "react-native";
import { ref, onValue } from "firebase/database";
import { database } from "@/lib/firebase"; // adjust if needed
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const [recentRides, setrecentRides] = useState<any[]>([]);
  const [topRoute, setTopRoute] = useState<any>(null);

  // 🔥 FORCE PROFESSIONAL DUMMY DATA
 useEffect(() => {
  const ridesRef = ref(database, "users/demo_user/rides");

  const unsubscribe = onValue(ridesRef, (snapshot) => {
    const data = snapshot.val();

    if (!data) {
      setrecentRides([]);
      return;
    }
const ridesArray = Object.keys(data).map((key) => ({
  id: key,
  ...data[key],
}));

// ✅ REMOVE DUPLICATES (same from + to → keep latest)
const uniqueMap: any = {};

ridesArray.forEach((ride) => {
  const key = `${ride.from}_${ride.to}`;

  if (
    !uniqueMap[key] ||
    ride.createdAt > uniqueMap[key].createdAt
  ) {
    uniqueMap[key] = ride;
  }
});

const uniqueRides = Object.values(uniqueMap);

    // 🔥 sort latest first
    const sorted = uniqueRides.sort(
      (a, b) => b.createdAt - a.createdAt
    );

    // 🔥 take last 5 rides
    setrecentRides(sorted.slice(0, 5));
  });

  return () => unsubscribe();
}, []);

  useEffect(() => {
  const routesRef = ref(database, "users/demo_user/routes");

  const unsubscribe = onValue(routesRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    const values = Object.values(data);

    const routeCount: any = {};

    values.forEach((r: any) => {
      const key = `${r.from}__${r.to}`;
      routeCount[key] = (routeCount[key] || 0) + 1;
    });

    let max = 0;
    let bestRoute = null;

    Object.keys(routeCount).forEach((key) => {
      if (routeCount[key] > max) {
        max = routeCount[key];
        bestRoute = key;
      }
    });

    if (bestRoute) {
      const [from, to] = bestRoute.split("__");
      setTopRoute({ from, to });
    }
  });

  return () => unsubscribe();
}, []);

  return (
    
      <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "#fff" }}>
  <ScrollView
    showsVerticalScrollIndicator={false}
    contentContainerStyle={{ paddingBottom: 120 }}
  >
        
        {/* 🔷 HEADER */}
        <View style={[external.p_5, external.ph_20]}>
<Text
  style={{
    fontFamily: "TT-Octosquares-Medium",
    fontSize: 28,
    marginBottom: 10,
    lineHeight: 34,   // 🔥 IMPORTANT FIX
    paddingTop: 4,    // 🔥 PREVENT CLIPPING
  }}
>
            Chaakra
          </Text>

          {/* 🔍 SEARCH BAR */}
          <LocationSearchBar />
        </View>

        {topRoute && (
  <TouchableOpacity
    style={{
      marginHorizontal: 15,
      marginTop: 10,
      padding: 16,
      backgroundColor: "#2563EB",
      borderRadius: 14,
      elevation: 4,
    }}
    onPress={() => {
      router.push({
        pathname: "/rideplan",
        params: {
          from: topRoute.from,
          to: topRoute.to,
        },
      });
    }}
  >
    <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
      🚀 Most Used Route
    </Text>

    <Text style={{ color: "#fff", marginTop: 5 }}>
      {topRoute.from} → {topRoute.to}
    </Text>
  </TouchableOpacity>
)}

        {/* 🔥 RIDES SECTION */}
        <View style={{ paddingHorizontal: 15, marginTop: 10 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              marginBottom: 12,
            }}
          >
            Recent rides
          </Text>
<View>
{recentRides.length === 0 ? (
  <Text style={{ textAlign: "center", color: "#888", marginTop: 20 }}>
    No rides yet 🚫
  </Text>
) : (
  <View>
    {recentRides.map((item) => (

      <TouchableOpacity
      key={item.id}
      activeOpacity={0.7}
      onPress={() => {
        router.push({
          pathname: "/rideplan",
          params: {
            from: item.from,
            to: item.to,
          },
        });
      }}
      style={{
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 14,
        marginBottom: 12,
        elevation: 4,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 6,
      }}
    >
      <Text style={{ fontWeight: "600", fontSize: 16 }}>
        {item.from} → {item.to}
      </Text>

      <Text style={{ color: "#777", marginTop: 6 }}>
        {item.duration}
      </Text>

      <Text style={{ color: "#2563eb", marginTop: 6, fontWeight: "600" }}>
        ₹{item.price}
      </Text>

     
      <Text
        style={{
          marginTop: 6,
          color:
  item.status === "cancelled"
    ? "#ef4444"
    : item.status === "accepted"
    ? "#16a34a"
    : "#555",
          fontWeight: "600",
        }}
      >
        {item.status}
      </Text>
      </TouchableOpacity>

    ))}
  </View>
)}
</View>

</View>   

</ScrollView>
</SafeAreaView>
  );
}