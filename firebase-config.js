// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore/lite";

const firebaseConfig = {
  apiKey: "AIzaSyDEM-ag4Hc9IRQK1_ysNE3rebLobe0WttQ",
  authDomain: "fir-v9-6ce78.firebaseapp.com",
  projectId: "fir-v9-6ce78",
  storageBucket: "fir-v9-6ce78.appspot.com",
  messagingSenderId: "283522110602",
  appId: "1:283522110602:web:663ec05943d71c69f78973",
  measurementId: "G-0PJFH9Q2PB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const authentication = getAuth(app);
export const db = getFirestore(app);