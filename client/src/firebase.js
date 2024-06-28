import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import { getAuth, signInAnonymously } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyAwO3qJqT863RNN9o1-X9T-VFrTxRDIgHw",
    authDomain: "sparkl-3d75d.firebaseapp.com",
    projectId: "sparkl-3d75d",
    storageBucket: "sparkl-3d75d.appspot.com",
    messagingSenderId: "671026713461",
    appId: "1:671026713461:web:e14dfb25841cafc6b7b93c",
    measurementId: "G-RCR8HM4Z30",
    databaseURL: "https://sparkl-3d75d-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getDatabase(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export const signInWithPrivy = async (privyUserId) => {
  try {
    const userCredential = await signInAnonymously(auth);
    // Set the Privy user ID as a custom claim
    await userCredential.user.getIdToken(true);
    console.log("Signed in anonymously with Firebase");
    return true;
  } catch (error) {
    console.error("Error signing in to Firebase:", error);
    return false;
  }
};