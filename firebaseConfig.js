// js/firebaseConfig.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, OAuthProvider } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getFirestore, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

/*
  Substitua abaixo pelas credenciais do seu Firebase Console (Estetica_valquiria).
  Atenção: apiKey e outras chaves do front-end são públicas por design.
*/
const firebaseConfig = {
  apiKey: "AIzaSyCKiTlxFMVlNgbBD6cWACHmuxCqClWxaZw",
  authDomain: "esteticavalquiria-7a698.firebaseapp.com",
  projectId: "esteticavalquiria-7a698",
  storageBucket: "esteticavalquiria-7a698.appspot.com",
  messagingSenderId: "913691148592",
  appId: "1:913691148592:web:f8d0a588a6f6fac48b48f5"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Auth e Firestore
const auth = getAuth(app);
const db = getFirestore(app);

// Providers
const googleProvider = new GoogleAuthProvider();
const appleProvider = new OAuthProvider("apple.com"); // exige configuração Apple + Firebase

export { app, auth, db, googleProvider, appleProvider, serverTimestamp };
