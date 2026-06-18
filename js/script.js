/* =============================================

   AGRO STATION — Loja Virtual

   - Header scroll

   - Mobile menu

   - Cart (add/remove/qty)

   - Product filter

   - Wishlist

   - Toast

   - Newsletter

   ============================================= */


(function () {

    'use strict';


    // ─── Elementos globais ───

    const $  = (sel, ctx = document) => ctx.querySelector(sel);

    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));


    const header        = $('#header');

    const menuToggle    = $('#menuToggle');

    const mobileMenu    = $('#mobileMenu');

    const cartToggle    = $('#cartToggle');

    const cartSidebar   = $('#cartSidebar');

    const cartOverlay   = $('#cartOverlay');

    const cartClose     = $('#cartClose');

    const cartContinue  = $('#cartContinue');

    const cartBody      = $('#cartBody');

    const cartEmpty     = $('#cartEmpty');

    const cartFoot      = $('#cartFoot');

    const cartCount     = $('#cartCount');

    const cartSidebarCount = $('#cartSidebarCount');

    const cartSubtotal  = $('#cartSubtotal');

    const cartShipping  = $('#cartShipping');

    const cartTotal     = $('#cartTotal');

    const checkoutBtn   = $('#checkoutBtn');

    const productsGrid  = $('#productsGrid');

    const toast         = $('#toast');

    const newsletterForm = $('#newsletterForm');


    // ─── Estado do carrinho (persiste no localStorage) ───

    const STORAGE_KEY = 'agrostation_cart';

    let cart = loadCart();


    // ════════════════════════════════════════

    //  HEADER — adiciona classe no scroll

    // ════════════════════════════════════════

    const handleScroll = () => {

        if (window.scrollY > 20) header.classList.add('scrolled');

        else header.classList.remove('scrolled');

    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    handleScroll();


    // ════════════════════════════════════════

    //  MOBILE MENU

    // ════════════════════════════════════════

    menuToggle.addEventListener('click', () => {

        const isOpen = mobileMenu.classList.toggle('open');

        menuToggle.classList.toggle('open', isOpen);

        menuToggle.setAttribute('aria-expanded', String(isOpen));

        mobileMenu.setAttribute('aria-hidden', String(!isOpen));

    });


    $$('.mobile-link, .btn-mobile-cta').forEach(link => {

        link.addEventListener('click', () => closeMobileMenu());

    });


    document.addEventListener('click', (e) => {

        if (

            mobileMenu.classList.contains('open') &&

            !mobileMenu.contains(e.target) &&

            !menuToggle.contains(e.target)

        ) closeMobileMenu();

    });


    function closeMobileMenu() {

        mobileMenu.classList.remove('open');

        menuToggle.classList.remove('open');

        menuToggle.setAttribute('aria-expanded', 'false');

        mobileMenu.setAttribute('aria-hidden', 'true');

    }


    // ════════════════════════════════════════

    //  CARRINHO

    // ════════════════════════════════════════

    function loadCart() {

        try {

            const stored = localStorage.getItem(STORAGE_KEY);

            return stored ? JSON.parse(stored) : [];

        } catch (e) {

            return [];

        }

    }


    function saveCart() {

        try {

            localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));

        } catch (e) { /* silencioso */ }

    }


    function formatBRL(value) {

        return 'R$ ' + Number(value).toLocaleString('pt-BR', {

            minimumFractionDigits: 2,

            maximumFractionDigits: 2

        });

    }


    function addToCart(product) {

        const existing = cart.find(item => item.name === product.name);

        if (existing) {

            existing.qty += 1;

        } else {

            cart.push({ ...product, qty: 1 });

        }

        saveCart();

        renderCart();

        bumpCart();

        showToast(`"${product.name}" adicionado ao carrinho`);

    }


    function removeFromCart(name) {

        cart = cart.filter(item => item.name !== name);

        saveCart();

        renderCart();

    }


    function updateQty(name, delta) {

        const item = cart.find(i => i.name === name);

        if (!item) return;

        item.qty += delta;

        if (item.qty <= 0) {

            removeFromCart(name);

            return;

        }

        saveCart();

        renderCart();

    }


    function getTotalItems() {

        return cart.reduce((sum, item) => sum + item.qty, 0);

    }


    function getSubtotal() {

        return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    }


    function renderCart() {

        const totalItems = getTotalItems();

        const subtotal   = getSubtotal();


        // Badge contador

        cartCount.textContent = totalItems;

        cartSidebarCount.textContent = totalItems;

        cartCount.classList.toggle('show', totalItems > 0);


        // Sidebar body

        if (cart.length === 0) {

            cartBody.innerHTML = '';

            cartBody.appendChild(cartEmpty);

            cartEmpty.style.display = 'flex';

            cartFoot.hidden = true;

        } else {

            cartEmpty.style.display = 'none';

            cartBody.innerHTML = cart.map(item => `

                <div class="cart-item">

                    <div class="cart-item__media">${miniSVG(item.img)}</div>

                    <div class="cart-item__info">

                        <p class="cart-item__name">${escapeHTML(item.name)}</p>

                        <p class="cart-item__price">${formatBRL(item.price * item.qty)}</p>

                        <div class="cart-item__qty">

                            <button data-qty="-" data-name="${escapeHTML(item.name)}" aria-label="Diminuir quantidade">−</button>

                            <span>${item.qty}</span>

                            <button data-qty="+" data-name="${escapeHTML(item.name)}" aria-label="Aumentar quantidade">+</button>

                        </div>

                    </div>

                    <button class="cart-item__remove" data-remove="${escapeHTML(item.name)}" aria-label="Remover">

                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">

                            <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>

                        </svg>

                    </button>

                </div>

            `).join('');

            cartFoot.hidden = false;


            // Subtotal / frete / total

            const shipping = subtotal >= 250 ? 0 : 29.9;

            cartSubtotal.textContent = formatBRL(subtotal);

            cartShipping.innerHTML = shipping === 0

                ? '<span style="color: var(--green-400); font-weight: 600;">Grátis</span>'

                : formatBRL(shipping);

            cartTotal.textContent = formatBRL(subtotal + shipping);

        }

    }


    function bumpCart() {

        cartCount.classList.remove('bump');

        // forçar reflow

        void cartCount.offsetWidth;

        cartCount.classList.add('bump');

    }


    // ─── Mini SVG por tipo de produto (carrinho) ───

    function miniSVG(type) {

        const map = {

            drone: `<svg viewBox="0 0 200 160" fill="none"><rect x="70" y="50" width="60" height="40" rx="8" fill="#4ade80"/><ellipse cx="40" cy="35" rx="20" ry="4" fill="#4ade80" opacity=".7"/><ellipse cx="160" cy="35" rx="20" ry="4" fill="#4ade80" opacity=".7"/><ellipse cx="40" cy="95" rx="20" ry="4" fill="#4ade80" opacity=".7"/><ellipse cx="160" cy="95" rx="20" ry="4" fill="#4ade80" opacity=".7"/></svg>`,

            drone2: `<svg viewBox="0 0 200 160" fill="none"><rect x="70" y="50" width="60" height="40" rx="8" fill="#4ade80"/><ellipse cx="40" cy="35" rx="20" ry="4" fill="#4ade80" opacity=".7"/><ellipse cx="160" cy="35" rx="20" ry="4" fill="#4ade80" opacity=".7"/><ellipse cx="40" cy="95" rx="20" ry="4" fill="#4ade80" opacity=".7"/><ellipse cx="160" cy="95" rx="20" ry="4" fill="#4ade80" opacity=".7"/></svg>`,

            seed: `<svg viewBox="0 0 200 160" fill="none"><path d="M60 30h80l-8 100H68L60 30z" fill="#4ade80"/><rect x="75" y="50" width="50" height="30" rx="3" fill="#f0fdf4" opacity=".9"/></svg>`,

            fert: `<svg viewBox="0 0 200 160" fill="none"><path d="M55 35h90l-10 95H65L55 35z" fill="#fbbf24"/><ellipse cx="100" cy="35" rx="45" ry="8" fill="#fde68a"/></svg>`,

            sensor: `<svg viewBox="0 0 200 160" fill="none"><rect x="75" y="25" width="50" height="80" rx="6" fill="#38bdf8"/><path d="M100 105v40" stroke="#4ade80" stroke-width="3" stroke-linecap="round"/></svg>`,

            irrigation: `<svg viewBox="0 0 200 160" fill="none"><path d="M50 50h100v15H50z" fill="#38bdf8"/><path d="M65 65v70M100 65v70M135 65v70" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/></svg>`,

            sprayer: `<svg viewBox="0 0 200 160" fill="none"><path d="M70 30c-5 0-10 5-10 10v70c0 5 5 10 10 10h60c5 0 10-5 10-10V40c0-5-5-10-10-10H70z" fill="#fbbf24"/></svg>`,

            corn: `<svg viewBox="0 0 200 160" fill="none"><ellipse cx="100" cy="80" rx="35" ry="60" fill="#fde047"/></svg>`,

            gps: `<svg viewBox="0 0 200 160" fill="none"><rect x="65" y="55" width="70" height="60" rx="8" fill="#38bdf8"/><path d="M100 55V35" stroke="#4ade80" stroke-width="3" stroke-linecap="round"/><circle cx="100" cy="30" r="6" fill="#4ade80"/></svg>`

        };

        return map[type] || map.drone;

    }


    function escapeHTML(str) {

        return String(str)

            .replace(/&/g, '&amp;')

            .replace(/</g, '&lt;')

            .replace(/>/g, '&gt;')

            .replace(/"/g, '&quot;')

            .replace(/'/g, '&#39;');

    }


    // ─── Abrir / fechar carrinho ───

    function openCart()  { cartSidebar.classList.add('open'); cartOverlay.classList.add('open'); document.body.classList.add('cart-open'); }

    function closeCart() { cartSidebar.classList.remove('open'); cartOverlay.classList.remove('open'); document.body.classList.remove('cart-open'); }


    cartToggle.addEventListener('click', openCart);

    cartClose.addEventListener('click', closeCart);

    cartOverlay.addEventListener('click', closeCart);

    cartContinue.addEventListener('click', closeCart);


    document.addEventListener('keydown', (e) => {

        if (e.key === 'Escape' && cartSidebar.classList.contains('open')) closeCart();

    });


    // ─── Adicionar ao carrinho (delegation) ───

    document.addEventListener('click', (e) => {

        const addBtn = e.target.closest('[data-add-cart]');

        if (addBtn) {

            e.preventDefault();

            const product = {

                name:  addBtn.dataset.name,

                price: parseFloat(addBtn.dataset.price),

                img:   addBtn.dataset.img || 'drone'

            };

            addToCart(product);


            // feedback visual no botão

            const original = addBtn.innerHTML;

            addBtn.classList.add('added');

            addBtn.innerHTML = `

                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">

                    <path d="M5 12l5 5L20 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>

                </svg>

                Adicionado!

            `;

            setTimeout(() => {

                addBtn.classList.remove('added');

                addBtn.innerHTML = original;

            }, 1500);

            return;

        }


        // Remover item

        const removeBtn = e.target.closest('[data-remove]');

        if (removeBtn) {

            removeFromCart(removeBtn.dataset.remove);

            return;

        }


        // Alterar quantidade

        const qtyBtn = e.target.closest('[data-qty]');

        if (qtyBtn) {

            const delta = qtyBtn.dataset.qty === '+' ? 1 : -1;

            updateQty(qtyBtn.dataset.name, delta);

            return;

        }

    });


    // ─── Finalizar compra ───

    checkoutBtn.addEventListener('click', () => {

        if (cart.length === 0) return;

        const total = getSubtotal() + (getSubtotal() >= 250 ? 0 : 29.9);

        showToast(`Pedido de ${formatBRL(total)} finalizado! Em breve entraremos em contato.`);

        cart = [];

        saveCart();

        renderCart();

        setTimeout(closeCart, 800);

    });


    // ════════════════════════════════════════

    //  FILTRO DE PRODUTOS

    // ════════════════════════════════════════

    $$('.filter-tab').forEach(tab => {

        tab.addEventListener('click', () => {

            $$('.filter-tab').forEach(t => t.classList.remove('active'));

            tab.classList.add('active');

            const filter = tab.dataset.filter;

            $$('.product-card').forEach(card => {

                const match = filter === 'all' || card.dataset.cat === filter;

                card.classList.toggle('hide', !match);

            });

        });

    });


    // Filtro via cards de categoria

    $$('.cat-card').forEach(card => {

        card.addEventListener('click', (e) => {

            e.preventDefault();

            const filter = card.dataset.filter;

            const tab = $(`.filter-tab[data-filter="${filter}"]`);

            if (tab) tab.click();

            const target = $('#produtos');

            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });

        });

    });


    // ════════════════════════════════════════

    //  WISHLIST (favoritos)

    // ════════════════════════════════════════

    $$('.product-card__wish').forEach(btn => {

        btn.addEventListener('click', (e) => {

            e.preventDefault();

            e.stopPropagation();

            btn.classList.toggle('active');

            showToast(btn.classList.contains('active') ? 'Adicionado aos favoritos' : 'Removido dos favoritos');

        });

    });


    // ════════════════════════════════════════

    //  NEWSLETTER

    // ════════════════════════════════════════

    if (newsletterForm) {

        newsletterForm.addEventListener('submit', (e) => {

            e.preventDefault();

            const input = newsletterForm.querySelector('input[type="email"]');

            if (input && input.value) {

                showToast(`E-mail "${input.value}" cadastrado com sucesso!`);

                input.value = '';

            }

        });

    }


    // ════════════════════════════════════════

    //  TOAST

    // ════════════════════════════════════════

    let toastTimer = null;

    function showToast(message) {

        toast.innerHTML = `

            <span class="toast__icon">

                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">

                    <path d="M5 12l5 5L20 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>

                </svg>

            </span>

            <span>${escapeHTML(message)}</span>

        `;

        toast.classList.add('show');

        clearTimeout(toastTimer);

        toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);

    }


    // ════════════════════════════════════════

    //  PAUSAR TICKER NO HOVER

    // ════════════════════════════════════════

    const ticker = document.querySelector('.data-ticker__track');

    if (ticker) {

        const tickerWrap = ticker.closest('.data-ticker');

        tickerWrap.addEventListener('mouseenter', () => ticker.style.animationPlayState = 'paused');

        tickerWrap.addEventListener('mouseleave', () => ticker.style.animationPlayState = 'running');

    }


    // ════════════════════════════════════════

    //  INIT — render inicial do carrinho

    // ════════════════════════════════════════

    renderCart();


})();

