// Elementos DOM
const elements = {
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

// Cursor personalizado
function initCursor() {
    document.addEventListener('mousemove', (e) => {
        elements.cursor.style.left = e.clientX + 'px';
        elements.cursor.style.top = e.clientY + 'px';
        
        setTimeout(() => {
            elements.cursorFollower.style.left = e.clientX + 'px';
            elements.cursorFollower.style.top = e.clientY + 'px';
        }, 100);
    });

    elements.links.forEach(link => {
        link.addEventListener('mouseenter', () => {
            elements.cursor.style.transform = 'scale(2)';
            elements.cursorFollower.style.transform = 'scale(2)';
        });
        
        link.addEventListener('mouseleave', () => {
            elements.cursor.style.transform = 'scale(1)';
            elements.cursorFollower.style.transform = 'scale(1)';
        });
    });
}

// Loader
function initLoader() {
    window.addEventListener('load', () => {
        setTimeout(() => {
            elements.loader.style.opacity = '0';
            setTimeout(() => {
                elements.loader.style.display = 'none';
            }, 500);
        }, 1500);
    });
}

// Animación de scroll
function initScrollAnimation() {
    const scrollElements = document.querySelectorAll('.scroll-reveal');

    const elementInView = (el, scrollOffset = 0) => {
        const elementTop = el.getBoundingClientRect().top;
        return (
            elementTop <= 
            (window.innerHeight || document.documentElement.clientHeight) * (1 - scrollOffset)
        );
    };

    const handleScrollAnimation = () => {
        scrollElements.forEach((el) => {
            if (elementInView(el, 0.25)) {
                el.classList.add('visible');
            } else {
                el.classList.remove('visible');
            }
        });
    };

    window.addEventListener('scroll', handleScrollAnimation);
}

// Menú móvil
function initMobileMenu() {
    elements.menuToggle.addEventListener('click', () => {
        elements.navLinks.classList.toggle('active');
        elements.hamburger.classList.toggle('active');
    });
}

// Efecto parallax
function initParallax() {
    document.addEventListener('mousemove', (e) => {
        const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
        const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
        
        gsap.to('.hero-content', {
            x: moveX,
            y: moveY,
            duration: 1
        });
    });
}

// Animación de proyectos
function initProjectCards() {
    elements.projectCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
        });
    });
}

// Formulario de contacto
function initContactForm() {
    elements.inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentNode.classList.add('focused');
        });
        
        input.addEventListener('blur', () => {
            if (input.value === '') {
                input.parentNode.classList.remove('focused');
            }
        });
    });

    elements.contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(elements.contactForm);
        const messageData = {
            name: formData.get('name'),
            email: formData.get('email'),
            message: formData.get('message'),
            timestamp: new Date(),
            status: 'pending'
        };

        try {
            // Guardar el mensaje en Firestore
            await db.collection('messages').add(messageData);
            
            showStatusMessage('¡Mensaje enviado correctamente!');
            elements.contactForm.reset();

            // Enviar notificación a WhatsApp
            const whatsappMessage = `Nuevo mensaje de ${messageData.name} (${messageData.email}): ${messageData.message}`;
            const whatsappUrl = `https://wa.me/51901437507?text=${encodeURIComponent(whatsappMessage)}`;
            window.open(whatsappUrl, '_blank');
        } catch (error) {
            console.error('Error al enviar el mensaje:', error);
            showStatusMessage('Error al enviar el mensaje', 'error');
        }
    });
}

// Efecto de typing
function initTypingEffect() {
    if (!elements.typingText) return;
    
    const text = elements.typingText.textContent;
    elements.typingText.textContent = '';
    let charIndex = 0;

    function typeText() {
        if (charIndex < text.length) {
            elements.typingText.textContent += text.charAt(charIndex);
            charIndex++;
            setTimeout(typeText, 100);
        }
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                typeText();
                observer.unobserve(entry.target);
            }
        });
    });

    observer.observe(elements.typingText);
}

// Smooth scroll
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
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
}

// Función para mostrar mensajes de estado
function showStatusMessage(message, type = 'success') {
    const statusDiv = document.createElement('div');
    statusDiv.className = `status-message ${type}`;
    statusDiv.textContent = message;
    document.body.appendChild(statusDiv);

    setTimeout(() => {
        statusDiv.classList.add('visible');
    }, 100);

    setTimeout(() => {
        statusDiv.classList.remove('visible');
        setTimeout(() => {
            statusDiv.remove();
        }, 300);
    }, 3000);
}

// Autenticación con Google
function initAuth() {
    elements.loginBtn.addEventListener('click', async () => {
        try {
            const result = await auth.signInWithPopup(googleProvider);
            const user = result.user;
            
            await db.collection('users').doc(user.uid).set({
                email: user.email,
                lastLogin: new Date(),
                name: user.displayName
            }, { merge: true });

            showStatusMessage('¡Bienvenido! Has iniciado sesión correctamente');
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            showStatusMessage('Error al iniciar sesión', 'error');
        }
    });

    auth.onAuthStateChanged(user => {
        if (user) {
            document.body.classList.add('authenticated');
            elements.userEmail.textContent = user.email;
            elements.userEmail.classList.add('visible');
            elements.loginBtn.style.display = 'none';
        } else {
            document.body.classList.remove('authenticated');
            elements.userEmail.textContent = '';
            elements.userEmail.classList.remove('visible');
            elements.loginBtn.style.display = 'block';
        }
    });
}

// Inicialización
function init() {
    initCursor();
    initLoader();
    initScrollAnimation();
    initMobileMenu();
    initParallax();
    initProjectCards();
    initContactForm();
    initTypingEffect();
    initSmoothScroll();
    initAuth();
}

// Iniciar la aplicación
init();