// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCNEhfGXLw_hOT-IrworpmHC3yovnDKNfU",
  authDomain: "drone-streaming-project.firebaseapp.com",
  projectId: "drone-streaming-project",
  storageBucket: "drone-streaming-project.firebasestorage.app",
  messagingSenderId: "690908408968",
  appId: "1:690908408968:web:75ab2639e2c075eb85433d",
  measurementId: "G-WWDSCBV905"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// eslint-disable-next-line no-unused-vars
const analytics = getAnalytics(app);