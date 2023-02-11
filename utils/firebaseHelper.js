// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const getFirebaseApp = () => {
    const firebaseConfig = {
        apiKey: "AIzaSyDFhxESXl9Z7o37S70EMd6pILzBVhdrDD8",
        authDomain: "helloai2.firebaseapp.com",
        projectId: "helloai2",
        storageBucket: "helloai2.appspot.com",
        messagingSenderId: "177152493832",
        appId: "1:177152493832:web:701e10c486287adcea04bd",
        measurementId: "G-KHDC4LJTG7"
      };
      
      // Initialize Firebase
      return initializeApp(firebaseConfig);
}

