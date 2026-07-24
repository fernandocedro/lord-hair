import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// COPIE E COLE SUAS CONFIGURAÇÕES DO FIREBASE AQUI
const firebaseConfig = {
  apiKey: "AIzaSyCs32O5jd66cuY84F7jtjShc-AJXM75SQc",
  authDomain: "lordhair-abe17.firebaseapp.com",
  projectId: "lordhair-abe17",
  storageBucket: "lordhair-abe17.firebasestorage.app",
  messagingSenderId: "682667035819",
  appId: "1:682667035819:web:6be807dbcba2145582fbee",
  measurementId: "G-FXN2LNDQ8X"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// --- 1. CONTROLE DE AUTENTICAÇÃO E SESSÃO (LOGIN / LOGOUT) ---
const loginSection = document.getElementById('login-section');
const adminPanel = document.getElementById('admin-panel');
const logoutBtnContainer = document.getElementById('btn-logout-container');
const loginError = document.getElementById('login-error');

// Observa se o usuário está autenticado
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Usuário logado
        if (loginSection) loginSection.classList.add('hidden');
        if (adminPanel) adminPanel.classList.remove('hidden');
        if (logoutBtnContainer) logoutBtnContainer.classList.remove('hidden');
        
        // Carrega dados do banco
        carregarTextos();
        carregarSlides();
        carregarPortfolio();
    } else {
        // Usuário deslogado
        if (loginSection) loginSection.classList.remove('hidden');
        if (adminPanel) adminPanel.classList.add('hidden');
        if (logoutBtnContainer) logoutBtnContainer.classList.add('hidden');
    }
});

// Ação do formulário de Login
const formLogin = document.getElementById('form-login');
if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (loginError) loginError.style.display = 'none';

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            if (loginError) {
                loginError.innerText = "E-mail ou senha incorretos!";
                loginError.style.display = 'block';
            }
        }
    });
}

// Ação do botão de Logout
const btnLogout = document.getElementById('btn-logout');
if (btnLogout) {
    btnLogout.addEventListener('click', () => {
        signOut(auth);
    });
}

// --- 2. GERENCIAR TEXTOS DO SITE ---
async function carregarTextos() {
    try {
        const docRef = doc(db, "conteudo", "textos");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            const txtQuemSomos = document.getElementById('txt-quem-somos-home');
            const txtHistoria = document.getElementById('txt-historia');

            if (txtQuemSomos) txtQuemSomos.value = data.quemSomosHome || '';
            if (txtHistoria) txtHistoria.value = data.historia || '';
        }
    } catch (error) {
        console.error("Erro ao carregar textos:", error);
    }
}

const formTextos = document.getElementById('form-textos');
if (formTextos) {
    formTextos.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await setDoc(doc(db, "conteudo", "textos"), {
                quemSomosHome: document.getElementById('txt-quem-somos-home').value,
                historia: document.getElementById('txt-historia').value
            });
            alert("Textos atualizados com sucesso!");
        } catch (error) {
            alert("Erro ao salvar textos!");
            console.error(error);
        }
    });
}

// --- 3. GERENCIAR SLIDES DA HOME ---
const formSlide = document.getElementById('form-slide');
if (formSlide) {
    formSlide.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const title = document.getElementById('slide-title').value;
            const subtitle = document.getElementById('slide-subtitle').value;
            const file = document.getElementById('slide-img').files[0];

            const storageRef = ref(storage, `slides/${Date.now()}_${file.name}`);
            await uploadBytes(storageRef, file);
            const imgUrl = await getDownloadURL(storageRef);

            await addDoc(collection(db, "slides"), {
                title, subtitle, imgUrl, storagePath: storageRef.fullPath
            });

            alert("Slide adicionado!");
            location.reload();
        } catch (error) {
            alert("Erro ao adicionar slide!");
            console.error(error);
        }
    });
}

async function carregarSlides() {
    const list = document.getElementById('slides-list');
    if (!list) return;
    list.innerHTML = '';
    
    try {
        const querySnapshot = await getDocs(collection(db, "slides"));
        querySnapshot.forEach((docSnap) => {
            const item = docSnap.data();
            const div = document.createElement('div');
            div.className = 'admin-list-item';
            div.innerHTML = `
                <img src="${item.imgUrl}">
                <p><strong>${item.title}</strong></p>
                <button class="admin-btn admin-btn-delete" onclick="deletarItem('slides', '${docSnap.id}', '${item.storagePath}')">Excluir</button>
            `;
            list.appendChild(div);
        });
        initAdminCursorEvents();
    } catch (error) {
        console.error("Erro ao carregar slides:", error);
    }
}

// --- 4. GERENCIAR PORTFÓLIO ---
const formPortfolio = document.getElementById('form-portfolio');
if (formPortfolio) {
    formPortfolio.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const file = document.getElementById('portfolio-img').files[0];
            const storageRef = ref(storage, `portfolio/${Date.now()}_${file.name}`);
            
            await uploadBytes(storageRef, file);
            const imgUrl = await getDownloadURL(storageRef);

            await addDoc(collection(db, "portfolio"), {
                imgUrl, storagePath: storageRef.fullPath
            });

            alert("Foto adicionada ao Portfólio!");
            location.reload();
        } catch (error) {
            alert("Erro ao enviar foto para o portfólio!");
            console.error(error);
        }
    });
}

async function carregarPortfolio() {
    const list = document.getElementById('portfolio-list');
    if (!list) return;
    list.innerHTML = '';

    try {
        const querySnapshot = await getDocs(collection(db, "portfolio"));
        querySnapshot.forEach((docSnap) => {
            const item = docSnap.data();
            const div = document.createElement('div');
            div.className = 'admin-list-item';
            div.innerHTML = `
                <img src="${item.imgUrl}">
                <button class="admin-btn admin-btn-delete" onclick="deletarItem('portfolio', '${docSnap.id}', '${item.storagePath}')">Excluir</button>
            `;
            list.appendChild(div);
        });
        initAdminCursorEvents();
    } catch (error) {
        console.error("Erro ao carregar portfólio:", error);
    }
}

// FUNÇÃO GLOBAL PARA DELETAR REGISTROS
window.deletarItem = async (colecao, id, storagePath) => {
    if (confirm("Tem certeza que deseja apagar este item?")) {
        try {
            await deleteDoc(doc(db, colecao, id));
            if (storagePath) {
                const imgRef = ref(storage, storagePath);
                await deleteObject(imgRef);
            }
            alert("Removido com sucesso!");
            location.reload();
        } catch (error) {
            alert("Erro ao deletar o item.");
            console.error(error);
        }
    }
};

// --- 5. MOVIMENTO E INTERAÇÃO DO CURSOR NO PAINEL ADMIN ---
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

function initAdminCursorEvents() {
    const interactables = document.querySelectorAll('a, button, input, textarea, .admin-btn');
    interactables.forEach(item => {
        item.removeEventListener('mouseenter', applyHover);
        item.removeEventListener('mouseleave', removeHover);
        item.addEventListener('mouseenter', applyHover);
        item.addEventListener('mouseleave', removeHover);
    });
}

if (cursor && cursorDot) {
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

    initAdminCursorEvents();
}