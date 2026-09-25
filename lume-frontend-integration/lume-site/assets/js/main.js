/* ==========================================================================
   LUMÉ — Shared site behavior
   Cart & wishlist persist via localStorage so state carries across pages.
   ========================================================================== */

const LUME_CART_KEY = "lume_cart";
const LUME_WISH_KEY = "lume_wishlist";

/* ---------- Storage helpers ---------- */
function readStore(key) {
  try { return JSON.parse(localStorage.getItem(key)) || []; }
  catch (e) { return []; }
}
function writeStore(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); }
  catch (e) { /* storage unavailable — fail silently, UI still works in-memory this session */ }
}

function getLocalCart() { return readStore(LUME_CART_KEY); }
function getLocalWishlist() { return readStore(LUME_WISH_KEY); }

function usesRemoteData() {
  return Boolean(window.LumeAPI?.isLoggedIn?.());
}

async function addToCart(id, qty = 1) {
  if (usesRemoteData() && window.LumeAPI.addCartItem) {
    const cart = await window.LumeAPI.addCartItem(String(id), qty);
    updateBadges(cart);
    return cart;
  }
  const cart = getLocalCart();
  const existing = cart.find(item => String(item.id) === String(id));
  if (existing) { existing.qty += qty; }
  else { cart.push({ id: String(id), qty }); }
  writeStore(LUME_CART_KEY, cart);
  updateBadges();
  return cart;
}
async function setCartQty(id, qty) {
  if (usesRemoteData() && window.LumeAPI.updateCartItem) {
    const cart = await window.LumeAPI.updateCartItem(String(id), qty);
    updateBadges(cart);
    return cart;
  }
  let cart = getLocalCart();
  if (qty <= 0) { cart = cart.filter(i => String(i.id) !== String(id)); }
  else {
    const item = cart.find(i => String(i.id) === String(id));
    if (item) item.qty = qty;
  }
  writeStore(LUME_CART_KEY, cart);
  updateBadges();
  return cart;
}
async function removeFromCart(id) {
  if (usesRemoteData() && window.LumeAPI.removeCartItem) {
    const cart = await window.LumeAPI.removeCartItem(String(id));
    updateBadges(cart);
    return cart;
  }
  const cart = getLocalCart().filter(i => String(i.id) !== String(id));
  writeStore(LUME_CART_KEY, cart);
  updateBadges();
  return cart;
}
function cartCount() { return getLocalCart().reduce((sum, i) => sum + i.qty, 0); }

function isWishlisted(id) { return getLocalWishlist().some(item => String(item) === String(id)); }
async function toggleWishlistId(id) {
  if (usesRemoteData() && window.LumeAPI.toggleWishlistItem) {
    const result = await window.LumeAPI.toggleWishlistItem(String(id));
    updateBadges();
    return result.active;
  }
  let wish = getLocalWishlist();
  id = String(id);
  if (wish.some(item => String(item) === id)) { wish = wish.filter(w => String(w) !== id); }
  else { wish.push(id); }
  writeStore(LUME_WISH_KEY, wish);
  updateBadges();
  return wish.includes(id);
}

async function updateBadges(remoteCart) {
  const cartBadge = document.getElementById('cartCount');
  const wishBadge = document.getElementById('wishCount');
  let cart = remoteCart;
  let wishlist = null;
  if (usesRemoteData() && window.LumeAPI.getWishlist) {
    try {
      if (!cart && window.LumeAPI.getCart) cart = await window.LumeAPI.getCart();
      wishlist = await window.LumeAPI.getWishlist();
      writeStore(LUME_WISH_KEY, wishlist);
      document.querySelectorAll('.wish-btn').forEach(btn => {
        const id = btn.closest('[data-id]')?.dataset.id || btn.dataset.productId;
        if (id != null) {
          const active = isWishlisted(id);
          btn.classList.toggle('active', active);
          btn.querySelector('i')?.classList.toggle('bi-heart-fill', active);
          btn.querySelector('i')?.classList.toggle('bi-heart', !active);
        }
      });
      document.dispatchEvent(new CustomEvent('lume:wishlistReady'));
    } catch (error) { console.error('[LUMÉ] Badge loading failed:', error); }
  }
  if (cartBadge) cartBadge.textContent = cart ? cart.reduce((sum, item) => sum + item.qty, 0) : cartCount();
  if (wishBadge) wishBadge.textContent = wishlist ? wishlist.length : getLocalWishlist().length;
}

