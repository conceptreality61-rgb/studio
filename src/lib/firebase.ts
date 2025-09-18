
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  projectId: "studio-6177460287-18bfe",
  appId: "1:718529042650:web:4dd335d517eacf81bd2de3",
  storageBucket: "studio-6177460287-18bfe.appspot.com",
  apiKey: "AIzaSyCO0muwjPlwJfsC2ertJZRqA1IwHHD4oDs",
  authDomain: "studio-6177460287-18bfe.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "718529042650"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
