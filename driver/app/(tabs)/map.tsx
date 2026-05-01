import React, { useEffect, useRef } from "react";
import { View } from "react-native";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";

import { database } from "../../configs/firebase";
import { ref, update, onValue, off } from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function MapScreen() {
  const webRef = useRef<WebView>(null);

  /* 🔥 SEND DRIVER LOCATION */
  useEffect(() => {
    let subscription: any;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 4000,
          distanceInterval: 5,
        },
        (loc) => {
          const { latitude, longitude } = loc.coords;

          console.log("📡 Sending:", latitude, longitude);

          update(ref(database, "drivers/driver1/location"), {
            latitude,
            longitude,
            timestamp: Date.now(),
          });
        }
      );
    })();

    return () => {
      if (subscription) subscription.remove();
    };
  }, []);

  /* 🔥 RECEIVE DRIVER LOCATION */
  useEffect(() => {
    const driverRef = ref(database, "drivers/driver1");

    onValue(driverRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      const lat = data.location?.latitude;
      const lng = data.location?.longitude;

      if (!lat || !lng) return;

      webRef.current?.injectJavaScript(`
        window.updateDriver(${lat}, ${lng});
        true;
      `);
    });

    return () => off(driverRef);
  }, []);
/* 🔥 FORCE ROUTE ON LOAD (ADD THIS EXACTLY HERE) */
useEffect(() => {
  const loadRideAndNavigate = async () => {
    try {
      const data = await AsyncStorage.getItem("activeRide");

      if (!data) return;

      const ride = JSON.parse(data);

      console.log("🚀 FORCE ROUTE:", ride);

      setTimeout(() => {
        webRef.current?.injectJavaScript(`
          window.navigateToStop(
            ${ride.stop.lat},
            ${ride.stop.lng},
            "${ride.stop.name}"
          );
          true;
        `);
      }, 800);

    } catch (err) {
      console.log("❌ ROUTE LOAD ERROR:", err);
    }
  };

  loadRideAndNavigate();
}, []);
  // 🔥 FIXED LISTENER (ONLY IMPROVED — NOTHING REMOVED)
useEffect(() => {
  const bookingsRef = ref(database, "bookings");

  const unsubscribe = onValue(bookingsRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    const entries = Object.entries(data);

    const latest = entries
      .filter(
        ([_, val]: any) =>
          val.status === "accepted" &&
          val.assignedStop &&
          val.driverId === "driver1"
      )
      .sort((a: any, b: any) => {
        const t1 = a[1]?.createdAt || 0;
        const t2 = b[1]?.createdAt || 0;
        return t2 - t1;
      })[0];

    if (!latest) return;

    const [id, val]: any = latest;
    const stop = val.assignedStop;

    console.log("🧭 ROUTE UPDATE:", id, stop);

    webRef.current?.injectJavaScript(`
      window.navigateToStop(${stop.lat}, ${stop.lng}, "${stop.name}");
      true;
    `);
  });

  return () => unsubscribe();
}, []);
  /* 🔥 FULL HTML (UNCHANGED) */
  const html = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<style>
html, body, #map { height: 100%; margin: 0; font-family: -apple-system; }
.coord-bar {
  position: absolute;
  top: 70px;
  left: 16px;
  right: 16px;
  background: rgba(0,0,0,0.75);
  color: white;
  padding: 12px;
  border-radius: 20px;
  text-align: center;
  z-index: 999;
}
.search-wrapper {
  position: absolute;
  bottom: 20px;
  left: 16px;
  right: 16px;
  z-index: 999;
}
.search-card {
  background: white;
  border-radius: 24px;
  padding: 14px;
  box-shadow: 0 15px 35px rgba(0,0,0,0.3);
}
.input-row {
  display: flex;
  align-items: center;
  background: #f1f5f9;
  border-radius: 14px;
  padding: 12px;
  margin-bottom: 10px;
}
.input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
}
.suggestions {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 10px;
}
.suggestion-item {
  padding: 12px;
  border-bottom: 1px solid #eee;
  font-size: 13px;
}
.suggestion-item:hover {
  background: #f3f4f6;
}
.route-info {
  text-align: center;
  font-size: 13px;
  margin-top: 5px;
  font-weight: 600;
}
</style>
</head>

<body>

<div id="map"></div>
<div id="coords" class="coord-bar">Waiting for GPS...</div>

<div class="search-wrapper">
  <div class="search-card">

    <div class="input-row">
      📍 <input id="from" class="input" placeholder="From location" />
    </div>
    <div id="fromList" class="suggestions"></div>

    <div class="input-row">
      🏁 <input id="to" class="input" placeholder="To destination" />
    </div>
    <div id="toList" class="suggestions"></div>

    <div id="routeInfo" class="route-info"></div>

  </div>
</div>

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

<script>
var map = L.map('map').setView([8.5241, 76.9366], 12);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);

var busIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3448/3448339.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40]
});

var stopIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [35, 35],
  iconAnchor: [17, 35]
});

var driverMarker, stopMarker, routeLine;
var fromCoords = null;
var toCoords = null;

window.updateDriver = function(lat, lon) {
  document.getElementById("coords").innerHTML =
    "📍 " + lat.toFixed(5) + ", " + lon.toFixed(5);

  if (!driverMarker) {
    driverMarker = L.marker([lat, lon], { icon: busIcon }).addTo(map);
    map.setView([lat, lon], 15);
  } else {
    driverMarker.setLatLng([lat, lon]);
  }
};

window.navigateToStop = function(lat, lon, name) {
  if (!driverMarker) return;

  if (stopMarker) map.removeLayer(stopMarker);
  if (routeLine) map.removeLayer(routeLine);

  stopMarker = L.marker([lat, lon], { icon: stopIcon })
    .addTo(map)
    .bindPopup("🚌 " + name)
    .openPopup();

  const driverPos = driverMarker.getLatLng();

  // 🔥 ENABLE ALTERNATIVE ROUTES
 const url = "https://router.project-osrm.org/route/v1/driving/"
  + driverPos.lng + "," + driverPos.lat + ";"
  + lon + "," + lat
  + "?overview=full&geometries=geojson&alternatives=true";

  fetch(url)
    .then(res => res.json())
    .then(data => {
     // 🔥 ADD THIS LINE HERE
    console.log("🧪 ROUTES COUNT:", data.routes.length);
    console.log("🧪 FULL DATA:", data);
    // 🔥 ADD THIS
    window.ReactNativeWebView.postMessage(
    JSON.stringify({ type: "routes", count: data.routes.length })
    );
      if (!data.routes || data.routes.length === 0) return;

      // 🔥 CLEAR OLD ROUTES
      if (window.routeLayers) {
        window.routeLayers.forEach(r => map.removeLayer(r));
      }
      window.routeLayers = [];

      data.routes.forEach((route, index) => {
        const layer = L.geoJSON(route.geometry, {
          style: {
            color: index === 0 ? "#10B981" : "#94A3B8", // main vs alt
            weight: index === 0 ? 6 : 4,
            opacity: index === 0 ? 1 : 0.6,
            lineJoin: "round",
            lineCap: "round"
          }
        }).addTo(map);

        window.routeLayers.push(layer);

        // 🔥 FIT TO MAIN ROUTE ONLY
        if (index === 0) {
          map.fitBounds(layer.getBounds());

          const km = (route.distance / 1000).toFixed(1);
          const min = Math.round(route.duration / 60);

          document.getElementById("routeInfo").innerHTML =
            "🧭 Nearest Stop: " + name + " • " + km + " km • " + min + " mins";
        }
      });

      console.log("✅ Multiple routes drawn:", data.routes.length);
    })
    .catch(err => console.log("❌ Routing error:", err));
};

/* AUTOCOMPLETE + ROUTE (UNCHANGED) */
function fetchSuggestions(query, listId, callback) {
  if (query.length < 2) return;

  fetch("https://nominatim.openstreetmap.org/search?format=json&q=" + query)
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById(listId);
      list.innerHTML = "";

      data.slice(0,5).forEach((item) => {
        const div = document.createElement("div");
        div.className = "suggestion-item";
        div.innerText = item.display_name;

        div.onclick = () => {
          callback(item);
          list.innerHTML = "";
        };

        list.appendChild(div);
      });
    });
}

function drawRoute() {
  if (!fromCoords || !toCoords) return;

  fetch(\`https://router.project-osrm.org/route/v1/driving/\${fromCoords.lon},\${fromCoords.lat};\${toCoords.lon},\${toCoords.lat}?overview=full&geometries=geojson\`)
    .then(res => res.json())
    .then(data => {
      const route = data.routes[0];

      if (routeLine) map.removeLayer(routeLine);

      routeLine = L.geoJSON(route.geometry, {
        style: { color: "#2563EB", weight: 6 }
      }).addTo(map);

      map.fitBounds(routeLine.getBounds());
    });
}

document.getElementById("from").addEventListener("input", (e) => {
  fetchSuggestions(e.target.value, "fromList", (item) => {
    fromCoords = item;
    drawRoute();
  });
});

document.getElementById("to").addEventListener("input", (e) => {
  fetchSuggestions(e.target.value, "toList", (item) => {
    toCoords = item;
    drawRoute();
  });
});
</script>

</body>
</html>
`;

  return (
    <View style={{ flex: 1 }}>
     <WebView
  ref={webRef}
  source={{ html }}
  style={{ flex: 1 }}
  onMessage={(event) => {
    console.log("📥 FROM MAP:", event.nativeEvent.data);
  }}
/>
    </View>
  );
}