/* ---------- Toast ---------- */
function showToast(message, icon = 'bi-check2-circle') {
  let toast = document.getElementById('lumeToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'lumeToast';
    toast.className = 'toast-glass glass-strong';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<i class="bi ${icon}"></i><span>${message}</span>`;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2400);
}

/* ---------- Render helpers (shared across pages) ---------- */
function starHTML(rating) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) html += '<i class="bi bi-star-fill"></i>';
    else if (rating >= i - 0.5) html += '<i class="bi bi-star-half"></i>';
    else html += '<i class="bi bi-star muted-star"></i>';
  }
  return html;
}
function tagHTML(p) {
  if (!p.stock) return '<span class="product-tag tag-out">Out of Stock</span>';
  if (p.tag === 'sale') return '<span class="product-tag tag-sale">Sale</span>';
  if (p.tag === 'new') return '<span class="product-tag tag-new">New</span>';
  return '';
}

function productCard(p, extraClass = '') {
  const off = p.old ? Math.round(100 - (p.price / p.old * 100)) : null;
  const wished = isWishlisted(p.id) ? 'active' : '';
  const disabled = p.stock ? '' : 'disabled';
  return `
  <div class="product-card glass ${extraClass}" data-cat="${p.cat}" data-id="${p.id}">
    <div class="product-img-wrap">
      ${tagHTML(p)}
      <button class="wish-btn ${wished}" aria-label="Toggle wishlist" onclick="handleWishClick(event, '${p.id}')"><i class="bi bi-heart"></i></button>
      <a href="product-details.html?id=${p.id}">
        <img src="${p.img?.startsWith('http') ? p.img : `https://picsum.photos/seed/${p.img}/500/620`}" alt="${p.name}, ${catLabel(p.cat)}" loading="lazy">
      </a>
      <div class="quick-add">
        <button class="add-cart-btn" ${disabled} onclick="handleAddClick(event, '${p.id}', this)">
          <i class="bi bi-bag-plus"></i> ${p.stock ? 'Add to Cart' : 'Sold Out'}
        </button>
      </div>
    </div>
    <div class="product-body">
      <span class="product-cat">${catLabel(p.cat)}</span>
      <a class="product-name-link" href="product-details.html?id=${p.id}"><h3 class="product-name">${p.name}</h3></a>
      <div class="d-flex align-items-center gap-2">
        <span class="stars">${starHTML(p.rating)}</span>
        <span class="rating-count">(${p.reviews})</span>
      </div>
      <div class="price-row">
        <span class="price-now">$${p.price.toFixed(2)}</span>
        ${p.old ? `<span class="price-old">$${p.old.toFixed(2)}</span><span class="price-off">-${off}%</span>` : ''}
      </div>
    </div>
  </div>`;
}

function catCard(c) {
  const image =
    c.image ||
    c.img ||
    "https://picsum.photos/seed/lume-category/300/300";

  return `
    <div class="col-6 col-md-4 col-lg-2">
      <a
        href="shop.html?cat=${encodeURIComponent(c.slug)}"
        class="cat-card glass reveal"
      >
        <div class="cat-img-wrap">
          <img
            src="${image}"
            alt="${c.name} category"
            loading="lazy"
          >
        </div>

        <div class="cat-name">
          ${c.name}
        </div>

        <div class="cat-count">
          ${c.count}
        </div>
      </a>
    </div>
  `;
}

async function handleWishClick(e, id) {
  e.preventDefault(); e.stopPropagation();
  const active = await toggleWishlistId(id);
  const btn = e.currentTarget;
  btn.classList.toggle('active', active);
  btn.querySelector('i')?.classList.toggle('bi-heart-fill', active);
  btn.querySelector('i')?.classList.toggle('bi-heart', !active);
  showToast(active ? 'Added to wishlist' : 'Removed from wishlist', active ? 'bi-heart-fill' : 'bi-heart');
  if (typeof onWishlistChanged === 'function') onWishlistChanged();
}

async function handleAddClick(e, id, btn) {
  e.preventDefault(); e.stopPropagation();
  try { await addToCart(id, 1); } catch (error) { showToast(error.message || 'Unable to add item', 'bi-exclamation-circle'); return; }
  const original = btn.innerHTML;
  btn.classList.add('added');
  btn.innerHTML = '<i class="bi bi-check2"></i> Added';
  setTimeout(() => { btn.classList.remove('added'); btn.innerHTML = original; }, 1400);
  const cartIcon = document.getElementById('navCart');
  if (cartIcon) cartIcon.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.18)' }, { transform: 'scale(1)' }], { duration: 350, easing: 'ease-out' });
  showToast('Added to cart');
  if (typeof onCartChanged === 'function') onCartChanged();
}

/* ---------- Shared chrome behavior (navbar, announcement bar, reveal, back-to-top) ---------- */
function initLumeChrome() {
  updateBadges();

  /* Announcement bar rotation */
  const items = document.querySelectorAll('.announce-item');
  let idx = 0;
  if (items.length > 1) {
    setInterval(() => {
      items[idx].classList.remove('active');
      idx = (idx + 1) % items.length;
      items[idx].classList.add('active');
    }, 4000);
  }
  const closeBtn = document.querySelector('.announce-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      document.getElementById('announceBar').style.display = 'none';
    });
  }

  /* Navbar scroll state + back to top */
  const nav = document.getElementById('mainNav');
  const toTop = document.getElementById('toTop');
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (nav) nav.classList.toggle('scrolled', y > 40);
    if (toTop) toTop.classList.toggle('show', y > 500);
  });
  if (toTop) {
    toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* Search toggle */
  const searchBtn = document.getElementById('searchToggleBtn');
  const searchBox = document.getElementById('navSearch');
  if (searchBtn && searchBox) {
    searchBtn.addEventListener('click', () => searchBox.classList.toggle('open'));
  }
  const searchInputs = document.querySelectorAll('.nav-search-input');
  searchInputs.forEach(inp => {
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && inp.value.trim()) {
        window.location.href = `shop.html?q=${encodeURIComponent(inp.value.trim())}`;
      }
    });
  });

  /* Reveal on scroll */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* Highlight active nav link */
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a[data-nav]').forEach(a => {
    if (a.dataset.nav === path) a.classList.add('active');
  });

  /* Newsletter forms (any page) */
  document.querySelectorAll('.js-newsletter-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const note = form.querySelector('.newsletter-note');
      if (note) { note.textContent = "You're on the list — welcome to LUMÉ."; note.style.color = 'var(--accent-soft)'; }
      form.reset();
    });
  });

  /* Contact form (contact page) */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fields = contactForm.querySelectorAll('input, select, textarea');
      const button = contactForm.querySelector('button[type="submit"]');
      const originalText = button?.innerHTML;
      try {
        if (!window.LumeAPI?.sendContactMessage) throw new Error('Contact service is unavailable.');
        if (button) { button.disabled = true; button.innerHTML = '<i class="bi bi-hourglass-split"></i> Sending...'; }
        await window.LumeAPI.sendContactMessage({
          name: fields[0]?.value.trim(),
          email: fields[1]?.value.trim(),
          subject: fields[2]?.value.trim(),
          message: fields[3]?.value.trim(),
        });
        showToast('Message sent — we\'ll reply within 24 hours');
        contactForm.reset();
      } catch (error) {
        showToast(error.message || 'Unable to send your message', 'bi-exclamation-circle');
      } finally {
        if (button) { button.disabled = false; button.innerHTML = originalText; }
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', initLumeChrome);

document.addEventListener('DOMContentLoaded', async () => {
  if (!window.LumeAPI?.getProducts) return;
  try {
    const products = await window.LumeAPI.getProducts({ limit: 100 });
    applyRemoteProducts(products);
    if (window.location.pathname.endsWith('product-details.html') && !sessionStorage.getItem('lume_product_data_loaded')) {
      sessionStorage.setItem('lume_product_data_loaded', '1');
      window.location.reload();
      return;
    }
    sessionStorage.removeItem('lume_product_data_loaded');
    if (typeof onProductsLoaded === 'function') onProductsLoaded();
    document.querySelectorAll('.reveal:not(.in)').forEach(el => el.classList.add('in'));
  } catch (error) {
    console.error('[LUMÉ] Product loading failed:', error);
  }
});

/* ==========================================================================
   LUMÉ — Chatbot Widget
   ========================================================================== */
function initChatbot() {
  const chatbotToggleBtn = document.getElementById('chatbotToggleBtn');
  const chatbotCloseBtn = document.getElementById('chatbotCloseBtn');
  const chatbotWidget = document.getElementById('chatbotWidget');
  const chatbotSendBtn = document.getElementById('chatbotSendBtn');
  const chatbotInput = document.getElementById('chatbotInput');
  const chatbotMessages = document.getElementById('chatbotMessages');

  if (!chatbotToggleBtn || !chatbotWidget) return;

  /* Toggle chatbot open/close */
  chatbotToggleBtn.addEventListener('click', () => {
    chatbotWidget.classList.toggle('active');
    if (chatbotWidget.classList.contains('active')) {
      chatbotInput.focus();
    }
  });

  if (chatbotCloseBtn) {
    chatbotCloseBtn.addEventListener('click', () => {
      chatbotWidget.classList.remove('active');
    });
  }

  /* Send message */
  function sendMessage() {
    const message = chatbotInput.value.trim();
    if (!message) return;

    /* Add user message */
    const userMsgDiv = document.createElement('div');
    userMsgDiv.className = 'chatbot-msg user-msg';
    userMsgDiv.innerHTML = `<p>${escapeHtml(message)}</p>`;
    chatbotMessages.appendChild(userMsgDiv);
    chatbotInput.value = '';

    /* Auto-scroll to bottom */
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

    /* Simulate bot response */
    setTimeout(() => {
      const botResponse = getBotResponse(message.toLowerCase());
      const botMsgDiv = document.createElement('div');
      botMsgDiv.className = 'chatbot-msg bot-msg';
      botMsgDiv.innerHTML = `<p>${botResponse}</p>`;
      chatbotMessages.appendChild(botMsgDiv);
      chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }, 500);
  }

  /* Bot response logic */
  function getBotResponse(msg) {
    const responses = {
      'shipping': 'We offer free shipping on all orders over $75! Delivery typically takes 5-7 business days.',
      'return': 'We accept returns within 30 days of purchase, no questions asked. Just contact our support team.',
      'price': 'Our products range from $50 to $400+ depending on the item. Check our shop for full pricing.',
      'product': 'We offer handcrafted lighting, home decor, fragrances, and lifestyle accessories. Visit our shop to explore!',
      'new': 'Check out our New Arrivals section! We regularly add unique, carefully curated pieces to our collection.',
      'sale': 'Our seasonal sales offer up to 40% off select lighting items. Subscribe to our newsletter for exclusive deals!',
      'support': 'Our customer support team is available 24/7. Email us at hello@lume-studio.com or call +91 98765 43210.',
      'account': 'You can manage your account, order history, and preferences from the Account page. Click the person icon in the navbar!',
      'wishlist': 'Save your favorite items to your wishlist by clicking the heart icon. Your wishlist is saved locally on your device.',
      'cart': 'Manage your shopping cart from the cart icon in the navbar or the Cart page. Review items before checkout.',
    };

    /* Check for keyword matches */
    for (const [key, response] of Object.entries(responses)) {
      if (msg.includes(key)) return response;
    }

    /* Default response for greetings */
    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
      return 'Hello! 👋 How can I assist you with LUMÉ products today?';
    }
    if (msg.includes('thank') || msg.includes('thanks')) {
      return 'You\'re welcome! Is there anything else I can help with?';
    }
    if (msg.includes('bye') || msg.includes('goodbye')) {
      return 'Thanks for chatting! Feel free to reach out anytime. 😊';
    }

    /* Fallback response */
    return 'That\'s a great question! For more detailed assistance, please contact our support team at hello@lume-studio.com or call +91 98765 43210. We\'re here 24/7!';
  }

  /* Helper to escape HTML */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /* Send on button click */
  if (chatbotSendBtn) {
    chatbotSendBtn.addEventListener('click', sendMessage);
  }

  /* Send on Enter key */
  if (chatbotInput) {
    chatbotInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  /* Close chatbot when clicking outside */
  document.addEventListener('click', (e) => {
    if (!chatbotWidget.contains(e.target) && !chatbotToggleBtn.contains(e.target)) {
      if (chatbotWidget.classList.contains('active')) {
        chatbotWidget.classList.remove('active');
      }
    }
  });
}

/* Initialize chatbot when DOM is ready */
document.addEventListener('DOMContentLoaded', () => {
  initChatbot();
});
