import React, { useEffect, useRef } from "react";
import { View } from "react-native";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";

import { database } from "../../configs/firebase";
import { ref, update, onValue, off } from "firebase/database";

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

      console.log("📥 Receiving:", data);

      const lat = data.location?.latitude;
      const lng = data.location?.longitude;

      if (!lat || !lng) return;

      webRef.current?.injectJavaScript(`
        if(window.updateDriver){
          window.updateDriver(${lat}, ${lng});
        }
        true;
      `);
    });

    return () => off(driverRef);
  }, []);

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>

<style>
html, body, #map { height: 100%; margin: 0; font-family: -apple-system; }

/* 🔥 TOP COORD BAR */
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

/* 🔥 SEARCH UI */
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

/* 🔥 CLEAN AUTOCOMPLETE */
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

/* 🔥 ICONS */
var busIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3448/3448339.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40]
});

var startIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30]
});

var endIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149060.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30]
});

var driverMarker, routeLine, startMarker, endMarker;
var fromCoords = null;
var toCoords = null;

/* 🔥 DRIVER UPDATE */
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

/* 🔍 AUTOCOMPLETE */
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

/* 🛣 ROUTE */
function drawRoute() {
  if (!fromCoords || !toCoords) return;

  fetch(\`https://router.project-osrm.org/route/v1/driving/\${fromCoords.lon},\${fromCoords.lat};\${toCoords.lon},\${toCoords.lat}?overview=full&geometries=geojson\`)
    .then(res => res.json())
    .then(data => {
      const route = data.routes[0];

      if (routeLine) map.removeLayer(routeLine);
      if (startMarker) map.removeLayer(startMarker);
      if (endMarker) map.removeLayer(endMarker);

      routeLine = L.geoJSON(route.geometry, {
        style: { color: "#2563EB", weight: 6 }
      }).addTo(map);

      startMarker = L.marker([fromCoords.lat, fromCoords.lon], { icon: startIcon }).addTo(map);
      endMarker = L.marker([toCoords.lat, toCoords.lon], { icon: endIcon }).addTo(map);

      map.fitBounds(routeLine.getBounds());

      const km = (route.distance / 1000).toFixed(1);
      const min = Math.round(route.duration / 60);

      document.getElementById("routeInfo").innerHTML =
        "🚌 " + km + " km • ⏱ " + min + " mins";
    });
}

/* INPUT EVENTS */
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
      <WebView ref={webRef} source={{ html }} style={{ flex: 1 }} />
    </View>
  );
}