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

// Inicializar Firebase
(async function initializeFirebase() {
    try {
        // Verificar si Firebase ya está definido
        if (typeof firebase === 'undefined') {
            console.warn('Firebase no está disponible todavía');
            return;
        }

        // Inicializar Firebase solo si no hay instancias previas
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }

        // Inicializar servicios
        window.firebaseServices = {
            auth: firebase.auth(),
            db: firebase.firestore(),
            googleProvider: new firebase.auth.GoogleAuthProvider()
        };

        // Configurar el proveedor de Google
        window.firebaseServices.googleProvider.setCustomParameters({
            prompt: 'select_account'
        });

        console.log('Firebase inicializado correctamente');
    } catch (error) {
        console.error('Error al inicializar Firebase:', error);
    }
})();