import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDDbRtiAJDZny9bxf2doLM4VGefdh6_ATQ",
  authDomain: "chakraa-bus-tracker-gps.firebaseapp.com",
  databaseURL: "https://chakraa-bus-tracker-gps-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "chakraa-bus-tracker-gps",
  storageBucket: "chakraa-bus-tracker-gps.appspot.com",
  messagingSenderId: "107267482219",
  appId: "1:107267482219:web:0f1b45be0df4813194072e"
};

const app = initializeApp(firebaseConfig);

// ✅ single database instance
export const database = getDatabase(app);

// ✅ optional test function
export function addDummyQuote() {
  const quoteRef = ref(database, "quotes/test");
  set(quoteRef, {
    text: "The journey of a thousand miles begins with one step.",
    author: "Lao Tzu",
    timestamp: Date.now()
  });
}