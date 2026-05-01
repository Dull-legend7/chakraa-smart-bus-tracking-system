import {
  View,
  Text,
  SafeAreaView,
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

export default function HomeScreen() {
  const [recentRides, setrecentRides] = useState<any[]>([]);
  const [topRoute, setTopRoute] = useState<any>(null);

  // 🔥 FORCE PROFESSIONAL DUMMY DATA
  useEffect(() => {
    setrecentRides([
      {
        from: "Technopark",
        to: "Kazhakootam",
        time: "8 mins",
        price: "₹45",
      },
      {
        from: "Kesavadasapuram",
        to: "Pattom",
        time: "5 mins",
        price: "₹30",
      },
      {
        from: "Kollam",
        to: "Varkala",
        time: "1 hr 10 mins",
        price: "₹120",
      },
      {
        from: "Attingal",
        to: "Trivandrum",
        time: "25 mins",
        price: "₹80",
      },
    ]);
  }, []);

  useEffect(() => {
  const routesRef = ref(database, "users/user1/routes");

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
    <View style={[commonStyles.flexContainer, { backgroundColor: "#fff" }]}>
      <SafeAreaView style={styles.container}>
        
        {/* 🔷 HEADER */}
        <View style={[external.p_5, external.ph_20]}>
          <Text
            style={{
              fontFamily: "TT-Octosquares-Medium",
              fontSize: 28,
              marginBottom: 10,
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
            Nearby rides
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {recentRides.map((item, index) => (
              <View
                key={index}
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
                {/* ROUTE */}
                <Text style={{ fontWeight: "600", fontSize: 16 }}>
                  {item.from} → {item.to}
                </Text>

                {/* TIME */}
                <Text style={{ color: "#777", marginTop: 6 }}>
                  {item.time}
                </Text>

                {/* PRICE */}
                <Text
                  style={{
                    color: "#2563eb",
                    marginTop: 6,
                    fontWeight: "600",
                    fontSize: 15,
                  }}
                >
                  {item.price}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}