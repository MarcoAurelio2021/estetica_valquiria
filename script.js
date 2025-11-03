// ================== HERO IMAGE CAROUSEL ==================
const images = document.querySelectorAll(".hero-image img");
const dots = document.querySelectorAll(".dot");
const prevBtn = document.querySelector(".prev");
const nextBtn = document.querySelector(".next");

let currentIndex = 0;
let interval = setInterval(showNextImage, 4000);

function showImage(index) {
  images.forEach((img, i) => {
    img.classList.toggle("active", i === index);
    dots[i].classList.toggle("active", i === index);
  });
  currentIndex = index;
}

function showNextImage() {
  let nextIndex = (currentIndex + 1) % images.length;
  showImage(nextIndex);
}

function showPrevImage() {
  let prevIndex = (currentIndex - 1 + images.length) % images.length;
  showImage(prevIndex);
}

nextBtn.addEventListener("click", () => {
  showNextImage();
  resetInterval();
});

prevBtn.addEventListener("click", () => {
  showPrevImage();
  resetInterval();
});

dots.forEach((dot, i) => {
  dot.addEventListener("click", () => {
    showImage(i);
    resetInterval();
  });
});

function resetInterval() {
  clearInterval(interval);
  interval = setInterval(showNextImage, 4000);
}

// ================== DEPOIMENTOS COM FIREBASE ==================
import {
  auth,
  db,
  googleProvider,
  serverTimestamp
} from "./firebaseConfig.js";

import {
  onAuthStateChanged,
  signInWithPopup,
  signOut
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
  query
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// Elementos
const btnLoginGoogle = document.getElementById("btn-login-google");
const btnLoginApple = document.getElementById("btn-login-apple");
const btnLogout = document.getElementById("btn-logout");
const userInfo = document.getElementById("user-info");
const depoimentoArea = document.getElementById("depoimento-area");
const depoimentoText = document.getElementById("depoimento-text");
const btnEnviar = document.getElementById("btn-enviar");
const stars = document.querySelectorAll(".star");
const carousel = document.getElementById("depoimentos-carousel");

let selectedRating = 0;
let currentUser = null;

// ================== ESTRELAS ==================
stars.forEach(star => {
  star.addEventListener("click", () => {
    selectedRating = parseInt(star.dataset.value);
    atualizarEstrelas();
  });

  star.addEventListener("mouseenter", () => {
    const hoverValue = parseInt(star.dataset.value);
    stars.forEach(s => {
      const val = parseInt(s.dataset.value);
      s.classList.toggle("fa-solid", val <= hoverValue);
      s.classList.toggle("hovered", val <= hoverValue);
      s.classList.toggle("fa-regular", val > hoverValue);
    });
  });

  star.addEventListener("mouseleave", atualizarEstrelas);
});

function atualizarEstrelas() {
  stars.forEach(s => {
    const val = parseInt(s.dataset.value);
    s.classList.toggle("fa-solid", val <= selectedRating);
    s.classList.toggle("selected", val <= selectedRating);
    s.classList.toggle("fa-regular", val > selectedRating);
    s.classList.remove("hovered");
  });
}

// ================== LOGIN ==================
btnLoginGoogle.addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    alert("Erro ao entrar. Verifique o domínio autorizado no Firebase.");
  }
});

btnLoginApple.addEventListener("click", () => {
  alert("Login com Apple em breve!");
});

btnLogout.addEventListener("click", async () => {
  await signOut(auth);
});

// ================== MONITOR LOGIN ==================
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    userInfo.innerHTML = `
      <img src="${user.photoURL}" alt="${user.displayName}" class="user-photo">
      <strong>${user.displayName}</strong>
    `;
    btnLoginGoogle.style.display = "none";
    btnLoginApple.style.display = "none";
    btnLogout.style.display = "inline-block";
    depoimentoArea.style.display = "block";
  } else {
    currentUser = null;
    userInfo.textContent = "Faça login para deixar um depoimento.";
    btnLoginGoogle.style.display = "inline-block";
    btnLoginApple.style.display = "inline-block";
    btnLogout.style.display = "none";
    depoimentoArea.style.display = "none";
  }

  carregarDepoimentos();
});

