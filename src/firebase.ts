import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDsDwx3pB3Eg-vb8C6t8wOQDOdON8N5Yqo",
  authDomain: "club-fire-11.firebaseapp.com",
  databaseURL: "https://club-fire-11-default-rtdb.firebaseio.com",
  projectId: "club-fire-11",
  storageBucket: "club-fire-11.firebasestorage.app",
  messagingSenderId: "519098949332",
  appId: "1:519098949332:web:563a47157dd9e5ba50a541",
  measurementId: "G-E2DPEL6DP5"
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
