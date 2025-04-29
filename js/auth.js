// Clase para manejar la autenticación
class AuthManager {
    constructor() {
        this.authContainer = document.getElementById('auth-container');
        this.mainContent = document.getElementById('main-content');
        this.setupAuthUI();
    }

    setupAuthUI() {
        const services = window.firebaseServices;
        if (!services || !services.auth) {
            console.error('Los servicios de Firebase no están disponibles');
            return;
        }

        // Configurar UI para autenticación por teléfono
        try {
            window.recaptchaVerifier = new services.auth.RecaptchaVerifier('recaptcha-container', {
                'size': 'normal',
                'callback': (response) => {
                    this.enableSignInButton();
                }
            });
        } catch (error) {
            console.error('Error al configurar reCAPTCHA:', error);
        }

        // Manejadores de eventos para los formularios
        document.getElementById('phone-form')?.addEventListener('submit', (e) => this.handlePhoneSignIn(e));
        document.getElementById('verification-form')?.addEventListener('submit', (e) => this.handleCodeVerification(e));
        document.getElementById('email-form')?.addEventListener('submit', (e) => this.handleEmailSignIn(e));
        document.getElementById('register-form')?.addEventListener('submit', (e) => this.handleRegistration(e));
        
        // Configurar el botón de Google
        document.getElementById('googleSignIn')?.addEventListener('click', () => this.handleGoogleSignIn());
        
        // Botones de cambio de formulario
        document.querySelectorAll('[data-auth-action]').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchForm(e.target.dataset.authAction);
            });
        });

        // Observador de estado de autenticación
        services.auth.onAuthStateChanged(user => this.handleAuthStateChange(user));
    }

    async handlePhoneSignIn(e) {
        e.preventDefault();
        const phoneNumber = document.getElementById('phone').value;
        try {
            const confirmationResult = await window.firebaseServices.auth
                .signInWithPhoneNumber(phoneNumber, window.recaptchaVerifier);
            window.confirmationResult = confirmationResult;
            this.switchForm('verification');
        } catch (error) {
            console.error('Error al enviar código:', error);
            this.showError(error.message);
        }
    }

    async handleCodeVerification(e) {
        e.preventDefault();
        const code = document.getElementById('verification-code').value;
        try {
            await window.confirmationResult.confirm(code);
        } catch (error) {
            console.error('Error al verificar código:', error);
            this.showError('Código inválido');
        }
    }

    async confirmarContinuar() {
        return new Promise((resolve) => {
            const confirmar = window.confirm('¿Desea continuar con la iteración?');
            resolve(confirmar);
        });
    }

    async handleEmailSignIn(e) {
        e.preventDefault();
        if (!await this.confirmarContinuar()) return;
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        try {
            await window.firebaseServices.auth.signInWithEmailAndPassword(email, password);
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            this.showError(error.message);
        }
    }

    async handleGoogleSignIn() {
        if (!await this.confirmarContinuar()) return;
        
        try {
            const provider = new window.firebaseServices.auth.GoogleAuthProvider();
            const result = await window.firebaseServices.auth.signInWithPopup(provider);
            
            // Guardar información del usuario
            await window.firebaseServices.db.collection('users').doc(result.user.uid).set({
                email: result.user.email,
                name: result.user.displayName,
                photoURL: result.user.photoURL,
                lastLogin: new Date()
            }, { merge: true });
        } catch (error) {
            console.error('Error al iniciar sesión con Google:', error);
            this.showError(error.message);
        }
    }

    async handleRegistration(e) {
        e.preventDefault();
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const name = document.getElementById('reg-name').value;
        const lastName = document.getElementById('reg-lastname').value;

        try {
            const result = await window.firebaseServices.auth.createUserWithEmailAndPassword(email, password);
            await result.user.updateProfile({
                displayName: `${name} ${lastName}`
            });
            
            // Guardar información adicional en Firestore
            await window.firebaseServices.db.collection('users').doc(result.user.uid).set({
                email: email,
                name: name,
                lastName: lastName,
                createdAt: new Date(),
                lastLogin: new Date()
            });

            // Enviar email de verificación
            await result.user.sendEmailVerification();
            this.showSuccess('Registro exitoso. Por favor verifica tu correo electrónico.');
        } catch (error) {
            console.error('Error al registrar:', error);
            this.showError(error.message);
        }
    }

    handleAuthStateChange(user) {
        if (user) {
            // Usuario autenticado
            if (this.authContainer) this.authContainer.style.display = 'none';
            if (this.mainContent) this.mainContent.style.display = 'block';
            
            // Actualizar último login
            window.firebaseServices.db.collection('users').doc(user.uid).update({
                lastLogin: new Date()
            }).catch(console.error);
        } else {
            // No autenticado
            if (this.authContainer) this.authContainer.style.display = 'flex';
            if (this.mainContent) this.mainContent.style.display = 'none';
        }
    }

    switchForm(formId) {
        document.querySelectorAll('.auth-form').forEach(form => {
            form.style.display = 'none';
        });
        document.getElementById(`${formId}-form`)?.style.display = 'block';
    }

    showError(message) {
        const errorDiv = document.getElementById('auth-error');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 5000);
        }
    }

    showSuccess(message) {
        const successDiv = document.getElementById('auth-success');
        if (successDiv) {
            successDiv.textContent = message;
            successDiv.style.display = 'block';
            setTimeout(() => {
                successDiv.style.display = 'none';
            }, 5000);
        }
    }

    enableSignInButton() {
        const phoneForm = document.getElementById('phone-form');
        if (phoneForm) {
            const submitButton = phoneForm.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = false;
            }
        }
    }
}

// Hacer la clase disponible globalmente
window.AuthManager = AuthManager;

// Inicializar AuthManager cuando el documento esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Esperar a que Firebase esté inicializado
    window.addEventListener('firebaseInitialized', () => {
        if (!window.firebaseServices) {
            console.error('No se pudo inicializar Firebase');
            return;
        }
        window.authManager = new AuthManager();
    });
});