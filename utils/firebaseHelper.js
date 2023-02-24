// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const getFirebaseApp = () => {
    const firebaseConfig = {
        apiKey: "AIzaSyCZPCkHt1vmemVuBLQS1jJR9XTmfApeRkI",
        authDomain: "helloai-37cc0.firebaseapp.com",
        projectId: "helloai-37cc0",
        storageBucket: "helloai-37cc0.appspot.com",
        messagingSenderId: "950875826306",
        appId: "1:950875826306:web:b41135792dd8b92e68ec9b",
      };
      
      // Initialize Firebase
      return initializeApp(firebaseConfig);
}

