// Import necessary Firebase SDKs
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  sendPasswordResetEmail, 
  signOut // ✅ Import signOut function
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your Firebase configuration (replace with your actual credentials)
const firebaseConfig = {
  apiKey: "AIzaSyAUjAk_0xh3I-wEXswMlwL4Q4T_nNCjFQ0",
  authDomain: "ecommerce-f2211.firebaseapp.com",
  projectId: "ecommerce-f2211",
  storageBucket: "ecommerce-f2211.appspot.com",
  messagingSenderId: "558745857955",
  appId: "1:558745857955:web:2d6e0e34c1e7ad17b2b416",
  measurementId: "G-DL9JFE2X7M",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const provider = new GoogleAuthProvider();

// ✅ Use a single export statement to avoid errors
export { 
  auth, 
  db, 
  storage, 
  provider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  sendPasswordResetEmail,
  signOut // ✅ Ensure signOut is exported
};