// ================== ENVIAR DEPOIMENTO ==================
btnEnviar.addEventListener("click", async () => {
  const texto = depoimentoText.value.trim();

  if (!currentUser) {
    alert("Você precisa fazer login para enviar um depoimento.");
    return;
  }

  if (!texto) {
    alert("Por favor, escreva seu depoimento.");
    return;
  }

  if (selectedRating === 0) {
    alert("Selecione uma avaliação com estrelas.");
    return;
  }

  try {
    await addDoc(collection(db, "depoimentos"), {
      uid: currentUser.uid,
      nome: currentUser.displayName,
      foto: currentUser.photoURL,
      texto,
      estrelas: selectedRating,
      criadoEm: serverTimestamp()
    });

    depoimentoText.value = "";
    selectedRating = 0;
    stars.forEach(s => s.classList.remove("fa-solid", "selected"));
    stars.forEach(s => s.classList.add("fa-regular"));
    alert("Depoimento enviado com sucesso!");

    carregarDepoimentos();
  } catch (error) {
    console.error("Erro ao enviar depoimento:", error);
  }
});

// ================== FUNÇÃO AUXILIAR ==================
function renderizarEstrelas(qtd) {
  let html = "";
  for (let i = 1; i <= 5; i++) {
    if (i <= qtd) {
      html += `<i class="fa-solid fa-star" style="color:#ffb400;"></i>`;
    } else {
      html += `<i class="fa-regular fa-star" style="color:#ccc;"></i>`;
    }
  }
  return html;
}

// ================== CARREGAR DEPOIMENTOS ==================
async function carregarDepoimentos() {
  carousel.innerHTML = "<p>Carregando depoimentos...</p>";

  try {
    const q = query(collection(db, "depoimentos"), orderBy("criadoEm", "desc"));
    const querySnapshot = await getDocs(q);
    carousel.innerHTML = "";

    if (querySnapshot.empty) {
      carousel.innerHTML = "<p>Nenhum depoimento ainda. Seja o primeiro!</p>";
      return;
    }

    querySnapshot.forEach((docSnap) => {
      const d = docSnap.data();
      const isOwner = currentUser && currentUser.uid === d.uid;

      const card = document.createElement("div");
      card.classList.add("depoimento-card");

      const estrelasHTML = renderizarEstrelas(d.estrelas || 0);

      card.innerHTML = `
        <div class="depoimento-top">
          <img src="${d.foto}" alt="${d.nome}" class="user-photo">
          <div>
            <strong>${d.nome}</strong><br>
            <div class="stars">${estrelasHTML}</div>
          </div>
        </div>
        <p class="texto">"${d.texto}"</p>
        ${isOwner ? `<button class="btn-excluir" data-id="${docSnap.id}">Excluir</button>` : ""}
      `;

      carousel.appendChild(card);
    });

    // Botão de exclusão
    document.querySelectorAll(".btn-excluir").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        if (confirm("Deseja excluir seu depoimento?")) {
          try {
            await deleteDoc(doc(db, "depoimentos", id));
            carregarDepoimentos();
          } catch (error) {
            console.error("Erro ao excluir:", error);
            alert("Erro ao excluir: " + error.message);
          }
        }
      });
    });

  } catch (error) {
    console.error("Erro ao carregar depoimentos:", error);
    carousel.innerHTML = "<p>Erro ao carregar depoimentos.</p>";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("videoModal");
  const closeBtn = document.querySelector(".close");
  const video = document.getElementById("welcomeVideo");

  // Exibe o modal automaticamente
  modal.style.display = "flex";

  // Tenta iniciar o vídeo (autoplay pode exigir 'muted')
  video.play().catch(err => {
    console.warn("Autoplay bloqueado:", err);
  });

  // Fecha ao clicar no "x"
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
    video.pause();
    video.currentTime = 0;
  });

  // Fecha ao clicar fora do vídeo
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
      video.pause();
      video.currentTime = 0;
    }
  });
});


