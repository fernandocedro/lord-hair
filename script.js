// --- MOVIMENTO E ANIMAÇÃO DO CURSOR CUSTOMIZADO ---
const cursor = document.querySelector('.custom-cursor');
const cursorDot = document.querySelector('.custom-cursor-dot');

document.addEventListener('mousemove', (e) => {
    // Atualiza a posição do ponto central instantaneamente
    cursorDot.style.left = e.clientX + 'px';
    cursorDot.style.top = e.clientY + 'px';
    
    // Animação suave (atraso proposital) para o círculo externo do cursor
    cursor.animate({
        left: `${e.clientX}px`,
        top: `${e.clientY}px`
    }, { duration: 100, fill: "forwards" });
});

// Efeito de aumentar o cursor ao passar sobre links ou botões clicáveis
const interactables = document.querySelectorAll('a, .carousel-item, .grid-item');
interactables.forEach(item => {
    item.addEventListener('mouseenter', () => {
        cursor.style.transform = 'translate(-50%, -50%) scale(1.8)';
        cursor.style.backgroundColor = 'rgba(197, 155, 39, 0.2)';
    });
    item.addEventListener('mouseleave', () => {
        cursor.style.transform = 'translate(-50%, -50%) scale(1)';
        cursor.style.backgroundColor = 'transparent';
    });
});

// --- EFEITO DE MOVIMENTO SCROLL (EFEITO PARALLAX SIMPLIFICADO NA NAVBAR) ---
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.padding = '10px 50px';
        navbar.style.backgroundColor = '#4b4b4be6';
    } else {
        navbar.style.padding = '15px 50px';
        navbar.style.backgroundColor = '#4b4b4be6';
    }
});

// --- CONTROLE AUTOMÁTICO DO SLIDER DA HOME ---
const slides = document.querySelectorAll('.slide');
let currentSlide = 0;

function nextSlide() {
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
}

// Troca de slide a cada 5 segundos
setInterval(nextSlide, 5000);