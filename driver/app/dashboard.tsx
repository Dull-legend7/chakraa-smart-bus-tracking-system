import { View, Text, Dimensions, ScrollView } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../configs/firebase";


const screenWidth = Dimensions.get("window").width;

export default function Dashboard() {
  const [earnings, setEarnings] = useState([]);
  const [labels, setLabels] = useState([]);


  useEffect(() => {
    const earningsRef = ref(database, "drivers/driver1/earningsHistory");

    const unsubscribe = onValue(earningsRef, (snapshot) => {
      const data = snapshot.val();

      if (!data) {
        setEarnings([]);
        setLabels([]);
        return;
      }

      // ✅ FIX: type safety
      const values = Object.values(data) as any[];

      // ✅ FIX: safe sort
      values.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

      let runningTotal = 0;
      const graphData: number[] = [];
      const graphLabels: string[] = [];

      values.forEach((item, index) => {
        const amount = item?.amount || 0;

        runningTotal += amount;
        graphData.push(runningTotal);

        graphLabels.push((index + 1).toString());
      });

      setEarnings(graphData);
      setLabels(graphLabels);
    });

    return () => unsubscribe();
  }, []);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff", padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "700", textAlign: "center" }}>
        📊 Driver Earnings
      </Text>

      <Text style={{ textAlign: "center", marginBottom: 20, color: "#666" }}>
        Live earnings over time
      </Text>

      {earnings.length > 0 ? (
        <LineChart
          data={{
            labels: labels.length ? labels : ["0"],
            datasets: [
              {
                data: earnings.length ? earnings : [0],
              },
            ],
          }}
          width={screenWidth - 40}
          height={220}
          yAxisLabel="₹"
          chartConfig={{
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
            labelColor: () => "#333",
          }}
          style={{
            borderRadius: 16,
          }}
        />
      ) : (
        <Text style={{ textAlign: "center", marginTop: 50 }}>
          No data yet...
        </Text>
      )}
    </ScrollView>
  );
}