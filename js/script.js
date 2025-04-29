// Namespace global para la aplicación
const App = {
    elements: {},
    services: null,
    
    async initialize() {
        this.initElements();
        await this.initFirebase();
        this.initUI();
    },

    initElements() {
        this.elements = {
            cursor: document.querySelector('.cursor'),
            cursorFollower: document.querySelector('.cursor-follower'),
            links: document.querySelectorAll('a'),
            loader: document.querySelector('.loader'),
            menuToggle: document.querySelector('.menu-toggle'),
            navLinks: document.querySelector('.nav-links'),
            hamburger: document.querySelector('.hamburger'),
            projectCards: document.querySelectorAll('.project-card'),
            contactForm: document.getElementById('contact-form'),
            inputs: document.querySelectorAll('.form-group input, .form-group textarea'),
            typingText: document.querySelector('.cyber-text'),
            loginBtn: document.getElementById('loginBtn'),
            userEmail: document.getElementById('userEmail')
        };
    },

    async initFirebase() {
        try {
            this.services = await window.initializeFirebase();
            if (this.services) {
                await this.initAuth();
                return true;
            }
            throw new Error('No se pudo inicializar Firebase');
        } catch (error) {
            console.error('Error al inicializar Firebase:', error);
            this.showStatusMessage('Error al conectar con el servicio de autenticación', 'error');
            return false;
        }
    },

    initUI() {
        this.initCursor();
        this.initLoader();
        this.initScrollAnimation();
        this.initMobileMenu();
        this.initParallax();
        this.initProjectCards();
        this.initContactForm();
        this.initTypingEffect();
        this.initSmoothScroll();
    },

    async initAuth() {
        if (!this.services?.auth) return;

        this.elements.loginBtn.addEventListener('click', async () => {
            try {
                const result = await this.services.auth.signInWithPopup(this.services.googleProvider);
                const user = result.user;
                
                try {
                    await this.services.db.collection('users').doc(user.uid).set({
                        email: user.email,
                        lastLogin: new Date(),
                        name: user.displayName,
                        photoURL: user.photoURL
                    }, { merge: true });

                    this.showStatusMessage('¡Bienvenido! Has iniciado sesión correctamente');
                } catch (dbError) {
                    console.error('Error al guardar datos de usuario:', dbError);
                    // Aún permitimos el inicio de sesión aunque falle el guardado en la base de datos
                    this.showStatusMessage('Sesión iniciada, pero hubo un error al guardar los datos', 'warning');
                }
            } catch (error) {
                console.error('Error al iniciar sesión:', error);
                
                let errorMessage = 'Error al iniciar sesión';
                
                switch(error.code) {
                    case 'auth/popup-blocked':
                        errorMessage = 'El navegador bloqueó la ventana emergente. Por favor, permite las ventanas emergentes para este sitio.';
                        break;
                    case 'auth/popup-closed-by-user':
                        errorMessage = 'Proceso de inicio de sesión cancelado.';
                        break;
                    case 'auth/unauthorized-domain':
                        errorMessage = 'Este dominio no está autorizado para iniciar sesión.';
                        break;
                    case 'auth/cancelled-popup-request':
                        // Ignoramos este error ya que es normal cuando se abre más de un popup
                        return;
                    default:
                        errorMessage = `Error: ${error.message}`;
                }
                
                this.showStatusMessage(errorMessage, 'error');
            }
        });

        this.services.auth.onAuthStateChanged(user => {
            if (user) {
                document.body.classList.add('authenticated');
                this.elements.userEmail.textContent = user.email;
                this.elements.userEmail.classList.add('visible');
                this.elements.loginBtn.style.display = 'none';
            } else {
                document.body.classList.remove('authenticated');
                this.elements.userEmail.textContent = '';
                this.elements.userEmail.classList.remove('visible');
                this.elements.loginBtn.style.display = 'block';
            }
        });
    },

    initCursor() {
        document.addEventListener('mousemove', (e) => {
            requestAnimationFrame(() => {
                this.elements.cursor.style.left = e.clientX + 'px';
                this.elements.cursor.style.top = e.clientY + 'px';
                
                setTimeout(() => {
                    this.elements.cursorFollower.style.left = e.clientX + 'px';
                    this.elements.cursorFollower.style.top = e.clientY + 'px';
                }, 100);
            });
        });

        this.elements.links.forEach(link => {
            link.addEventListener('mouseenter', () => {
                this.elements.cursor.style.transform = 'scale(2)';
                this.elements.cursorFollower.style.transform = 'scale(2)';
            });
            
            link.addEventListener('mouseleave', () => {
                this.elements.cursor.style.transform = 'scale(1)';
                this.elements.cursorFollower.style.transform = 'scale(1)';
            });
        });
    },

    initLoader() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.elements.loader.style.opacity = '0';
                setTimeout(() => {
                    this.elements.loader.style.display = 'none';
                }, 500);
            }, 1500);
        });
    },

    initScrollAnimation() {
        const scrollElements = document.querySelectorAll('.scroll-reveal');
        const elementInView = (el, offset = 0) => {
            const elementTop = el.getBoundingClientRect().top;
            return elementTop <= (window.innerHeight || document.documentElement.clientHeight) * (1 - offset);
        };

        const handleScrollAnimation = () => {
            scrollElements.forEach(el => {
                if (elementInView(el, 0.25)) {
                    el.classList.add('visible');
                } else {
                    el.classList.remove('visible');
                }
            });
        };

        window.addEventListener('scroll', () => {
            requestAnimationFrame(handleScrollAnimation);
        });
    },

    initMobileMenu() {
        this.elements.menuToggle.addEventListener('click', () => {
            this.elements.navLinks.classList.toggle('active');
            this.elements.hamburger.classList.toggle('active');
        });
    },

    initParallax() {
        let ticking = false;
        document.addEventListener('mousemove', (e) => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
                    const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
                    
                    gsap.to('.hero-content', {
                        x: moveX,
                        y: moveY,
                        duration: 1
                    });
                    ticking = false;
                });
                ticking = true;
            }
        });
    },

    initProjectCards() {
        this.elements.projectCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;
                
                requestAnimationFrame(() => {
                    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                });
            });
            
            card.addEventListener('mouseleave', () => {
                requestAnimationFrame(() => {
                    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
                });
            });
        });
    },

    initContactForm() {
        this.elements.inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.parentNode.classList.add('focused');
            });
            
            input.addEventListener('blur', () => {
                if (input.value === '') {
                    input.parentNode.classList.remove('focused');
                }
            });
        });

        this.elements.contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!this.services?.db) {
                this.showStatusMessage('Error: No hay conexión con la base de datos', 'error');
                return;
            }

            // Verificar si el usuario está autenticado
            if (!this.services.auth.currentUser) {
                this.showStatusMessage('Debes iniciar sesión para enviar mensajes', 'error');
                return;
            }
            
            const formData = new FormData(this.elements.contactForm);
            const messageData = {
                name: formData.get('name'),
                email: formData.get('email'),
                message: formData.get('message'),
                timestamp: new Date(),
                userId: this.services.auth.currentUser.uid,
                status: 'pending'
            };

            try {
                await this.services.db.collection('messages').add(messageData);
                this.showStatusMessage('¡Mensaje enviado correctamente!');
                this.elements.contactForm.reset();

                const whatsappMessage = `Nuevo mensaje de ${messageData.name} (${messageData.email}): ${messageData.message}`;
                const whatsappUrl = `https://wa.me/51901437507?text=${encodeURIComponent(whatsappMessage)}`;
                window.open(whatsappUrl, '_blank');
            } catch (error) {
                console.error('Error al enviar el mensaje:', error);
                if (error.code === 'permission-denied') {
                    this.showStatusMessage('Error: No tienes permisos para enviar mensajes. Por favor, inicia sesión nuevamente.', 'error');
                } else {
                    this.showStatusMessage('Error al enviar el mensaje: ' + error.message, 'error');
                }
            }
        });
    },

    initTypingEffect() {
        if (!this.elements.typingText) return;
        
        const text = this.elements.typingText.textContent;
        this.elements.typingText.textContent = '';
        let charIndex = 0;

        const typeText = () => {
            if (charIndex < text.length) {
                this.elements.typingText.textContent += text.charAt(charIndex);
                charIndex++;
                setTimeout(typeText, 100);
            }
        };

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    typeText();
                    observer.unobserve(entry.target);
                }
            });
        });

        observer.observe(this.elements.typingText);
    },

    initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const href = anchor.getAttribute('href');
                
                // Si el href es solo '#', no hacemos nada
                if (href === '#') return;
                
                const target = document.querySelector(href);
                if (target) {
                    gsap.to(window, {
                        duration: 1,
                        scrollTo: {
                            y: target,
                            offsetY: 70
                        },
                        ease: "power3.inOut"
                    });
                }
            });
        });
    },

    showStatusMessage(message, type = 'success') {
        const statusDiv = document.createElement('div');
        statusDiv.className = `status-message ${type}`;
        statusDiv.textContent = message;
        document.body.appendChild(statusDiv);

        requestAnimationFrame(() => {
            statusDiv.classList.add('visible');
        });

        setTimeout(() => {
            statusDiv.classList.remove('visible');
            setTimeout(() => {
                statusDiv.remove();
            }, 300);
        }, 3000);
    }
};

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => App.initialize());