import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
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

// Configure authentication persistence
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error("Error setting auth persistence:", error);
  });

// Enable offline data persistence for Firestore
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Firestore persistence não pode ser habilitada com múltiplas abas abertas');
    } else if (err.code === 'unimplemented') {
      console.warn('Seu navegador não suporta persistência de dados offline');
    } else {
      console.error('Erro ao habilitar persistência do Firestore:', err);
    }
  });

export default app;
