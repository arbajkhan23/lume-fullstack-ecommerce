# LUMÉ Frontend ↔ Backend Integration Guide

This connects your existing live site (`arbajkhan23.github.io/lumesite`) to
the new backend without redesigning anything. Every visual element stays
exactly as it is — only the *data source* changes, from a hardcoded array to
live API calls.

## What changes, in one sentence
`assets/js/products.js` goes from a static array to a fetch-on-load script,
and every page's inline `<script>` that reads `PRODUCTS`/`CATEGORIES` needs
to wait for a `lume:ready` event instead of running immediately.

---

## Step 1 — Replace `assets/js/products.js`

Swap the file for the one in this delivery (`products.js`). It keeps the
exact same exports (`CATEGORIES`, `PRODUCTS`, `catLabel`, `getProductById`,
`getRelatedProducts`) — nothing that reads them needs to change its logic,
only *when* it runs.

Set your deployed backend URL at the top of each HTML page, before the
script tags, e.g.:

```html
<script>window.LUME_API_BASE = 'https://your-backend.onrender.com/api';</script>
<script src="assets/js/products.js"></script>
<script src="assets/js/main.js"></script>
<script src="assets/js/lume-api.js"></script>
```

(Leave `LUME_API_BASE` unset locally and it defaults to
`http://localhost:5000/api` for local development.)

## Step 2 — Wrap each page's data-rendering script in the ready event

Every page currently has an inline `<script>` block at the bottom that runs
code like `document.getElementById('featuredGrid').innerHTML = ...`
immediately after the script tags load. Wrap that block's *contents* in:

```js
document.addEventListener('lume:ready', () => {
  // ...existing rendering code, unchanged...
});
```

### index.html
Wrap this existing block:
```js
document.getElementById('categoryGrid').innerHTML = CATEGORIES.map(catCard).join('');
document.getElementById('featuredGrid').innerHTML = PRODUCTS.slice(0,8).map(...).join('');
document.getElementById('arrivalsRow').innerHTML = PRODUCTS.filter(p=>p.tag==='new').map(...).join('');
document.getElementById('trendingGrid').innerHTML = PRODUCTS.slice(14,22).map(...).join('');
// ...filter pill listener, countdown, arrivals slider buttons...
```
in the `lume:ready` listener. The countdown timer and slider button
listeners don't depend on data — leave those exactly where they are, only
the four `innerHTML =` lines (and anything that reads `PRODUCTS`/`CATEGORIES`
directly) need to move inside the listener.

### shop.html
Wrap the whole filter/sort/render block, from `const params = new URLSearchParams...`
down through the initial `renderShop();` call, in the `lume:ready` listener —
`getFilteredProducts()` reads `PRODUCTS`, so it must run after data loads.

### product-details.html
Wrap everything from `const urlParams = ...` through the final
`document.getElementById('relatedGrid').innerHTML = ...` line. Note:
`productId` now needs to accept a Mongo ObjectId string, not just a number —
`getProductById` in the new `products.js` already handles both.

### cart.html / wishlist.html
Wrap `renderCart()` / `renderWishlist()` (the initial call and the function
bodies that reference `getProductById`) in the `lume:ready` listener, since
`getProductById` now depends on `PRODUCTS` being populated.

### checkout.html
Same — wrap `renderCheckout()`'s initial call.

**No changes needed** for `about.html` or `contact.html` — neither reads
product/category data.

---

## Step 3 — Wire real authentication into `account.html`

Replace the two placeholder `submit` handlers with real calls:

```js
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = e.target.querySelector('[type=email]').value;
  const password = e.target.querySelector('[type=password]').value;
  try {
    await lumeLogin({ email, password });
    showToast('Signed in — welcome back');
    window.location.href = 'index.html';
  } catch (err) {
    showToast(err.message, 'bi-exclamation-circle');
  }
});

document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const inputs = e.target.querySelectorAll('input');
  try {
    await lumeRegister({
      firstName: inputs[0].value, lastName: inputs[1].value,
      email: inputs[2].value, password: inputs[3].value,
    });
    showToast('Account created — welcome to LUMÉ');
    window.location.href = 'index.html';
  } catch (err) {
    showToast(err.message, 'bi-exclamation-circle');
  }
});
```

Also update the account icon in every navbar to reflect logged-in state if
desired (optional — e.g. swap the icon for the user's initial when
`lumeIsLoggedIn()` is true).

---

## Step 4 — Make cart/wishlist backend-aware when logged in

The simplest, lowest-risk approach: keep `main.js`'s existing
`addToCart` / `toggleWishlistId` (localStorage) as the **guest** path
exactly as today, and add a check at the top of `handleAddClick` /
`handleWishClick` in `main.js`:

```js
function handleAddClick(e, id, btn) {
  e.preventDefault(); e.stopPropagation();
  if (lumeIsLoggedIn()) {
    lumeAddToServerCart(id, 1).then(() => { /* refresh badge from server count */ });
  } else {
    addToCart(id, 1); // existing localStorage path, unchanged
  }
  // ...rest of the existing animation/toast code stays the same...
}
```

Do the same pattern in `handleWishClick`. This is intentionally additive —
if you'd rather ship the data-source swap first and layer in
account-aware cart/wishlist later, Step 4 can be deferred without breaking
anything in Steps 1–3.

---

## Step 5 — Real checkout → real orders

In `checkout.html`'s `checkoutForm` submit handler, replace the fake
`orderNum` generation with:

```js
document.getElementById('checkoutForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!lumeIsLoggedIn()) {
    showToast('Please sign in to complete checkout');
    window.location.href = 'account.html';
    return;
  }
  const form = e.target;
  const [fullName, email, street, city, state, zip] = [...form.querySelectorAll('input[type=text], input[type=email]')].map(i => i.value);
  const phone = form.querySelector('input[type=tel]').value;
  const country = form.querySelector('select').value;

  try {
    const order = await lumePlaceOrder({
      shippingAddress: { fullName, phone, street, city, state, zip, country },
      paymentMethod: 'Card',
    });
    document.getElementById('orderNumber').textContent = `#${order.orderNumber}`;
    document.getElementById('checkoutHasItems').classList.add('d-none');
    document.getElementById('checkoutConfirmation').classList.remove('d-none');
  } catch (err) {
    showToast(err.message, 'bi-exclamation-circle');
  }
});
```

---

## Step 6 — CORS

The backend's `.env` already has `CLIENT_URL=https://arbajkhan23.github.io`
pre-filled to match your GitHub Pages origin — no extra config needed as
long as the backend is deployed with that env var set.

---

## Summary of files in this delivery

| File | Purpose |
|---|---|
| `products.js` | Drop-in replacement — fetches categories/products from the API |
| `lume-api.js` | New script — auth, cart, wishlist, addresses, orders, coupon validation |
| This guide | Exact patch points for each existing HTML page |

Nothing in your HTML structure, CSS, or visual design needs to change —
every patch above is either a new `<script>` include or wrapping existing
render calls in one event listener.
