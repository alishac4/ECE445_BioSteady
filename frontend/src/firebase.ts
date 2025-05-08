import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  // Your Firebase configuration object goes here
  // You'll need to replace these with your actual Firebase config values
  apiKey: "AIzaSyAULEuOSCV5McMzr5W_9m6zYvy2UEucJ0I",
  authDomain: "biosteady-f354a.firebaseapp.com",
  projectId: "biosteady-f354a",
  storageBucket: "biosteady-f354a.firebasestorage.app",
  messagingSenderId: "630173982442",
  appId: "1:630173982442:web:e1085ac870a07a34268193",
  measurementId: "G-M6JB6CEQB9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);

export default app; 