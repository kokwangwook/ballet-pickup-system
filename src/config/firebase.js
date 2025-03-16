// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAskcrnDf1qewhZqiU9D7ZPzpYxRPXlxXs",
  authDomain: "ballet-pickup-system.firebaseapp.com",
  projectId: "ballet-pickup-system",
  storageBucket: "ballet-pickup-system.firebasestorage.app",
  messagingSenderId: "1005218003989",
  appId: "1:1005218003989:web:77146b9362105a9681221c",
  measurementId: "G-H22M8818JB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { db, analytics };
export default app; 