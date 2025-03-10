// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAtXvm9VMuAuOHUq9g20hRztbXTOP1kJLg",
  authDomain: "cr-digital-bbbde.firebaseapp.com",
  projectId: "cr-digital-bbbde",
  storageBucket: "cr-digital-bbbde.firebasestorage.app",
  messagingSenderId: "456454091119",
  appId: "1:456454091119:web:35562c088de2f482f1789a",
  measurementId: "G-9E5E978YDD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);