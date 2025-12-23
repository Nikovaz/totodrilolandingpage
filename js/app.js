// ============================================
// TOTODRILO.TECH - JavaScript Principal  
// Automatización con IA para E-commerce
// ============================================

// Variables globales para el menú
let menuAbierto = false;

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    initEmailJS();
});

// Función principal de inicialización
function initializeApp() {
    setupMobileMenu();
    setupSmoothScrolling();
    setupHeaderScroll();
    setupScrollAnimations();
    setupCTATracking();
    initConsoleMessage();
}

// ============ MENÚ MÓVIL ============
function setupMobileMenu() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navClose = document.getElementById('nav-close');
    
    if (!navToggle || !navMenu) {
        console.error('❌ Nav toggle o nav menu no encontrado');
        return;
    }
    
    console.log('✅ Menu mobile inicializado correctamente');
    console.log('🔧 NavToggle:', navToggle);
    console.log('🔧 NavMenu:', navMenu);
    console.log('🔧 NavClose:', navClose);
    
    // Función para cerrar el menú
    function cerrarMenu() {
        console.log('🔴 Cerrando menú...');
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
        document.body.style.overflow = '';
        menuAbierto = false;
        console.log('✅ MENU CERRADO');
    }
    
    // Función para abrir el menú
    function abrirMenu() {
        console.log('🟢 Abriendo menú...');
        navMenu.classList.add('active');
        navToggle.classList.add('active');
        document.body.style.overflow = 'hidden';
        menuAbierto = true;
        console.log('✅ MENU ABIERTO');
        console.log('🔍 Clases del menu:', navMenu.classList.toString());
    }
    
    // Click en el botón CERRAR (X) dentro del menú
    if (navClose) {
        navClose.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('❌ Botón CERRAR clickeado');
            cerrarMenu();
        });
        console.log('✅ Event listener agregado al botón cerrar');
    } else {
        console.warn('⚠️ Botón de cerrar no encontrado');
    }
    
    // Click en el burger toggle
    navToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('🍔 Burger clickeado');
        console.log('📊 Estado actual menuAbierto:', menuAbierto);
        console.log('📊 Clases actuales:', navMenu.classList.toString());
        
        if (menuAbierto) {
            cerrarMenu();
        } else {
            abrirMenu();
        }
    });
    console.log('✅ Event listener agregado al burger toggle');
    
    // Cerrar al hacer click en los links
    const navLinks = document.querySelectorAll('.nav-link, .nav-cta');
    console.log('🔗 Links encontrados:', navLinks.length);
    navLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            console.log('🔗 Link clicked:', this.textContent.trim());
            cerrarMenu();
        });
    });
    
    // Cerrar al hacer click fuera del menú
    document.addEventListener('click', function(e) {
        if (menuAbierto) {
            const clickEnMenu = navMenu.contains(e.target);
            const clickEnToggle = navToggle.contains(e.target);
            
            if (!clickEnMenu && !clickEnToggle) {
                console.log('🖱️ Click fuera del menú detectado');
                cerrarMenu();
            }
        }
    });
    
    // Cerrar con ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && menuAbierto) {
            console.log('⌨️ ESC presionado');
            cerrarMenu();
        }
    });
    
    console.log('✅ Todos los event listeners configurados');
}

// ============ NAVEGACIÓN SUAVE ============
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '') return;
            
            e.preventDefault();
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const header = document.querySelector('.header');
                const headerHeight = header ? header.offsetHeight : 80;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ============ EFECTOS DE HEADER AL SCROLL ============
function setupHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        if (currentScroll > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// ============ ANIMACIONES DE SCROLL ============
function setupScrollAnimations() {
    if (!('IntersectionObserver' in window)) return;
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    
    document.querySelectorAll('.service-card, .case-card, .problem-card, .benefit-item, .testimonial-card, .step-item, .hero-badge, .hero-stats')
        .forEach(el => observer.observe(el));
}

// ============ TRACKING DE CTAs ============
function setupCTATracking() {
    document.querySelectorAll('.cta-button, .demo-btn, .case-link').forEach(function(button) {
        button.addEventListener('click', function() {
            console.log('CTA Click:', this.textContent.trim());
        });
    });
}

// ============ FUNCIÓN PARA SCROLL A SECCIÓN ============
window.scrollToSection = function(sectionId) {
    const targetElement = document.getElementById(sectionId);
    if (targetElement) {
        const header = document.querySelector('.header');
        const headerHeight = header ? header.offsetHeight : 80;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    }
};

// ============ MENSAJE DE CONSOLA ============
function initConsoleMessage() {
    console.log('%c🤖 Totodrilo.tech', 'color: #8b5cf6; font-size: 24px; font-weight: bold;');
    console.log('%cAutomatización con IA para E-commerce', 'color: #06d6a0; font-size: 16px;');
}

// ============ ESTILOS CSS ============
const style = document.createElement('style');
style.textContent = `
    .service-card, .case-card, .problem-card, .benefit-item, .testimonial-card, .step-item {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    .service-card.animate-in, .case-card.animate-in, .problem-card.animate-in, 
    .benefit-item.animate-in, .testimonial-card.animate-in, .step-item.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    @media (min-width: 969px) {
        .nav-toggle { display: none !important; }
    }
`;
document.head.appendChild(style);

console.log('%c✅ Totodrilo.tech cargado', 'color: #06d6a0; font-weight: bold;');

// ============ EMAILJS CONFIGURATION ============
function initEmailJS() {
    // Inicializar EmailJS con tu Public Key
    emailjs.init('4bupfioQ6sBuwdkOU');
    
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const formMessage = document.getElementById('form-message');
    
    if (!contactForm) {
        console.error('❌ Formulario de contacto no encontrado');
        return;
    }
    
    console.log('✅ EmailJS inicializado correctamente');
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Deshabilitar botón y mostrar loading
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        formMessage.textContent = '';
        formMessage.className = 'form-message';
        
        // Obtener los datos del formulario
        const templateParams = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            business: document.getElementById('business').value,
            message: document.getElementById('message').value
        };
        
        console.log('📧 Enviando email con:', templateParams);
        
        // Enviar email usando EmailJS
        emailjs.send(
            'service_bpjxmaa',  // Tu Service ID
            'template_foyunhx', // Tu Template ID
            templateParams
        )
        .then(function(response) {
            console.log('✅ Email enviado exitosamente:', response);
            
            // Mostrar mensaje de éxito
            formMessage.textContent = '¡Mensaje enviado con éxito! Te contactaremos pronto.';
            formMessage.className = 'form-message success';
            
            // Resetear formulario
            contactForm.reset();
            
            // Restaurar botón después de 3 segundos
            setTimeout(function() {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar Mensaje';
            }, 3000);
            
        }, function(error) {
            console.error('❌ Error al enviar email:', error);
            
            // Mostrar mensaje de error
            formMessage.textContent = 'Hubo un error al enviar el mensaje. Por favor, intentá de nuevo o contactanos por WhatsApp.';
            formMessage.className = 'form-message error';
            
            // Restaurar botón
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar Mensaje';
        });
    });
}


















