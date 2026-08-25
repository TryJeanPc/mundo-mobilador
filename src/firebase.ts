import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDmrp-rv4nmY6jqGcxrY5duxXwRN9tKm8I",
  authDomain: "sodium-cyclist-klcf1.firebaseapp.com",
  projectId: "sodium-cyclist-klcf1",
  storageBucket: "sodium-cyclist-klcf1.firebasestorage.app",
  messagingSenderId: "23985755032",
  appId: "1:23985755032:web:ab32cacfb7c0c9f2ee11ed"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, "ai-studio-mundomobilador-bc82c7ce-6308-4bc1-9820-2f5096a7cede");
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
