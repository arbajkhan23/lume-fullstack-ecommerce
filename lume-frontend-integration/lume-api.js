/* ==========================================================================
   LUMÉ — Frontend / Backend Integration
   ==========================================================================

   PURPOSE:
   - Customer authentication
   - Backend cart for logged-in users
   - Backend wishlist for logged-in users
   - Customer addresses
   - Backend order placement
   - Coupon validation

   SCRIPT ORDER:
   IMPORTANT:
   products.js and main.js must load BEFORE this file.

   Example:
   <script src="assets/js/products.js"></script>
   <script src="assets/js/main.js"></script>
   <script src="assets/js/lume-api.js"></script>
   ========================================================================== */


/* ==========================================================================
   API CONFIG
========================================================================== */

const LUME_API_BASE =
  window.LUME_API_BASE ||
  'http://localhost:5000/api';


/* ==========================================================================
   STORAGE KEYS
========================================================================== */

const LUME_USER_TOKEN_KEY = 'lume_user_token';
const LUME_USER_KEY = 'lume_user';


/* ==========================================================================
   AUTH HELPERS
========================================================================== */

function lumeIsLoggedIn() {
  return Boolean(
    localStorage.getItem(LUME_USER_TOKEN_KEY)
  );
}


function lumeGetUser() {
  try {
    const user =
      localStorage.getItem(LUME_USER_KEY);

    return user
      ? JSON.parse(user)
      : null;

  } catch (error) {
    console.error(
      '[LUMÉ] Unable to read saved user:',
      error
    );

    return null;
  }
}


/* ==========================================================================
   AUTHENTICATED FETCH
========================================================================== */

async function lumeAuthedFetch(
  path,
  options = {}
) {

  const token =
    localStorage.getItem(
      LUME_USER_TOKEN_KEY
    );


  const headers = {
    ...(options.body
      ? {
          'Content-Type':
            'application/json',
        }
      : {}),

    ...(token
      ? {
          Authorization:
            `Bearer ${token}`,
        }
      : {}),

    ...(options.headers || {}),
  };


  const response = await fetch(
    `${LUME_API_BASE}${path}`,
    {
      ...options,
      headers,
    }
  );


  const body =
    await response
      .json()
      .catch(() => ({}));


  if (
    response.status === 401
  ) {

    /*
     * Token is invalid/expired.
     * Clear local customer session.
     */

    localStorage.removeItem(
      LUME_USER_TOKEN_KEY
    );

    localStorage.removeItem(
      LUME_USER_KEY
    );
  }


  if (!response.ok) {

    throw new Error(
      body.message ||
      `Request failed: ${path}`
    );

  }


  return body;
}


/* ==========================================================================
   REGISTER
========================================================================== */

async function lumeRegister({
  firstName,
  lastName,
  email,
  password,
  phone = '',
}) {

  const response =
    await lumeAuthedFetch(
      '/auth/register',
      {
        method: 'POST',

        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          phone,
        }),
      }
    );


  if (
    !response.success ||
    !response.data?.token
  ) {

    throw new Error(
      response.message ||
      'Registration failed.'
    );

  }


  localStorage.setItem(
    LUME_USER_TOKEN_KEY,
    response.data.token
  );


  localStorage.setItem(
    LUME_USER_KEY,
    JSON.stringify(
      response.data
    )
  );


  /*
   * Merge guest cart/wishlist
   * into the newly created account.
   */

  await lumeSyncGuestCartAndWishlistToAccount();


  return response.data;
}


/* ==========================================================================
   LOGIN
========================================================================== */

async function lumeLogin({
  email,
  password,
}) {

  const response =
    await lumeAuthedFetch(
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
    !response.success ||
    !response.data?.token
  ) {

    throw new Error(
      response.message ||
      'Login failed.'
    );

  }


  localStorage.setItem(
    LUME_USER_TOKEN_KEY,
    response.data.token
  );


  localStorage.setItem(
    LUME_USER_KEY,
    JSON.stringify(
      response.data
    )
  );


  /*
   * Merge guest cart/wishlist
   * into the logged-in account.
   */

  await lumeSyncGuestCartAndWishlistToAccount();


  return response.data;
}


/* ==========================================================================
   LOGOUT
========================================================================== */

function lumeLogout() {

  localStorage.removeItem(
    LUME_USER_TOKEN_KEY
  );

  localStorage.removeItem(
    LUME_USER_KEY
  );

}


/* ==========================================================================
   GUEST CART + WISHLIST → ACCOUNT SYNC
========================================================================== */

