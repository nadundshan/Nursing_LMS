import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCjBOjougi3Ho_L2rmzCAOFYKD50rYAFjo",
  authDomain: "nursinglms.firebaseapp.com",
  projectId: "nursinglms",
  storageBucket: "nursinglms.firebasestorage.app",
  messagingSenderId: "92748758522",
  appId: "1:92748758522:web:d455ccadfb191cb5587843"
};


// Primary app for general use
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Secondary app for admin actions
const adminApp = initializeApp(firebaseConfig, 'adminApp');
export const adminAuth = getAuth(adminApp);