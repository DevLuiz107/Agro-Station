/* ================================================
   AGRO STATION — script.js
   ================================================ */

gsap.registerPlugin(ScrollTrigger);

/* ══════════════════════════════════════════════════
   1. VARIÁVEIS DO DOM
   ══════════════════════════════════════════════════ */
const navbar    = document.getElementById("navbar");
const hamburger = document.getElementById("hamburger");
const navMobile = document.getElementById("menu-mobile");
const overlay   = document.getElementById("overlay");
const linksMenu = document.querySelectorAll(".menu-mobile-link");
const btnMobile = document.querySelector(".btn-mobile-cta");

/* ══════════════════════════════════════════════════
   2. NAVBAR — muda visual ao scrollar
   ══════════════════════════════════════════════════ */
window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 40);
});

/* ══════════════════════════════════════════════════
   3. MENU MOBILE — abertura e fechamento
   ══════════════════════════════════════════════════ */
let menuAberto = false;

function abrirMenu() {
    menuAberto = true;

    /* Acessibilidade */
    hamburger.setAttribute("aria-expanded", "true");
    navMobile.setAttribute("aria-hidden", "false");

    /* Ativa classe visual no botão (X) */
    hamburger.classList.add("ativo");

    /* Trava o scroll da página */
    document.body.classList.add("menu-open");

    /* Torna os elementos visíveis antes de animar */
    navMobile.style.display = "flex";
    overlay.style.display   = "block";

    /* Timeline de abertura */
    const tl = gsap.timeline();

    /* Painel entra */
    tl.to(navMobile, {
        opacity: 1,
        y: 0,
        duration: 0.40,
        ease: "power3.out"
    })

    /* Overlay aparece junto */
    .to(overlay, {
        opacity: 1,
        duration: 0.30,
        ease: "none"
    }, "<")

    /* Links entram em stagger */
    .to([...linksMenu, btnMobile], {
        opacity: 1,
        y: 0,
        duration: 0.30,
        stagger: 0.06,
        ease: "power2.out"
    }, "-=0.15");
}

function fecharMenu() {
    menuAberto = false;

    /* Acessibilidade */
    hamburger.setAttribute("aria-expanded", "false");
    navMobile.setAttribute("aria-hidden", "true");

    hamburger.classList.remove("ativo");
    document.body.classList.remove("menu-open");

    const tl = gsap.timeline({
        onComplete: () => {
            navMobile.style.display = "none";
            overlay.style.display   = "none";

            /* Reseta estado dos itens para a próxima abertura */
            gsap.set([...linksMenu, btnMobile], { opacity: 0, y: 16 });
            gsap.set(navMobile, { opacity: 0, y: -20 });
        }
    });

    /* Links saem rapidamente */
    tl.to([...linksMenu, btnMobile], {
        opacity: 0,
        y: -10,
        duration: 0.20,
        stagger: 0.04,
        ease: "power2.in"
    })

    /* Painel e overlay fecham */
    .to([navMobile, overlay], {
        opacity: 0,
        duration: 0.25,
        ease: "power2.in"
    }, "-=0.05");
}

/* Hambúrguer toggle */
hamburger.addEventListener("click", () => {
    menuAberto ? fecharMenu() : abrirMenu();
});

/* Fecha ao clicar no overlay */
overlay.addEventListener("click", fecharMenu);

/* Fecha ao clicar em qualquer link do menu mobile */
linksMenu.forEach(link => {
    link.addEventListener("click", fecharMenu);
});

/* Fecha com a tecla Escape */
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menuAberto) fecharMenu();
});

/* ══════════════════════════════════════════════════
   4. ANIMAÇÃO DE ENTRADA DA HERO (page load)
   ══════════════════════════════════════════════════ */

/* Estado inicial — GSAP anima a partir daqui */
gsap.set(".hero-section", { y: 30, opacity: 0 });
gsap.set(".hero-image",   { x: 40, opacity: 0 });

const tlHero = gsap.timeline({ defaults: { ease: "power3.out" }, delay: 0.2 });

tlHero
    .to(".hero-section", { opacity: 1, y: 0, duration: 0.9 })
    .to(".hero-image",   { opacity: 1, x: 0, duration: 0.9 }, "-=0.5");