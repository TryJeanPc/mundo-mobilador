import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDYHvOB2RtYGKo_WE6wecNIYepWdf0N1zw",
  authDomain: "mundo-mobilador.firebaseapp.com",
  projectId: "mundo-mobilador",
  storageBucket: "mundo-mobilador.firebasestorage.app",
  messagingSenderId: "589476597524",
  appId: "1:589476597524:web:dda4d2b2f55cf759d3fc01",
  measurementId: "G-XRNN8NP8HW"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
