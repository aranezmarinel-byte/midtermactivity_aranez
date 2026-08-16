import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: 'AIzaSyDMnKPa6Ay_82srg_zdHbeDaCctwswfA8Y',
    authDomain: 'aranez-midterm.firebaseapp.com',
    projectId: 'aranez-midterm',
    storageBucket: 'aranez-midterm.firebasestorage.app',
    messagingSenderId: '387679600685',
    appId: '1:387679600685:web:2979ee4358339a19ce78a4',
    measurementId: 'G-7PGG33FM5G',
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
