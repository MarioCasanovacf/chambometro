import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCXtaRBNDg0bbmYjuoi20_aF8j5uRi8XvA",
    authDomain: "chambometro-73b04.firebaseapp.com",
    projectId: "chambometro-73b04",
    storageBucket: "chambometro-73b04.firebasestorage.app",
    messagingSenderId: "318530663801",
    appId: "1:318530663801:web:9f3f44f43ed814a4feeba8",
    measurementId: "G-C6E7KBD9WV"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
