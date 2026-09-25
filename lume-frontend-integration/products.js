/* ==========================================================================
   LUMÉ — Frontend/Backend integration: products.js (API-backed)
   ==========================================================================
   DROP-IN REPLACEMENT for the static assets/js/products.js.
   Keeps the exact same globals and function signatures every page already
   uses (CATEGORIES, PRODUCTS, catLabel, getProductById, getRelatedProducts)
   so index.html / shop.html / product-details.html / etc. don't need their
   HTML changed — only the small inline <script> blocks that render data
   need to wait for the "lume:ready" event instead of running immediately.
   See FRONTEND_INTEGRATION_GUIDE.md for the exact one-line patch per page.
   ========================================================================== */

const LUME_API_BASE = window.LUME_API_BASE || 'http://localhost:5000/api';

// Mutable globals — same names the rest of the site already references.
// Pages must NOT destructure/copy these before "lume:ready" fires, since
// they start empty and are populated in place once the API responds.
let CATEGORIES = [];
let PRODUCTS = [];

function catLabel(slug) {
  const c = CATEGORIES.find((c) => c.slug === slug);
  return c ? c.name : slug;
}

function getProductById(id) {
  return PRODUCTS.find((p) => p.id === Number(id) || p._id === id);
}

function getRelatedProducts(product, count = 4) {
  return PRODUCTS.filter((p) => p.cat === product.cat && p.id !== product.id).slice(0, count);
}

/**
 * Maps a backend product document (Mongo _id, populated category, images[])
 * onto the flat shape the existing frontend render functions expect
 * (id, cat, img, old, tag, stock as boolean, etc.) — this is the one place
 * that translates API shape into "site shape" so nothing else has to change.
 */
function mapApiProduct(p) {
  return {
    id: p._id,
    _id: p._id,
    name: p.name,
    cat: p.category?.slug || p.category,
    catLabel: p.category?.name,
    price: p.price,
    old: p.oldPrice || null,
    rating: p.rating || 0,
    reviews: p.numReviews || 0,
    img: p.images?.[0]?.url || `https://picsum.photos/seed/lume-fallback/500/620`,
    images: (p.images || []).map((i) => i.url),
    tag: p.tag,
    stock: p.inStock !== undefined ? p.inStock : p.stock > 0,
    desc: p.description,
    features: p.features || [],
    slug: p.slug,
  };
}

function mapApiCategory(c) {
  return {
    slug: c.slug,
    name: c.name,
    count: `${c.productCount ?? 0} items`,
    img: c.image?.url || `https://picsum.photos/seed/lume-cat-${c.slug}/300/300`,
  };
}

async function lumeFetchJSON(path, options = {}) {
  const res = await fetch(`${LUME_API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || `Request failed: ${path}`);
  return body;
}

/**
 * Loads categories + products from the API and populates the globals above.
 * Falls back to whatever is already in PRODUCTS/CATEGORIES (empty on first
 * load) if the API is unreachable, so the page doesn't hard-crash — it will
 * just render "no products found" empty states instead.
 */
async function initLumeData() {
  try {
    const [catRes, prodRes] = await Promise.all([
      lumeFetchJSON('/categories'),
      lumeFetchJSON('/products?limit=100'),
    ]);
    CATEGORIES.length = 0;
    CATEGORIES.push(...catRes.data.map(mapApiCategory));

    PRODUCTS.length = 0;
    PRODUCTS.push(...prodRes.data.map(mapApiProduct));
  } catch (err) {
    console.error('[LUMÉ] Failed to load live data from API — check LUME_API_BASE and that the backend is running.', err);
  } finally {
    document.dispatchEvent(new CustomEvent('lume:ready'));
  }
}

document.addEventListener('DOMContentLoaded', initLumeData);
