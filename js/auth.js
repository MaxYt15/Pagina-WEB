// Clase para manejar la autenticación
class AuthManager {
    constructor() {
        // Esperar a que Firebase esté inicializado
        window.addEventListener('firebaseInitialized', () => {
            this.auth = window.firebaseServices.auth;
            this.googleProvider = window.firebaseServices.googleProvider;
            this.setupAuthStateListener();
        });
    }

    setupAuthStateListener() {
        this.auth.onAuthStateChanged(user => {
            if (user) {
                console.log('Usuario autenticado:', user.email);
                // Actualizar la UI para usuario autenticado
                this.updateUI(true);
            } else {
                console.log('Usuario no autenticado');
                // Actualizar la UI para usuario no autenticado
                this.updateUI(false);
            }
        });
    }

    async signInWithGoogle() {
        try {
            const result = await this.auth.signInWithPopup(this.googleProvider);
            console.log('Inicio de sesión con Google exitoso:', result.user.email);
            return result.user;
        } catch (error) {
            console.error('Error en inicio de sesión con Google:', error);
            throw error;
        }
    }

    async signOut() {
        try {
            await this.auth.signOut();
            console.log('Cierre de sesión exitoso');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            throw error;
        }
    }

    updateUI(isAuthenticated) {
        const loginButton = document.getElementById('loginButton');
        const logoutButton = document.getElementById('logoutButton');
        const userInfo = document.getElementById('userInfo');

        if (isAuthenticated) {
            loginButton.style.display = 'none';
            logoutButton.style.display = 'block';
            userInfo.style.display = 'block';
            userInfo.textContent = `Usuario: ${this.auth.currentUser.email}`;
        } else {
            loginButton.style.display = 'block';
            logoutButton.style.display = 'none';
            userInfo.style.display = 'none';
        }
    }
}

// Crear instancia de AuthManager cuando el documento esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});