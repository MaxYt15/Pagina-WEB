// Clase Singleton para manejar Firebase
class FirebaseManager {
    static instance = null;
    
    constructor() {
        if (FirebaseManager.instance) {
            return FirebaseManager.instance;
        }
        FirebaseManager.instance = this;
        this.initialized = false;
    }

    static getInstance() {
        if (!FirebaseManager.instance) {
            FirebaseManager.instance = new FirebaseManager();
        }
        return FirebaseManager.instance;
    }

    async initialize() {
        if (this.initialized) return this.services;

        const firebaseConfig = {
            apiKey: "AIzaSyBDJ9Ouxup0-HQn_lC3HCkj5k3HnLp2ypI",
            authDomain: "mi-pagina-80920.firebaseapp.com",
            projectId: "mi-pagina-80920",
            storageBucket: "mi-pagina-80920.firebasestorage.app",
            messagingSenderId: "478583666607",
            appId: "1:478583666607:web:d77f92c2f700e98635615a",
            measurementId: "G-9F7FJ8WN7H"
        };

        try {
            // Esperar a que Firebase esté disponible
            let retries = 0;
            while (typeof firebase === 'undefined' && retries < 5) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                retries++;
            }

            if (typeof firebase === 'undefined') {
                throw new Error('Firebase no está disponible después de varios intentos');
            }

            // Inicializar Firebase solo si no hay instancias previas
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            }

            this.services = {
                auth: firebase.auth(),
                db: firebase.firestore(),
                googleProvider: new firebase.auth.GoogleAuthProvider(),
                timestamp: firebase.firestore.FieldValue.serverTimestamp
            };

            // Configurar persistencia para mejor rendimiento offline
            try {
                await this.services.db.enablePersistence({
                    synchronizeTabs: true
                });
            } catch (err) {
                if (err.code === 'failed-precondition') {
                    // Múltiples pestañas abiertas, no se puede habilitar persistencia
                    console.warn('La persistencia de Firestore requiere una sola pestaña abierta');
                } else if (err.code === 'unimplemented') {
                    // El navegador no soporta persistencia
                    console.warn('Este navegador no soporta persistencia de Firestore');
                }
            }

            // Configurar el proveedor de Google
            this.services.googleProvider.setCustomParameters({
                prompt: 'select_account'
            });

            this.initialized = true;
            console.log('Firebase inicializado correctamente');
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

    // Método para verificar permisos
    async checkPermissions(collectionName) {
        if (!this.services?.auth.currentUser) {
            return false;
        }

        try {
            // Intenta hacer una operación de prueba
            await this.services.db.collection(collectionName)
                .where('userId', '==', this.services.auth.currentUser.uid)
                .limit(1)
                .get();
            return true;
        } catch (error) {
            console.error('Error al verificar permisos:', error);
            return false;
        }
    }
}

// Exportar una única instancia
const firebaseManager = FirebaseManager.getInstance();

// Inicializar Firebase y exportar los servicios globalmente de manera segura
window.initializeFirebase = async () => {
    try {
        const services = await firebaseManager.initialize();
        window.firebaseServices = services;
        return services;
    } catch (error) {
        console.error('Error al inicializar Firebase:', error);
        return null;
    }
};