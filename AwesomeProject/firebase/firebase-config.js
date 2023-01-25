// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore/lite";

const firebaseConfig = {

  apiKey: "AIzaSyAydUFvYnCiNioY1aMdRE6OvnFW_4dRn7I",
  authDomain: "mobile-attendance-app-db.firebaseapp.com",
  projectId: "mobile-attendance-app-db",
  storageBucket: "mobile-attendance-app-db.appspot.com",
  messagingSenderId: "198638439443",
  appId: "1:198638439443:web:c25f7e8ccc5ae3b4bb03e6",
  measurementId: "G-8F5G2NZ6E2"

};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);