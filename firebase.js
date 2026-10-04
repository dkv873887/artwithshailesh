import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
    getStorage
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDIX4ztP8K5Wm0HMA224-5Gs9ynkxPa4m0",
  authDomain: "artwithshailesh-905e3.firebaseapp.com",
  projectId: "artwithshailesh-905e3",
  storageBucket: "artwithshailesh-905e3.firebasestorage.app",
  messagingSenderId: "996909532246",
  appId: "1:996909532246:web:ec82cb910ea685baf6a7f7",
  measurementId: "G-6YWG7KS8S3"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);

export const storage = getStorage(app);