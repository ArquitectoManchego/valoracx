// src/lib/firebase/config.ts
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore, collection, getDocs, query, limit, onSnapshot } from "firebase/firestore";

// Credenciales vinculadas directamente a la base de datos de producción de Software Imperia
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBW3nlhDa6_As07gcxqS98LzE_4LIFihS8",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "html-dashboard-integrator.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "html-dashboard-integrator",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "html-dashboard-integrator.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1084644965062",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1084644965062:web:6e1871286c1527e0d635c7",
};

export const isFirebaseConfigured = true;

let app: FirebaseApp;
let auth: Auth | undefined;
let db: Firestore | undefined;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.warn("Firebase initialization notice:", error);
}

export { app, auth, db };

/**
 * Servicio de sincronización y lectura directa con la colección `clientes` de Imperia
 */
export async function fetchImperiaClientes() {
  if (!db) return [];
  try {
    const clientesRef = collection(db, "clientes");
    const q = query(clientesRef, limit(100));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error al obtener clientes de Imperia:", error);
    return [];
  }
}
