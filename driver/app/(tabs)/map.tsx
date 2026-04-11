import React, { useEffect, useRef } from "react";
import { View } from "react-native";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";

import { db } from "@/configs/firebase";
import { ref, update, onValue } from "firebase/database";

export default function MapScreen() {
  const webRef = useRef<WebView>(null);

  /* 🔥 SEND DRIVER LOCATION */
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 4000,
          distanceInterval: 5,
        },
        (loc) => {
          const { latitude, longitude } = loc.coords;

          update(ref(db, "drivers/driver1/location"), {
            latitude,
            longitude,
            timestamp: Date.now(),
          });
        }
      );
    })();
  }, []);

  /* 🔥 RECEIVE LOCATION */
  useEffect(() => {
    const driverRef = ref(db, "drivers/driver1/location");

    onValue(driverRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      webRef.current?.injectJavaScript(`
        if(window.updateDriver){
          window.updateDriver(${data.latitude}, ${data.longitude});
        }
        true;
      `);
    });
  }, []);

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>

<style>
html, body, #map { height: 100%; margin: 0; }

.leaflet-control-zoom { margin-top: 120px !important; }

.coord-bar {
  position: absolute;
  top: 80px;
  left: 12px;
  right: 12px;
  background: rgba(0,0,0,0.75);
  color: white;
  padding: 12px;
  border-radius: 16px;
  font-size: 15px;
  font-weight: 600;
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
  border-radius: 20px;
  padding: 14px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

.input-row {
  display: flex;
  align-items: center;
  background: #f3f4f6;
  border-radius: 12px;
  padding: 10px;
  margin-bottom: 10px;
}

.input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  outline: none;
}

.suggestions {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.suggestion-item {
  padding: 10px;
  border-bottom: 1px solid #eee;
  font-size: 13px;
}

.route-info {
  text-align: center;
  font-size: 13px;
  margin-top: 5px;
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

L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);

var busIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3448/3448339.png",
  iconSize: [42, 42],
  iconAnchor: [21, 42]
});

var driverMarker, startMarker, endMarker, routeLine;
var fromCoords = null;
var toCoords = null;

/* DRIVER */
window.updateDriver = function(lat, lon) {
  document.getElementById("coords").innerHTML =
    "📍 LAT: " + lat.toFixed(5) + " | LON: " + lon.toFixed(5);

  if (!driverMarker) {
    driverMarker = L.marker([lat, lon], { icon: busIcon }).addTo(map);
    map.setView([lat, lon], 15);
  } else {
    driverMarker.setLatLng([lat, lon]);
  }

  map.panTo([lat, lon]);
};

/* AUTOCOMPLETE */
function fetchSuggestions(query, listId, callback) {
  if (query.length < 2) return;

  fetch("https://nominatim.openstreetmap.org/search?format=json&q=" + query, {
    headers: { "User-Agent": "chakraa-app" }
  })
    .then(res => res.json())
    .then(data => {
      let html = "";
      data.slice(0,5).forEach(item => {
        html += "<div class='suggestion-item'>" + item.display_name + "</div>";
      });

      const list = document.getElementById(listId);
      list.innerHTML = html;

      Array.from(list.children).forEach((el, i) => {
        el.onclick = () => {
          callback(data[i]);
          list.innerHTML = "";
        };
      });
    });
}

/* ROUTE */
function drawRoute() {
  if (!fromCoords || !toCoords) return;

  fetch(\`https://router.project-osrm.org/route/v1/driving/\${fromCoords.lon},\${fromCoords.lat};\${toCoords.lon},\${toCoords.lat}?overview=full&geometries=geojson\`)
    .then(res => res.json())
    .then(data => {
      const route = data.routes[0];

      if (routeLine) map.removeLayer(routeLine);
      routeLine = L.geoJSON(route.geometry, {
        style: { color: "#4F46E5", weight: 5 }
      }).addTo(map);

      map.fitBounds(routeLine.getBounds());

      if (startMarker) map.removeLayer(startMarker);
      startMarker = L.marker([fromCoords.lat, fromCoords.lon], { icon: busIcon }).addTo(map);

      if (endMarker) map.removeLayer(endMarker);
      endMarker = L.marker([toCoords.lat, toCoords.lon], { icon: busIcon }).addTo(map);

      const km = (route.distance / 1000).toFixed(2);
      const min = Math.round(route.duration / 60);

      document.getElementById("routeInfo").innerHTML =
        "🚌 " + km + " km • ⏱ " + min + " mins";
    });
}

/* INPUT EVENTS */
document.getElementById("from").addEventListener("input", (e) => {
  fetchSuggestions(e.target.value, "fromList", (item) => {
    fromCoords = item;
    document.getElementById("from").value = item.display_name;
    drawRoute();
  });
});

document.getElementById("to").addEventListener("input", (e) => {
  fetchSuggestions(e.target.value, "toList", (item) => {
    toCoords = item;
    document.getElementById("to").value = item.display_name;
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