async function lumeSyncGuestCartAndWishlistToAccount() {

  /*
   * These functions are provided by main.js.
   */

  const hasGetCart =
    typeof getCart === 'function';

  const hasGetWishlist =
    typeof getWishlist === 'function';


  /* -------------------------
     GUEST CART
  ------------------------- */

  if (hasGetCart) {

    let guestCart = [];

    try {
      guestCart = getCart() || [];
    } catch (error) {
      console.error(
        '[LUMÉ] Unable to read guest cart:',
        error
      );
    }


    for (const item of guestCart) {

      if (!item?.id) {
        continue;
      }


      try {

        await lumeAuthedFetch(
          '/cart',
          {
            method: 'POST',

            body: JSON.stringify({
              productId:
                String(item.id),

              qty:
                Number(item.qty) || 1,
            }),
          }
        );

      } catch (error) {

        console.error(
          '[LUMÉ] Cart sync failed:',
          error
        );

      }

    }

  }


  /* -------------------------
     GUEST WISHLIST
  ------------------------- */

  if (hasGetWishlist) {

    let guestWishlist = [];

    try {
      guestWishlist =
        getWishlist() || [];
    } catch (error) {
      console.error(
        '[LUMÉ] Unable to read guest wishlist:',
        error
      );
    }


    for (
      const productId
      of guestWishlist
    ) {

      if (!productId) {
        continue;
      }


      try {

        await lumeAuthedFetch(
          '/wishlist/toggle',
          {
            method: 'POST',

            body: JSON.stringify({
              productId:
                String(productId),
            }),
          }
        );

      } catch (error) {

        console.error(
          '[LUMÉ] Wishlist sync failed:',
          error
        );

      }

    }

  }


  /*
   * Clear only after successful sync attempt.
   */

  if (
    typeof writeStore === 'function' &&
    typeof LUME_CART_KEY !== 'undefined'
  ) {

    writeStore(
      LUME_CART_KEY,
      []
    );

  }


  if (
    typeof writeStore === 'function' &&
    typeof LUME_WISH_KEY !== 'undefined'
  ) {

    writeStore(
      LUME_WISH_KEY,
      []
    );

  }

}


/* ==========================================================================
   CART — BACKEND
========================================================================== */

async function lumeGetServerCart() {

  const response =
    await lumeAuthedFetch(
      '/cart'
    );


  const items =
    response.data?.items || [];


  return items
    .map((item) => {

      const product =
        item.product;


      if (!product) {
        return null;
      }


      return {
        id: String(
          product._id
        ),

        _id: String(
          product._id
        ),

        qty:
          Number(item.qty) || 1,

        product:
          typeof mapApiProduct === 'function'
            ? mapApiProduct(product)
            : product,
      };

    })
    .filter(Boolean);

}


/* ==========================================================================
   ADD TO SERVER CART
========================================================================== */

async function lumeAddToServerCart(
  productId,
  qty = 1
) {

  return lumeAuthedFetch(
    '/cart',
    {
      method: 'POST',

      body: JSON.stringify({
        productId:
          String(productId),

        qty:
          Number(qty) || 1,
      }),
    }
  );

}


/* ==========================================================================
   UPDATE SERVER CART QUANTITY
========================================================================== */

async function lumeSetServerCartQty(
  productId,
  qty
) {

  return lumeAuthedFetch(
    `/cart/${encodeURIComponent(
      String(productId)
    )}`,
    {
      method: 'PUT',

      body: JSON.stringify({
        qty:
          Number(qty),
      }),
    }
  );

}


/* ==========================================================================
   REMOVE SERVER CART ITEM
========================================================================== */

async function lumeRemoveFromServerCart(
  productId
) {

  return lumeAuthedFetch(
    `/cart/${encodeURIComponent(
      String(productId)
    )}`,
    {
      method: 'DELETE',
    }
  );

}


/* ==========================================================================
   CLEAR SERVER CART
========================================================================== */

async function lumeClearServerCart() {

  return lumeAuthedFetch(
    '/cart',
    {
      method: 'DELETE',
    }
  );

}


/* ==========================================================================
   WISHLIST — BACKEND
========================================================================== */

async function lumeGetServerWishlist() {

  const response =
    await lumeAuthedFetch(
      '/wishlist'
    );


  const products =
    response.data?.products || [];


  return products
    .map((product) => {

      if (
        typeof mapApiProduct ===
        'function'
      ) {

        return mapApiProduct(
          product
        );

      }


      return product;

    })
    .filter(Boolean);

}


/* ==========================================================================
   TOGGLE SERVER WISHLIST
========================================================================== */

