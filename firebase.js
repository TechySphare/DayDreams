// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDnUZmWFfDjpR-MxurAaMwKiGnHrwIxgC0",
  authDomain: "techydaydreams.firebaseapp.com",
  projectId: "techydaydreams",
  storageBucket: "techydaydreams.firebasestorage.app",
  messagingSenderId: "679663087904",
  appId: "1:679663087904:web:05776187c13d37ffc2e745",
  measurementId: "G-HTD7HHN5GQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, signOut };