# LUMÉ — Backend + Admin Panel

Full backend and admin panel for the LUMÉ e-commerce storefront
(`https://arbajkhan23.github.io/lumesite/`), built to plug into the existing
frontend without changing its design.

```
Admin → Admin Panel (React) → Backend API (Express) → MongoDB → LUMÉ Frontend → Customer → Order → Admin Panel
```

## What's included

```
lume-backend/                  Node.js + Express + MongoDB REST API
├── config/                    DB + Cloudinary/Multer setup
├── models/                    10 Mongoose schemas
├── middleware/                Auth (user + admin JWT), error handling, validation
├── controllers/                12 controllers — full business logic
├── routes/                    10 REST namespaces
├── seed/seedData.js           Loads your live site's 24 products + 6 categories
├── server.js                  App entrypoint
├── .env.example
└── package.json

lume-admin/                    React + Vite + Tailwind admin panel
├── src/pages/                  Dashboard, Products, Categories, Orders,
│                               Customers, Coupons, Deals, Banners, Login
├── src/components/            Reusable table, modal, confirm dialog, stat cards
├── src/context/AuthContext.jsx
├── src/api/axios.js           JWT-attached HTTP client
├── .env.example
└── package.json

lume-frontend-integration/     Patch files for your EXISTING GitHub Pages site
├── products.js                 Drop-in replacement (API-backed, same globals)
├── lume-api.js                 New script — auth/cart/wishlist/orders
└── FRONTEND_INTEGRATION_GUIDE.md   Exact patch points, page by page
```

## 1. Backend setup

```bash
cd lume-backend
cp .env.example .env
# Fill in: MONGO_URI (MongoDB Atlas or local), JWT_SECRET, ADMIN_JWT_SECRET,
# CLOUDINARY_* credentials, CLIENT_URL, ADMIN_URL

npm install
npm run seed        # loads your 24 live products + 6 categories + a super admin
npm run dev          # starts on http://localhost:5000
```

Health check: `GET http://localhost:5000/api/health`

**Default super admin** (from seed, unless overridden in `.env`):
`admin@lume-studio.com` / `ChangeMe123!` — **change this password after first login.**

## 2. Admin panel setup

```bash
cd lume-admin
cp .env.example .env
# VITE_API_URL=http://localhost:5000/api  (or your deployed backend URL)

npm install
npm run dev          # starts on http://localhost:5174
```

Log in with the super admin credentials above.

## 3. Connect your existing frontend

Follow `lume-frontend-integration/FRONTEND_INTEGRATION_GUIDE.md` — it's a
short, surgical list of patches (new script includes + wrapping existing
render calls in one event listener). No HTML structure, CSS, or visual
design changes required.

## Order status flow

```
Pending → Confirmed → Processing → Shipped → Delivered
                                        ↘
                                     Cancelled (from any pre-Delivered state)
```
Cancelling an order automatically restocks its items. Delivered/Cancelled
are terminal — the API rejects further status changes once reached.

## Security notes for production

- Rotate `JWT_SECRET` / `ADMIN_JWT_SECRET` to long random values — never reuse the placeholders in `.env.example`.
- Change the seeded super admin password immediately.
- Set `NODE_ENV=production` to suppress stack traces in error responses.
- `CLIENT_URL` / `ADMIN_URL` lock down CORS — update them to your real deployed origins.
- Rate limiting is already applied to both login endpoints (30 requests / 15 min).

## Deployment suggestions

- **Backend**: Render, Railway, or Fly.io (any Node host + MongoDB Atlas)
- **Admin panel**: Vercel or Netlify (`npm run build` → static `dist/`)
- **Database**: MongoDB Atlas free tier is sufficient to start
- **Images**: already handled by Cloudinary — no server disk storage needed

## Known limitations of this delivery

- Built and syntax-validated in a sandboxed environment without live MongoDB
  or npm registry access — every file passed `node --check` (backend) and a
  bracket-balance pass (admin panel JSX), but a live end-to-end run against
  a real database hasn't been performed. Budget time for a first-run smoke
  test once you have Atlas + Cloudinary credentials in place.
- Frontend integration is delivered as a guide + two new JS files rather
  than already applied to your live GitHub Pages repo, since this
  environment doesn't have push access to it.