async function lumeToggleServerWishlist(
  productId
) {

  const response =
    await lumeAuthedFetch(
      '/wishlist/toggle',
      {
        method: 'POST',

        body: JSON.stringify({
          productId:
            String(productId),
        }),
      }
    );


  return Boolean(
    response.active
  );

}


/* ==========================================================================
   ADDRESSES
========================================================================== */

async function lumeGetAddresses() {

  const response =
    await lumeAuthedFetch(
      '/users/addresses'
    );


  return response.data || [];

}


async function lumeAddAddress(
  address
) {

  const response =
    await lumeAuthedFetch(
      '/users/addresses',
      {
        method: 'POST',

        body: JSON.stringify(
          address
        ),
      }
    );


  return response.data;

}


/* ==========================================================================
   UPDATE USER PROFILE
========================================================================== */

async function lumeGetProfile() {

  const response =
    await lumeAuthedFetch(
      '/auth/profile'
    );


  if (
    response.success &&
    response.data
  ) {

    localStorage.setItem(
      LUME_USER_KEY,
      JSON.stringify(
        response.data
      )
    );

  }


  return response.data;

}


/* ==========================================================================
   UPDATE PROFILE
========================================================================== */

async function lumeUpdateProfile(
  data
) {

  const response =
    await lumeAuthedFetch(
      '/auth/profile',
      {
        method: 'PUT',

        body: JSON.stringify(
          data
        ),
      }
    );


  if (
    response.success &&
    response.data
  ) {

    localStorage.setItem(
      LUME_USER_KEY,
      JSON.stringify(
        response.data
      )
    );

  }


  return response.data;

}


/* ==========================================================================
   CHECKOUT / ORDERS
========================================================================== */

async function lumePlaceOrder({
  shippingAddress,
  paymentMethod = 'Card',
  couponCode = '',
}) {

  const response =
    await lumeAuthedFetch(
      '/orders',
      {
        method: 'POST',

        body: JSON.stringify({

          shippingAddress,

          paymentMethod,

          couponCode:
            couponCode ||
            null,

        }),
      }
    );


  if (
    !response.success ||
    !response.data
  ) {

    throw new Error(
      response.message ||
      'Unable to place order.'
    );

  }


  return response.data;

}


/* ==========================================================================
   MY ORDERS
========================================================================== */

async function lumeGetMyOrders() {

  const response =
    await lumeAuthedFetch(
      '/orders/my'
    );


  return response.data || [];

}


/* ==========================================================================
   SINGLE ORDER
========================================================================== */

async function lumeGetOrder(
  orderId
) {

  const response =
    await lumeAuthedFetch(
      `/orders/${encodeURIComponent(
        String(orderId)
      )}`
    );


  return response.data;

}


/* ==========================================================================
   COUPON VALIDATION
========================================================================== */

async function lumeValidateCoupon(
  code,
  subtotal
) {

  const response =
    await lumeAuthedFetch(
      '/coupons/validate',
      {
        method: 'POST',

        body: JSON.stringify({
          code:
            String(code)
              .trim()
              .toUpperCase(),

          subtotal:
            Number(subtotal) || 0,
        }),
      }
    );


  return response.data;

}


/* ==========================================================================
   GLOBAL API
========================================================================== */

window.LumeAPI = {

  /* Auth */
  isLoggedIn:
    lumeIsLoggedIn,

  getUser:
    lumeGetUser,

  login:
    lumeLogin,

  register:
    lumeRegister,

  logout:
    lumeLogout,

  getProfile:
    lumeGetProfile,

  updateProfile:
    lumeUpdateProfile,


  /* Cart */
  getCart:
    lumeGetServerCart,

  addCartItem:
    lumeAddToServerCart,

  updateCartItem:
    lumeSetServerCartQty,

  removeCartItem:
    lumeRemoveFromServerCart,

  clearCart:
    lumeClearServerCart,


  /* Wishlist */
  getWishlist:
    lumeGetServerWishlist,

  toggleWishlist:
    lumeToggleServerWishlist,


  /* Addresses */
  getAddresses:
    lumeGetAddresses,

  addAddress:
    lumeAddAddress,


  /* Orders */
  placeOrder:
    lumePlaceOrder,

  getMyOrders:
    lumeGetMyOrders,

  getOrder:
    lumeGetOrder,


  /* Coupons */
  validateCoupon:
    lumeValidateCoupon,


  /* Raw request */
  request:
    lumeAuthedFetch,

};


/* ==========================================================================
   DEBUG
========================================================================== */

console.log(
  '[LUMÉ] Backend integration loaded:',
  LUME_API_BASE
);