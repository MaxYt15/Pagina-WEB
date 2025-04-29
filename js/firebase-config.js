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

// Asegurarse de que Firebase está disponible
if (typeof firebase !== 'undefined') {
    // Inicializar Firebase
    firebase.initializeApp(firebaseConfig);

    // Referencias a servicios de Firebase
    const auth = firebase.auth();
    const db = firebase.firestore();

    // Proveedor de autenticación de Google
    const googleProvider = new firebase.auth.GoogleAuthProvider();
} else {
    console.error('Firebase no está cargado correctamente. Verifica las importaciones de scripts.');
}