import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAnY8Kca-024NQ8khTx9Nd9OfzcG3PMy10",
  authDomain: "clientprojects88.firebaseapp.com",
  projectId: "clientprojects88",
  storageBucket: "clientprojects88.firebasestorage.app",
  messagingSenderId: "297631820262",
  appId: "1:297631820262:web:c82e94941adec76313ce27",
  measurementId: ""
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app, "oxygenmultifitgym-db");
export const auth = getAuth(app);
export const storage = getStorage(app);
