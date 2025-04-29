// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBDJ9Ouxup0-HQn_lC3HCkj5k3HnLp2ypI",
    authDomain: "mi-pagina-80920.firebaseapp.com",
    projectId: "mi-pagina-80920",
    storageBucket: "mi-pagina-80920.firebasestorage.app",
    messagingSenderId: "478583666607",
    appId: "1:478583666607:web:d77f92c2f700e98635615a",
    measurementId: "G-9F7FJ8WN7H"
};

// Variables para exportar
let auth;
let db;
let googleProvider;

// Inicializar Firebase
function initFirebase() {
    if (typeof firebase !== 'undefined') {
        // Inicializar Firebase
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }

        // Referencias a servicios de Firebase
        auth = firebase.auth();
        db = firebase.firestore();
        googleProvider = new firebase.auth.GoogleAuthProvider();

        return { auth, db, googleProvider };
    } else {
        console.error('Firebase no está cargado correctamente. Verifica las importaciones de scripts.');
        return null;
    }
}

// Exportar las variables para uso global
window.firebaseInstance = initFirebase();