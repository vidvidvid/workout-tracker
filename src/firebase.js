import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "workouttracker-cdffd.firebaseapp.com",
  projectId: "workouttracker-cdffd",
  storageBucket: "workouttracker-cdffd.appspot.com",
  messagingSenderId: "586485046778",
  appId: "1:586485046778:web:8ddb9335f8ac6be0d31843",
  databaseURL:
    "https://workouttracker-cdffd-default-rtdb.europe-west1.firebasedatabase.app/",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export default database;
