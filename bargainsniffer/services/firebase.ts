
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: process.env.API_KEY || "API_KEY_PLACEHOLDER", // Use env var in demo, real config in prod
  authDomain: "bargainsniffer-app.firebaseapp.com",
  projectId: "bargainsniffer-app",
  storageBucket: "bargainsniffer-app.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

// Auth Helpers
export const signIn = (email: string, pass: string) => signInWithEmailAndPassword(auth, email, pass);
export const signUp = (email: string, pass: string) => createUserWithEmailAndPassword(auth, email, pass);
export const signOut = () => firebaseSignOut(auth);
export const observeAuth = (callback: (user: User | null) => void) => onAuthStateChanged(auth, callback);
