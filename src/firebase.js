import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase, get, ref } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCLzbPMprgrvy0cJr0IFHqYkiHPPAe_KvE",
  authDomain: "moonshort-63752.firebaseapp.com",
  databaseURL: "https://moonshort-63752-default-rtdb.firebaseio.com",
  projectId: "moonshort-63752",
  storageBucket: "moonshort-63752.firebasestorage.app",
  messagingSenderId: "629084786170",
  appId: "1:629084786170:web:6554bb028af68340bae843"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
export { get, ref };