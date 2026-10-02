# 🚀 Universal MERN Stack Backend Template

A production-ready, highly modular, scalable, and universal **Node.js + Express + MongoDB (Mongoose)** backend boilerplate designed to serve as a foundational template for modern web and mobile applications.

Clone this repository, customize models and routes, and launch your API in minutes with security, role-based authorization, validation, and error-handling best practices pre-configured.

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Folder Structure](#-folder-structure)
- [Quick Start Guide](#-quick-start-guide)
- [Environment Variables](#-environment-variables)
- [API Documentation & Endpoints](#-api-documentation--endpoints)
  - [Health Check](#health-check)
  - [Authentication](#authentication-routes)
  - [User Management](#user-management-routes)
  - [Posts (Example CRUD Resource)](#posts-example-crud-resource)
- [Authentication & Token Architecture](#-authentication--token-architecture)
- [Standard API Contract](#-standard-api-contract)
  - [Success Response Format](#success-response-format)
  - [Error Response Format](#error-response-format)
- [How to Add New Features (Extensibility Guide)](#-how-to-add-new-features-extensibility-guide)
- [Deployment Guide](#-deployment-guide)
  - [Deploying to Render](#deploy-to-render)
  - [Deploying to Railway](#deploy-to-railway)
  - [Deploying to VPS (Ubuntu + PM2 + Nginx)](#deploy-to-vps-pm2--nginx)

---

## ✨ Features

- **Modern ES Modules (`import/export`)**: Native ECMAScript standard support.
- **MongoDB Connection Resilience**: Automatic reconnection, lifecycle event logging, and graceful teardown.
- **JWT Authentication & Authorization**:
  - Secure `httpOnly` cookies + optional `Authorization: Bearer <token>` support.
  - Role-based access control (`user`, `admin`).
  - Automatic invalidation if password was recently updated.
- **Robust Error Handling**:
  - Centralized operational `AppError` class.
  - Express global error middleware handling Mongoose validation, CastError, duplicate keys (11000), and JWT expiration.
  - Dev vs. Production modes (strips call stacks in production).
- **Validation Pipeline**:
  - Request body, query, and parameter validation powered by **Joi**.
- **Enterprise-Grade Security**:
  - **Helmet** for HTTP security headers.
  - **CORS** configured with dynamic origins and credentials support.
  - **Rate Limiting** (strict limits on `/api/v1/auth`, general limits on `/api`).
  - **NoSQL Injection Sanitizer** cleans incoming parameters and payloads.
  - Body payload size restrictions (`10kb` limit to prevent payload DoS).
- **Decoupled Architecture**:
  - Pluggable Email Service stub (ready for Nodemailer, Resend, or SendGrid).
  - Central router (`src/routes/index.js`) for one-line domain additions.
- **Zero-Downtime Readiness**:
  - Handles `uncaughtException`, `unhandledRejection`, and OS signals (`SIGTERM`, `SIGINT`).

---

## 🛠 Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/) (v18+)
- **Framework**: [Express.js](https://expressjs.com/) (v4.21+)
- **Database ODM**: [Mongoose](https://mongoosejs.com/) (v8+)
- **Authentication**: [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) & [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **Validation**: [Joi](https://joi.dev/)
- **Security & Utilities**: `helmet`, `cors`, `cookie-parser`, `express-rate-limit`, `morgan`

---

## 📁 Folder Structure

```text
mern-backend-universal/
├── .env.example                     # Environment variables template
├── .gitignore                       # Git ignore list
├── package.json                     # Scripts and dependencies
├── README.md                        # Documentation and guides
└── src/
    ├── app.js                       # Express application configuration & middlewares
    ├── server.js                    # Server bootstrap, MongoDB connection & shutdown hooks
    ├── config/
    │   ├── config.js                # Environment variable loader & validator
    │   ├── constants.js             # Enums: USER_ROLES, HTTP_STATUS, PAGINATION
    │   └── db.js                    # Mongoose connection & lifecycle handlers
    ├── controllers/
    │   ├── auth.controller.js       # Register, login, logout, getMe
    │   ├── user.controller.js       # Profile update, deactivation, admin user queries
    │   └── post.controller.js       # Full CRUD with author-ownership rules
    ├── middlewares/
    │   ├── auth.middleware.js       # protect & optionalAuth JWT verification
    │   ├── error.middleware.js      # Global error handler (Mongoose/JWT/AppError)
    │   ├── role.middleware.js       # restrictTo role-based authorization
    │   └── validate.middleware.js   # Joi request validation middleware
    ├── models/
    │   ├── User.js                  # User schema, password hashing & comparison
    │   └── Post.js                  # Example resource schema with author reference
    ├── routes/
    │   ├── index.js                 # Central route aggregator & /health check
    │   ├── auth.routes.js           # Authentication endpoints
    │   ├── user.routes.js           # User management endpoints
    │   └── post.routes.js           # Post CRUD endpoints
    ├── services/
    │   └── email.service.js         # Decoupled email delivery stub
    ├── utils/
    │   ├── apiResponse.js           # Standard JSON response formatter
    │   ├── AppError.js              # Operational error class
    │   └── catchAsync.js            # Async error forwarding wrapper
    └── validations/
        ├── auth.validation.js       # Register and login Joi schemas
        ├── user.validation.js       # User profile update & ID parameter schemas
        └── post.validation.js       # Post creation, update, and query schemas
```

---

## ⚡ Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (`node -v`)
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017`) or free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster.

### 2. Installation
```bash
# 1. Clone repository or copy project folder
cd "mern backend universal"

# 2. Install dependencies
npm install

# 3. Create your environment configuration file
cp .env.example .env

# 4. Start local development server with auto-reload
npm run dev
```

The server will initialize on `http://localhost:5000`.

---

## ⚙️ Environment Variables

Configure the following values inside your `.env` file:

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT` | Port number for the Express server | `5000` |
| `NODE_ENV` | Environment mode (`development`, `production`, `test`) | `development` |
| `MONGODB_URI` | MongoDB connection connection string | `mongodb://127.0.0.1:27017/mern_universal_db` |
| `JWT_SECRET` | Secret key for signing JSON Web Tokens | *Random 64+ char string* |
| `JWT_EXPIRES_IN` | Token validity duration | `7d` |
| `JWT_COOKIE_EXPIRES_IN_DAYS` | Cookie expiration in days | `7` |
| `FRONTEND_URL` | Frontend client origin for CORS | `http://localhost:5173` |
| `RATE_LIMIT_WINDOW_MINUTES` | Window duration for rate limiting | `15` |
| `RATE_LIMIT_MAX_REQUESTS` | General API rate limit per window | `100` |
| `AUTH_RATE_LIMIT_MAX_REQUESTS` | Auth endpoint rate limit per window | `20` |

---

## 📡 API Documentation & Endpoints

Base URL: `http://localhost:5000/api/v1`

### Health Check

#### `GET /api/v1/health`
Checks server and API status.

**Example Request:**
```bash
curl -X GET http://localhost:5000/api/v1/health
```

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Universal MERN API is running healthy.",
  "data": {
    "uptime": 12.45,
    "timestamp": "2026-10-02T05:07:00.000Z",
    "environment": "development"
  }
}
```

---

### Authentication Routes

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Public | Register new user account |
| `POST` | `/api/v1/auth/login` | Public | Log in with email & password |
| `POST` | `/api/v1/auth/logout` | Public | Clear auth cookie |
| `GET` | `/api/v1/auth/me` | Authenticated | Fetch current user profile |

#### 1. Register User
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alex Mercer",
    "email": "alex@example.com",
    "password": "Password123!"
  }'
```

**Response (201 Created):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Account created successfully.",
  "data": {
    "user": {
      "_id": "674dd8a3c8e5fa124a9e1b23",
      "name": "Alex Mercer",
      "email": "alex@example.com",
      "role": "user",
      "createdAt": "2026-10-02T05:10:00.000Z",
      "updatedAt": "2026-10-02T05:10:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
  }
}
```

#### 2. Login User
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alex@example.com",
    "password": "Password123!"
  }'
```

#### 3. Fetch Current Profile (`/me`)
```bash
curl -X GET http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

---

### User Management Routes

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `PATCH` | `/api/v1/users/me` | Authenticated | Update user name/email |
| `DELETE` | `/api/v1/users/me` | Authenticated | Deactivate own account |
| `GET` | `/api/v1/users` | Admin only | Paginated user list & search |
| `GET` | `/api/v1/users/:id` | Admin only | Get user details by ID |
| `DELETE` | `/api/v1/users/:id` | Admin only | Permanently delete user |

#### Update Profile Example:
```bash
curl -X PATCH http://localhost:5000/api/v1/users/me \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{ "name": "Alexander Mercer" }'
```

---

### Posts (Example CRUD Resource)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/posts` | Public | List posts (pagination, filter, search) |
| `GET` | `/api/v1/posts/:id` | Public | Retrieve single post |
| `POST` | `/api/v1/posts` | Authenticated | Create a new post |
| `PATCH` | `/api/v1/posts/:id` | Author / Admin | Update post |
| `DELETE` | `/api/v1/posts/:id` | Author / Admin | Delete post |

#### 1. Create a Post
```bash
curl -X POST http://localhost:5000/api/v1/posts \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Universal Architecture in Node.js",
    "content": "Designing clean, scalable RESTful APIs with Express and Mongoose.",
    "tags": ["nodejs", "express", "mongodb"],
    "isPublished": true
  }'
```

#### 2. Query Posts with Filters & Pagination
```bash
# Search by keyword, sort descending by date, page 1, 5 items per page
curl -X GET "http://localhost:5000/api/v1/posts?search=Architecture&page=1&limit=5&sort=-createdAt"
```

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Posts retrieved successfully.",
  "data": {
    "posts": [
      {
        "_id": "674dd8a3c8e5fa124a9e1b55",
        "title": "Universal Architecture in Node.js",
        "content": "Designing clean, scalable RESTful APIs with Express and Mongoose.",
        "tags": ["nodejs", "express", "mongodb"],
        "isPublished": true,
        "author": {
          "_id": "674dd8a3c8e5fa124a9e1b23",
          "name": "Alex Mercer",
          "email": "alex@example.com"
        },
        "createdAt": "2026-10-02T05:15:00.000Z",
        "updatedAt": "2026-10-02T05:15:00.000Z"
      }
    ]
  },
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 5,
    "totalPages": 1,
    "hasMore": false
  }
}
```

#### 3. Update a Post
```bash
curl -X PATCH http://localhost:5000/api/v1/posts/674dd8a3c8e5fa124a9e1b55 \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Updated Title: Architecture in Node.js" }'
```

#### 4. Delete a Post
```bash
curl -X DELETE http://localhost:5000/api/v1/posts/674dd8a3c8e5fa124a9e1b55 \
  -H "Authorization: Bearer <TOKEN>"
```

---

## 🔐 Authentication & Token Architecture

This template implements a dual-delivery token pattern:

1. **Secure `httpOnly` Cookie**:
   - Sent automatically via `Set-Cookie: token=...; HttpOnly; SameSite=Lax`.
   - Browser Javascript cannot read this cookie, mitigating Cross-Site Scripting (XSS) risks.
   - Requires `credentials: true` in your frontend `fetch` or `axios` instance.

2. **JSON Response Body Token**:
   - The signed JWT is also included in `data.token`.
   - Allows native mobile apps (React Native, Flutter) or non-browser API consumers to store and pass tokens via the `Authorization: Bearer <token>` header.

The `protect` middleware automatically checks:
1. `req.headers.authorization` (`Bearer <token>`)
2. `req.cookies.token`

---

## 📋 Standard API Contract

### Success Response Format
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Descriptive human-readable message",
  "data": { ... },
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

### Error Response Format
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed: Title is required",
  "errors": [
    {
      "field": "title",
      "message": "Title is required"
    }
  ]
}
```

---

## 🧩 How to Add New Features (Extensibility Guide)

To introduce a new domain entity (e.g. `Product`):

### Step 1: Create the Mongoose Model
Create `src/models/Product.js`:
```js
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    inStock: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Product', productSchema);
```

### Step 2: Create Validation Schemas
Create `src/validations/product.validation.js`:
```js
import Joi from 'joi';

export const createProductSchema = {
  body: Joi.object({
    name: Joi.string().trim().required(),
    price: Joi.number().positive().required(),
    inStock: Joi.boolean().optional(),
  }),
};
```

### Step 3: Create the Controller
Create `src/controllers/product.controller.js`:
```js
import Product from '../models/Product.js';
import catchAsync from '../utils/catchAsync.js';
import sendResponse from '../utils/apiResponse.js';
import { HTTP_STATUS } from '../config/constants.js';

export const createProduct = catchAsync(async (req, res) => {
  const product = await Product.create(req.body);
  return sendResponse(res, {
    statusCode: HTTP_STATUS.CREATED,
    message: 'Product created successfully',
    data: { product },
  });
});

export const getProducts = catchAsync(async (req, res) => {
  const products = await Product.find();
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    data: { products },
  });
});
```

### Step 4: Define Routes
Create `src/routes/product.routes.js`:
```js
import { Router } from 'express';
import * as productController from '../controllers/product.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { restrictTo } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createProductSchema } from '../validations/product.validation.js';
import { USER_ROLES } from '../config/constants.js';

const router = Router();

router.get('/', productController.getProducts);
router.post(
  '/',
  protect,
  restrictTo(USER_ROLES.ADMIN),
  validate(createProductSchema),
  productController.createProduct
);

export default router;
```

### Step 5: Mount in Central Router
Open `src/routes/index.js` and add one line:
```js
import productRoutes from './product.routes.js';

// ...
router.use('/products', productRoutes);
```

Your new endpoint is now active at `/api/v1/products`!

---

## 🚢 Deployment Guide

### Deploy to Render
1. Create a new **Web Service** on [Render](https://render.com/).
2. Connect your Git repository.
3. Set the following settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
4. Add your Environment Variables (`NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL`).
5. Set Health Check path to `/api/v1/health`.

### Deploy to Railway
1. Click **New Project** -> **Deploy from GitHub repo** on [Railway](https://railway.app/).
2. Add a **MongoDB Plugin** or configure your MongoDB Atlas connection in Railway variables.
3. Configure your Environment Variables in the project settings.
4. Railway will automatically detect `package.json` and start via `npm start`.

### Deploy to VPS (PM2 + Nginx)
1. **Clone repo on server:**
   ```bash
   git clone <YOUR_REPO_URL> /var/www/api
   cd /var/www/api
   npm install --omit=dev
   cp .env.example .env && nano .env
   ```
2. **Start with PM2:**
   ```bash
   npm install -g pm2
   pm2 start src/server.js --name "mern-backend"
   pm2 save
   pm2 startup
   ```
3. **Nginx Reverse Proxy configuration (`/etc/nginx/sites-available/api`):**
   ```nginx
   server {
       server_name api.yourdomain.com;

       location / {
           proxy_pass http://127.0.0.1:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
4. Obtain free SSL certificates with **Certbot**:
   ```bash
   sudo certbot --nginx -d api.yourdomain.com
   ```

---

## 📜 License
MIT License. Free to use, adapt, and distribute for personal and commercial projects.
