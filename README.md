# LUMÉ — Full-Stack E-commerce Platform

A full-stack e-commerce demo featuring a responsive storefront, React admin dashboard, Node.js REST API, MongoDB database, customer authentication, cart, wishlist, and order management.

## Live Demo

| Component        | Live URL                                          |
| ---------------- | ------------------------------------------------- |
| Storefront       | https://lume-fullstack.web.app/                   |
| Admin Panel      | https://lume-fullstack-ecommerce-h2kk.vercel.app/ |
| Backend API      | https://lume-backend-oz8t.onrender.com            |
| API Health Check | https://lume-backend-oz8t.onrender.com/api/health |

> **Note:** LUMÉ is a demonstration e-commerce project built to showcase full-stack development and deployment.

## Project Overview

LUMÉ provides an end-to-end shopping experience, from browsing products and managing a cart to placing orders and tracking their status through the customer account. Administrators can manage products, categories, customers, and orders through a dedicated dashboard.

```text
Customer
   ↓
LUMÉ Storefront (Firebase Hosting)
   ↓
Backend REST API (Node.js + Express)
   ↓
MongoDB Atlas
   ↓
Order Management
   ↓
Admin Dashboard (React + Vite)
```

## Tech Stack

### Frontend

* HTML5
* CSS3
* JavaScript
* Responsive design
* Firebase Hosting

### Admin Panel

* React
* Vite
* Tailwind CSS
* React Router
* Axios
* Recharts
* Lucide React

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT authentication
* REST API
* Cloudinary and Multer for image management

### Deployment and Services

* Firebase Hosting — Storefront
* Vercel — Admin Panel
* Render — Backend API
* MongoDB Atlas — Database
* Cloudinary — Image storage

## Project Structure

```text
lume-fullstack-ecommerce/
│
├── lume-backend/
│   ├── config/
│   │   └── Database and Cloudinary configuration
│   ├── models/
│   │   └── Mongoose schemas
│   ├── middleware/
│   │   └── Authentication, validation, error handling
│   ├── controllers/
│   │   └── API business logic
│   ├── routes/
│   │   └── REST API routes
│   ├── seed/
│   │   └── seedData.js
│   ├── server.js
│   ├── .env.example
│   └── package.json
│
├── lume-admin/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard
│   │   │   ├── Products
│   │   │   ├── Categories
│   │   │   ├── Orders
│   │   │   ├── Customers
│   │   │   ├── Coupons
│   │   │   ├── Deals
│   │   │   ├── Banners
│   │   │   └── Login
│   │   ├── components/
│   │   ├── context/
│   │   └── api/
│   ├── .env.example
│   └── package.json
│
└── lume-frontend-integration/
    └── lume-site/
        ├── index.html
        ├── shop.html
        ├── product-details.html
        ├── cart.html
        ├── checkout.html
        ├── account.html
        ├── wishlist.html
        └── assets/
            ├── css/
            └── js/
```

## Key Features

### Customer Storefront

* Responsive homepage with product collections
* Product categories and product detail pages
* Product search and browsing
* Shopping cart and quantity management
* Wishlist functionality
* Customer registration and login
* Checkout and Cash on Delivery
* Customer account and order history
* Contact form and newsletter interface

### Admin Dashboard

* Admin authentication
* Dashboard with order, customer, product, and revenue statistics
* Product management
* Category management
* Order management and status updates
* Customer management
* Coupons, deals, and banners management

### Backend API

* RESTful API built with Express
* MongoDB data persistence
* User and admin JWT authentication
* Product and category endpoints
* Cart and wishlist endpoints
* Order creation and management
* Coupon and deal functionality
* Cloudinary image handling
* API health endpoint

## Order Status Workflow

```text
Pending
   ↓
Confirmed
   ↓
Processing
   ↓
Shipped
   ↓
Delivered
```

Orders may also be cancelled before reaching the Delivered state, subject to the backend's status transition rules. The backend supports restocking items when an order is cancelled.

## Local Development

### 1. Clone the repository

```bash
git clone https://github.com/arbajkhan23/lume-fullstack-ecommerce.git

cd lume-fullstack-ecommerce
```

### 2. Backend Setup

```bash
cd lume-backend
npm install
```

Create a `.env` file using `.env.example` as a reference. Configure your own database URI, JWT secrets, Cloudinary credentials, and allowed frontend origins.

```bash
npm run seed
npm run dev
```

Backend development server:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

### 3. Admin Panel Setup

```bash
cd lume-admin
npm install
```

Create a `.env` file and configure the API URL:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the development server:

```bash
npm run dev
```

The Vite development server is configured for:

```text
http://localhost:5174
```

### 4. Frontend Setup

Open the `lume-frontend-integration/lume-site` directory and serve the static storefront locally using a development server.

Configure the frontend API endpoint to point to your local backend when developing locally. For production, use the deployed API endpoint.

## Production Deployment

| Service       | Platform         | Purpose                  |
| ------------- | ---------------- | ------------------------ |
| Storefront    | Firebase Hosting | Customer-facing website  |
| Admin Panel   | Vercel           | Administration dashboard |
| Backend       | Render           | Express REST API         |
| Database      | MongoDB Atlas    | Application data         |
| Image Storage | Cloudinary       | Product and media images |

### Production API

```text
https://lume-backend-oz8t.onrender.com/api
```

### Environment Variables

Configure environment variables securely in each hosting provider. Typical backend settings include:

```env
NODE_ENV=production
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_random_secret
ADMIN_JWT_SECRET=your_secure_admin_secret
CLIENT_URL=your_storefront_origin
ADMIN_URL=your_admin_panel_origin
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Use your own credentials and never commit `.env` files or private secrets to GitHub.

## Testing and Verification

The deployed project has been tested for key end-to-end order functionality:

* Customer checkout and order submission
* Order reference generation
* Cash on Delivery order confirmation
* Customer order history
* Admin order visibility
* Admin order status updates
* Updated order status reflected in customer order history

The live order flow was verified using the deployed storefront, backend, database, and admin dashboard.

> Testing reflects the demonstrated flows and does not imply that every possible edge case, security scenario, or production load condition has been independently audited.

## Security

* Keep database credentials and JWT secrets in environment variables.
* Use strong, unique production secrets.
* Do not publish admin passwords or private credentials in the repository.
* Restrict CORS to the deployed storefront and admin origins.
* Use HTTPS for production services.
* Change any initial or seeded administrator password before production use.
* Review authentication, authorization, validation, and rate limiting before accepting real customer transactions.

## Future Improvements

* Integrate a production payment gateway
* Add automated end-to-end testing
* Improve analytics and reporting
* Add order email notifications
* Expand product filtering and sorting
* Optimize image delivery and storefront performance
* Add automated backups and production monitoring

## Developer

**Arbaj Khan**
Frontend Developer | Full-Stack E-commerce Project

Portfolio: https://arbaj-portfolio.web.app/

GitHub: https://github.com/arbajkhan23

---

**LUMÉ** — Full-Stack E-commerce Demo
Built with React, Node.js, Express, MongoDB, and modern web technologies.
