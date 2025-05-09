
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB75OzrPITU2aTn4ROrsTaoH2LPwHF4n9c",
  authDomain: "deliveryfflow.firebaseapp.com",
  projectId: "deliveryfflow",
  storageBucket: "deliveryfflow.appspot.com",
  messagingSenderId: "215704714460",
  appId: "1:215704714460:web:6a00417ae408805dfac819"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
