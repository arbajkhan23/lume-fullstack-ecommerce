const LUME_API_BASE =
  'https://lume-backend-oz8t.onrender.com/api';

const LUME_USER_TOKEN_KEY =
  'lume_user_token';

const LUME_USER_KEY =
  'lume_user';


/* =========================
   API REQUEST HELPER
========================= */

async function lumeApiRequest(endpoint, options = {}) {
  const token =
    localStorage.getItem(LUME_USER_TOKEN_KEY);

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${LUME_API_BASE}${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  let result = null;

  try {
    result = await response.json();
  } catch {
    result = {};
  }

  if (!response.ok) {
    throw new Error(
      result.message ||
      'Something went wrong. Please try again.'
    );
  }

  return result;
}


/* =========================
   LOGIN
========================= */

async function loginUser(email, password) {
  const result = await lumeApiRequest(
    '/auth/login',
    {
      method: 'POST',

      body: JSON.stringify({
        email,
        password,
      }),
    }
  );

  if (
    !result.success ||
    !result.data?.token
  ) {
    throw new Error(
      result.message ||
      'Login failed.'
    );
  }

  localStorage.setItem(
    LUME_USER_TOKEN_KEY,
    result.data.token
  );

  localStorage.setItem(
    LUME_USER_KEY,
    JSON.stringify({
      _id: result.data._id,
      firstName: result.data.firstName,
      lastName: result.data.lastName,
      email: result.data.email,
    })
  );

  return result.data;
}


/* =========================
   REGISTER
========================= */

async function registerUser(data) {
  const result = await lumeApiRequest(
    '/auth/register',
    {
      method: 'POST',

      body: JSON.stringify(data),
    }
  );

  if (
    !result.success ||
    !result.data?.token
  ) {
    throw new Error(
      result.message ||
      'Registration failed.'
    );
  }

  localStorage.setItem(
    LUME_USER_TOKEN_KEY,
    result.data.token
  );

  localStorage.setItem(
    LUME_USER_KEY,
    JSON.stringify({
      _id: result.data._id,
      firstName: result.data.firstName,
      lastName: result.data.lastName,
      email: result.data.email,
    })
  );

  return result.data;
}


/* =========================
   GET PROFILE
========================= */

async function getUserProfile() {
  const result =
    await lumeApiRequest(
      '/auth/profile'
    );

  if (result.success && result.data) {
    localStorage.setItem(
      LUME_USER_KEY,
      JSON.stringify(result.data)
    );

    return result.data;
  }

  return null;
}

/* =========================
   CUSTOMER DATA
========================= */

function unwrapData(result) {
  return result?.data ?? result;
}

function normalizeCart(cart) {
  return (cart?.items || []).map((item) => ({
    id: String(item.product?._id || item.product || ''),
    qty: Number(item.qty) || 1,
    product: item.product,
  })).filter((item) => item.id);
}

async function getCart() {
  return normalizeCart(unwrapData(await lumeApiRequest('/cart')));
}

async function addCartItem(productId, qty = 1) {
  const result = await lumeApiRequest('/cart', {
    method: 'POST',
    body: JSON.stringify({ productId: String(productId), qty: Number(qty) || 1 }),
  });
  return normalizeCart(unwrapData(result));
}

async function updateCartItem(productId, qty) {
  const result = await lumeApiRequest(`/cart/${String(productId)}`, {
    method: 'PUT',
    body: JSON.stringify({ qty: Number(qty) || 0 }),
  });
  return normalizeCart(unwrapData(result));
}

async function removeCartItem(productId) {
  const result = await lumeApiRequest(`/cart/${String(productId)}`, {
    method: 'DELETE',
  });
  return normalizeCart(unwrapData(result));
}

async function clearCart() {
  const result = await lumeApiRequest('/cart', { method: 'DELETE' });
  return normalizeCart(unwrapData(result));
}

async function getWishlist() {
  const result = await lumeApiRequest('/wishlist');
  return (unwrapData(result)?.products || []).map((product) => product?._id || product).map(String);
}

async function toggleWishlistItem(productId) {
  const result = await lumeApiRequest('/wishlist/toggle', {
    method: 'POST',
    body: JSON.stringify({ productId: String(productId) }),
  });
  return { active: Boolean(result.active), ids: await getWishlist() };
}

async function getMyOrders() {
  const result = await lumeApiRequest('/orders/my');
  return unwrapData(result) || [];
}

async function validateCoupon(code, subtotal) {
  const result = await lumeApiRequest('/coupons/validate', {
    method: 'POST',
    body: JSON.stringify({ code, subtotal }),
  });
  return unwrapData(result);
}

async function placeOrder(data) {
  const result = await lumeApiRequest('/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return unwrapData(result);
}

async function getProducts(params = {}) {
  const query = new URLSearchParams(params).toString();
  const result = await lumeApiRequest(`/products${query ? `?${query}` : ''}`);
  return unwrapData(result) || [];
}

async function getBanners(placement) {
  const query = placement ? `?placement=${encodeURIComponent(placement)}` : '';
  const result = await lumeApiRequest(`/banners${query}`);
  return unwrapData(result) || [];
}

async function sendContactMessage(data) {
  const result = await lumeApiRequest('/contact', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return unwrapData(result);
}


/* =========================
   LOGOUT
========================= */

function logoutUser() {
  localStorage.removeItem(
    LUME_USER_TOKEN_KEY
  );

  localStorage.removeItem(
    LUME_USER_KEY
  );
}


/* =========================
   AUTH CHECK
========================= */

function isUserLoggedIn() {
  return Boolean(
    localStorage.getItem(
      LUME_USER_TOKEN_KEY
    )
  );
}


/* =========================
   GET SAVED USER
========================= */

function getSavedUser() {
  try {
    const user =
      localStorage.getItem(
        LUME_USER_KEY
      );

    return user
      ? JSON.parse(user)
      : null;

  } catch {
    return null;
  }
}


/* =========================
   GLOBAL API
========================= */

window.LumeAPI = {
  request: lumeApiRequest,
  login: loginUser,
  register: registerUser,
  getProfile: getUserProfile,
  logout: logoutUser,
  isLoggedIn: isUserLoggedIn,
  getUser: getSavedUser,
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
  getWishlist,
  toggleWishlistItem,
  getMyOrders,
  validateCoupon,
  placeOrder,
  getProducts,
  getBanners,
  sendContactMessage,
};
