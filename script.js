import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// SUAS CONFIGURAÇÕES DO FIREBASE AQUI
const firebaseConfig = {
  apiKey: "AIzaSyCs32O5jd66cuY84F7jtjShc-AJXM75SQc",
  authDomain: "lordhair-abe17.firebaseapp.com",
  projectId: "lordhair-abe17",
  storageBucket: "lordhair-abe17.firebasestorage.app",
  messagingSenderId: "682667035819",
  appId: "1:682667035819:web:6be807dbcba2145582fbee",
  measurementId: "G-FXN2LNDQ8X"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- MOVIMENTO E ANIMAÇÃO DO CURSOR CUSTOMIZADO ---
const cursor = document.querySelector('.custom-cursor');
const cursorDot = document.querySelector('.custom-cursor-dot');

function applyHover() {
    if (cursor) {
        cursor.style.transform = 'translate(-50%, -50%) scale(1.8)';
        cursor.style.backgroundColor = 'rgba(197, 155, 39, 0.2)';
    }
}

function removeHover() {
    if (cursor) {
        cursor.style.transform = 'translate(-50%, -50%) scale(1)';
        cursor.style.backgroundColor = 'transparent';
    }
}

// Função para aplicar o efeito hover nos elementos interativos
function initCursorEvents() {
    const interactables = document.querySelectorAll('a, .carousel-item, .grid-item, button');
    interactables.forEach(item => {
        item.removeEventListener('mouseenter', applyHover);
        item.removeEventListener('mouseleave', removeHover);
        item.addEventListener('mouseenter', applyHover);
        item.addEventListener('mouseleave', removeHover);
    });
}

if (cursor && cursorDot) {
    // Garante visibilidade e z-index via JS por segurança
    cursor.style.zIndex = '999999';
    cursorDot.style.zIndex = '999999';

    window.addEventListener('mousemove', (e) => {
        cursorDot.style.left = `${e.clientX}px`;
        cursorDot.style.top = `${e.clientY}px`;
        
        cursor.animate({
            left: `${e.clientX}px`,
            top: `${e.clientY}px`
        }, { duration: 100, fill: "forwards" });
    });

    window.addEventListener('scroll', () => {
        cursor.style.display = 'block';
        cursorDot.style.display = 'block';
    });

    initCursorEvents();
}

// --- EFEITO DE MOVIMENTO SCROLL (EFEITO PARALLAX SIMPLIFICADO NA NAVBAR) ---
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.style.padding = '10px 50px';
            navbar.style.backgroundColor = '#4b4b4be6';
        } else {
            navbar.style.padding = '15px 50px';
            navbar.style.backgroundColor = '#4b4b4be6';
        }
    }
});

// --- CONTROLE DO SLIDER DA HOME ---
let sliderInterval = null;

function iniciarSlider() {
    const slides = document.querySelectorAll('.slide');
    if (slides.length <= 1) return;

    let currentSlide = 0;

    if (sliderInterval) clearInterval(sliderInterval);

    sliderInterval = setInterval(() => {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }, 5000);
}

// --- CARREGAMENTO DE CONTEÚDO DO FIREBASE ---
async function carregarConteudoDinamico() {
    try {
        // 1. Carregar Textos
        const txtSnap = await getDoc(doc(db, "conteudo", "textos"));
        if (txtSnap.exists()) {
            const data = txtSnap.data();
            const elQuemSomos = document.querySelector('.brief-text p');
            const elHistoria = document.querySelector('.brand-story p');
            
            if (data.quemSomosHome && elQuemSomos) elQuemSomos.innerText = data.quemSomosHome;
            if (data.historia && elHistoria) elHistoria.innerText = data.historia;
        }

        // 2. Carregar Slides do Firebase
        const slidesSnap = await getDocs(collection(db, "slides"));
        const sliderContainer = document.querySelector('.slider-container');
        
        if (!slidesSnap.empty && sliderContainer) {
            sliderContainer.innerHTML = ''; // Limpa slides antigos/estáticos
            let isActive = true;

            slidesSnap.forEach((docSnap) => {
                const item = docSnap.data();
                const slideDiv = document.createElement('div');
                slideDiv.className = `slide ${isActive ? 'active' : ''}`;
                slideDiv.innerHTML = `
                    <img src="${item.imgUrl}" alt="${item.title}">
                    <div class="slide-content">
                        <h2>${item.title}</h2>
                        <p>${item.subtitle}</p>
                    </div>
                `;
                sliderContainer.appendChild(slideDiv);
                isActive = false;
            });

            iniciarSlider();
        } else {
            iniciarSlider();
        }

        // 3. Carregar Fotos do Portfólio do Firebase
        const portfolioSnap = await getDocs(collection(db, "portfolio"));
        const gridContainer = document.querySelector('.grid-container');

        if (!portfolioSnap.empty && gridContainer) {
            gridContainer.innerHTML = ''; // Limpa fotos antigas/estáticas
            portfolioSnap.forEach((docSnap) => {
                const item = docSnap.data();
                const gridItem = document.createElement('div');
                gridItem.className = 'grid-item';
                gridItem.innerHTML = `<img src="${item.imgUrl}" alt="Portfólio">`;
                gridContainer.appendChild(gridItem);
            });
        }

        // Re-aplica os eventos de hover do mouse nos elementos recém-carregados
        initCursorEvents();

    } catch (error) {
        console.error("Erro ao carregar dados do Firebase:", error);
    }
}

// Inicializa a busca dos dados do Firebase
carregarConteudoDinamico();