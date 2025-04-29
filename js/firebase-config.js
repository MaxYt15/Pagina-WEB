// Clase Singleton para manejar Firebase
class FirebaseManager {
    static instance = null;
    
    constructor() {
        this.initialized = false;
        this.services = null;
    }

    static getInstance() {
        if (!FirebaseManager.instance) {
            FirebaseManager.instance = new FirebaseManager();
        }
        return FirebaseManager.instance;
    }

    async initialize() {
        if (this.initialized) return this.services;

        try {
            const firebaseConfig = {
                apiKey: "AIzaSyBDJ9Ouxup0-HQn_lC3HCkj5k3HnLp2ypI",
                authDomain: "mi-pagina-80920.firebaseapp.com",
                projectId: "mi-pagina-80920",
                storageBucket: "mi-pagina-80920.firebasestorage.app",
                messagingSenderId: "478583666607",
                appId: "1:478583666607:web:d77f92c2f700e98635615a",
                measurementId: "G-9F7FJ8WN7H"
            };

            const app = firebase.initializeApp(firebaseConfig);
            
            this.services = {
                auth: firebase.auth(),
                db: firebase.firestore(),
                googleProvider: new firebase.auth.GoogleAuthProvider()
            };

            this.initialized = true;
            console.log('Firebase inicializado correctamente');
            
            // Hacer los servicios disponibles globalmente
            window.firebaseServices = this.services;
            
            // Disparar evento de inicialización
            window.dispatchEvent(new Event('firebaseInitialized'));

            return this.services;
        } catch (error) {
            console.error('Error al inicializar Firebase:', error);
            throw error;
        }
    }

    getServices() {
        if (!this.initialized) {
            throw new Error('Firebase no ha sido inicializado. Llama a initialize() primero.');
        }
        return this.services;
    }
}

// Exponer la función de inicialización globalmente
window.initializeFirebase = async () => {
    const manager = FirebaseManager.getInstance();
    return await manager.initialize();
};

// Inicializar Firebase cuando el documento esté listo
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await window.initializeFirebase();
    } catch (error) {
        console.error('Error al inicializar la aplicación:', error);
    }
});