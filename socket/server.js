const express = require("express");
const { WebSocketServer } = require("ws");
const geolib = require("geolib");

const app = express();
const PORT = 3000;

// Store driver locations
let drivers = {};
let connections = new Map();

// Create WebSocket server
const wss = new WebSocketServer({ port: 8080, host: '0.0.0.0' });

wss.on("connection", (ws) => {
  const pingInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
    }
  }, 30000);

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed");
    clearInterval(pingInterval);
    // Cleanup connections
    for (const [driverId, connWs] of connections.entries()) {
      if (connWs === ws) {
        delete drivers[driverId];
        connections.delete(driverId);
        console.log(`Cleaned up driver: ${driverId}`);
        break;
      }
    }
  });

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      console.log("Received message:", data); // Debugging line

      if (data.type === "locationUpdate" && data.role === "driver") {
        if (data.driver) {
          drivers[data.driver] = {
            latitude: data.data.latitude,
            longitude: data.data.longitude,
          };
          connections.set(data.driver, ws);
          console.log("Updated driver location:", drivers[data.driver]); // Debugging line
        }
      }

      if (data.type === "requestRide" && data.role === "user") {
        console.log("Requesting ride...");
        const nearbyDrivers = findNearbyDrivers(data.latitude, data.longitude);
        ws.send(
          JSON.stringify({ type: "nearbyDrivers", drivers: nearbyDrivers })
        );
      }
    } catch (error) {
      console.log("Failed to parse WebSocket message:", error);
    }
  });
});

const findNearbyDrivers = (userLat, userLon) => {
  return Object.entries(drivers)
    .filter(([id, location]) => {
      const distance = geolib.getDistance(
        { latitude: userLat, longitude: userLon },
        location
      );
      return distance <= 5000; // 5 kilometers
    })
    .map(([id, location]) => ({ id, ...location }));
};

console.log("WebSocket server running on port 8080");
