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

// Inicializar Firebase con reintentos
async function initFirebase(maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            if (typeof firebase === 'undefined') {
                console.warn('Firebase no está definido, reintentando...');
                await new Promise(resolve => setTimeout(resolve, 1000));
                continue;
            }

            // Verificar si ya hay una instancia inicializada
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            }

            // Inicializar Analytics si está disponible
            if (firebase.analytics) {
                firebase.analytics();
            }

            // Referencias a servicios de Firebase
            auth = firebase.auth();
            db = firebase.firestore();
            googleProvider = new firebase.auth.GoogleAuthProvider();
            
            // Configurar el proveedor de Google
            googleProvider.setCustomParameters({
                prompt: 'select_account'
            });

            console.log('Firebase inicializado correctamente');
            return { auth, db, googleProvider };
        } catch (error) {
            console.error('Error al inicializar Firebase:', error);
            if (i === maxRetries - 1) {
                throw error;
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    return null;
}

// Exportar las variables para uso global
window.firebaseInstance = null;
initFirebase().then(instance => {
    window.firebaseInstance = instance;
}).catch(error => {
    console.error('Error final al inicializar Firebase:', error);
});