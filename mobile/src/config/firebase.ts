import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCnqMEOXKdtPt49SYKfjs8v6M93gY8nJss",
  authDomain: "pashu-f51a1.firebaseapp.com",
  projectId: "pashu-f51a1",
  storageBucket: "pashu-f51a1.firebasestorage.app",
  messagingSenderId: "462719105520",
  appId: "1:462719105520:web:d5380aa57d4c80ee4c0535",
  measurementId: "G-GG0S5NE3JE"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Use emulator if configured locally (optional, safe to ignore in production)
if (import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099');
}

export { app, auth };
