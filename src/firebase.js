// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAJEkKYNDPk1WEPLUgP1FLzlf6UDeBqpQQ",
  authDomain: "e-portfolio-afe64.firebaseapp.com",
  projectId: "e-portfolio-afe64",
  storageBucket: "e-portfolio-afe64.firebasestorage.app",
  messagingSenderId: "403907146782",
  appId: "1:403907146782:web:0b9c8f7b34a429a233aa0f",
  measurementId: "G-HNYRG92KKF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);
const db = getFirestore(app);

// Export auth and db instance
export { auth, db };
export default app;