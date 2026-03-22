import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {
  apiKey: "AIzaSyDjiQmzuLURTSeQK_qWu0ZWvJlsgvSle_U",
  authDomain: "stuverse-31756.firebaseapp.com",
  projectId: "stuverse-31756",
  storageBucket: "stuverse-31756.firebasestorage.app",
  messagingSenderId: "283807027196",
  appId: "1:283807027196:web:efc9d8aa2f7d14f9fcec79",
  measurementId: "G-4X7VSQL3B2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
