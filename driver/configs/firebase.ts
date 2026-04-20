// configs/firebase.ts

import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// 🔥 Firebase config
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

// ✅ Prevent re-initialization (VERY IMPORTANT in Expo)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// ✅ Export database (THIS NAME MUST MATCH YOUR IMPORTS)
export const database = getDatabase(app);