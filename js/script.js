// Cursor personalizado
const cursor = document.querySelector('.cursor');
const cursorFollower = document.querySelector('.cursor-follower');
const links = document.querySelectorAll('a');

document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    
    setTimeout(() => {
        cursorFollower.style.left = e.clientX + 'px';
        cursorFollower.style.top = e.clientY + 'px';
    }, 100);
});

links.forEach(link => {
    link.addEventListener('mouseenter', () => {
        cursor.style.transform = 'scale(2)';
        cursorFollower.style.transform = 'scale(2)';
    });
    
    link.addEventListener('mouseleave', () => {
        cursor.style.transform = 'scale(1)';
        cursorFollower.style.transform = 'scale(1)';
    });
});

// Loader
window.addEventListener('load', () => {
    const loader = document.querySelector('.loader');
    setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    }, 1500);
});

// Animación de scroll
const scrollElements = document.querySelectorAll('.scroll-reveal');

const elementInView = (el, scrollOffset = 0) => {
    const elementTop = el.getBoundingClientRect().top;
    return (
        elementTop <= 
        (window.innerHeight || document.documentElement.clientHeight) * (1 - scrollOffset)
    );
};

const displayScrollElement = (element) => {
    element.classList.add('visible');
};

const hideScrollElement = (element) => {
    element.classList.remove('visible');
};

const handleScrollAnimation = () => {
    scrollElements.forEach((el) => {
        if (elementInView(el, 0.25)) {
            displayScrollElement(el);
        } else {
            hideScrollElement(el);
        }
    });
};

window.addEventListener('scroll', () => {
    handleScrollAnimation();
});

// Menú móvil
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const hamburger = document.querySelector('.hamburger');

menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Efecto parallax en hero
document.addEventListener('mousemove', (e) => {
    const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
    const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
    
    gsap.to('.hero-content', {
        x: moveX,
        y: moveY,
        duration: 1
    });
});

// Animación de proyectos
const projectCards = document.querySelectorAll('.project-card');

projectCards.forEach(card => {
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

// Formulario de contacto
const contactForm = document.getElementById('contact-form');
const inputs = document.querySelectorAll('.form-group input, .form-group textarea');

inputs.forEach(input => {
    input.addEventListener('focus', () => {
        input.parentNode.classList.add('focused');
    });
    
    input.addEventListener('blur', () => {
        if (input.value === '') {
            input.parentNode.classList.remove('focused');
        }
    });
});

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Aquí puedes agregar la lógica para enviar el formulario
    const formData = new FormData(contactForm);
    console.log('Formulario enviado:', Object.fromEntries(formData));
    
    // Animación de éxito
    const button = contactForm.querySelector('button');
    button.innerHTML = '¡Enviado!';
    button.style.backgroundColor = 'var(--neon-tertiary)';
    
    setTimeout(() => {
        button.innerHTML = 'Enviar Mensaje';
        button.style.backgroundColor = '';
        contactForm.reset();
    }, 3000);
});

// Efecto de typing para textos
const typingText = document.querySelector('.cyber-text');
const text = typingText.textContent;
typingText.textContent = '';

let charIndex = 0;
function typeText() {
    if (charIndex < text.length) {
        typingText.textContent += text.charAt(charIndex);
        charIndex++;
        setTimeout(typeText, 100);
    }
}

// Iniciar el efecto de typing cuando el elemento está en vista
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            typeText();
            observer.unobserve(entry.target);
        }
    });
});

observer.observe(typingText);

// Smooth scroll
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

// Autenticación con Google
const loginBtn = document.getElementById('loginBtn');
const userEmail = document.getElementById('userEmail');

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

// Manejar el inicio de sesión con Google
loginBtn.addEventListener('click', async () => {
    try {
        const result = await auth.signInWithPopup(googleProvider);
        const user = result.user;
        
        // Guardar información del usuario en Firestore
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

// Observador del estado de autenticación
auth.onAuthStateChanged(user => {
    if (user) {
        // Usuario está autenticado
        document.body.classList.add('authenticated');
        userEmail.textContent = user.email;
        userEmail.classList.add('visible');
        loginBtn.style.display = 'none';
    } else {
        // Usuario no está autenticado
        document.body.classList.remove('authenticated');
        userEmail.textContent = '';
        userEmail.classList.remove('visible');
        loginBtn.style.display = 'block';
    }
});

// Manejar el envío del formulario de contacto
contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(contactForm);
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
        contactForm.reset();

        // Enviar notificación a WhatsApp (opcional)
        const whatsappMessage = `Nuevo mensaje de ${messageData.name} (${messageData.email}): ${messageData.message}`;
        const whatsappUrl = `https://wa.me/51901437507?text=${encodeURIComponent(whatsappMessage)}`;
        window.open(whatsappUrl, '_blank');
    } catch (error) {
        console.error('Error al enviar el mensaje:', error);
        showStatusMessage('Error al enviar el mensaje', 'error');
    }
});