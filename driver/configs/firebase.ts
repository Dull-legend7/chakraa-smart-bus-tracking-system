// configs/firebase.ts

import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// 🔥 Your Firebase config (unchanged)
const firebaseConfig = {
  apiKey: "AIzaSyDDbRtiAJDZny9bxf2doLM4VGefdh6_ATQ",
  authDomain: "chakraa-bus-tracker-gps.firebaseapp.com",
  databaseURL:
    "https://chakraa-bus-tracker-gps-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "chakraa-bus-tracker-gps",
  storageBucket: "chakraa-bus-tracker-gps.appspot.com",
  messagingSenderId: "107267482219",
  appId: "1:107267482219:web:0f1b45be0df4813194072e",
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Realtime DB (THIS is what you need)
export const db = getDatabase(app);