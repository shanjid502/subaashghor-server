# 🚀 Subaashghor Backend API Server

A production-ready, domain-driven **Express + TypeScript** backend built with a modular architecture for high-performance fragrance e-commerce.

---

## 🛠️ Architecture & Core Logic Flow

This server utilizes a domain-driven modular structure located in `src/app/modules/`. Each module encapsulates its interfaces, Mongoose schemas, validators, routes, controllers, and services.

### 1. Authentication & OTP Flow
*   **Phone-centric Accounts:** Users register using their Bangladeshi phone numbers. Email is optional and protected by a sparse, unique database index to support passwordless signups.
*   **Dynamic OTP Verification:** Requests to `/phone/request-otp` generate a code valid for 5 minutes.
    *   *Production:* Codes are cryptographically secure 6-digit random integers.
    *   *Development:* Falls back to `'1234'` for easy local mocking.
*   **Auto-Account Provisioning:** Verifying an OTP code on an unregistered number automatically provisions a new customer account in the database.
*   **OTP Password Reset:** Forgot-password requests via phone generate an OTP token of purpose `'reset-password'`, allowing users to securely reset their accounts without email access.
*   **Rate Limiting Protection:** All auth endpoints are gated by `authRateLimiter` allowing a maximum of 5 requests per 15-minute window per IP.

### 2. Products & Collections Management
*   **ReDoS protection:** All text search queries (`q`) are sanitized to escape regex control characters before querying MongoDB.
*   **Stock Tracking & Pricing:** Products support multiple sizes (e.g., 3ml, 6ml, 12ml). Pricing checks look up active promotional `salePrice` before falling back to default `price`.

### 3. Order Processing & Stock Integrity
*   **Atomic Stock Allocation:** During checkout, product size inventory is decremented atomically.
*   **Stock Rollback on Failure:** If any item validation in the order array fails mid-process, the server triggers an automated rollback to re-increment and restore the inventory of all successfully reserved items.
*   **Pricing Safeguards:** Order totals are calculated as `subtotal + shippingFee - discount` but are clamped to a minimum of `0` to prevent negative totals.
*   **Shipping Logic:** Orders matching or exceeding `3,000 BDT` receive free shipping, otherwise a flat `130 BDT` shipping fee is applied.
*   **Secure Guest Order Lookup:** To view order details for non-registered/guest checkouts, the requester must supply a matching phone number in the query parameter to prevent enumeration.

---

## 📡 API Endpoints Documentation

All requests are prefixed with `http://localhost:5000/api/v1`.

### 🔑 Authentication (`/auth`)

#### 1. Request OTP Code
`POST /auth/phone/request-otp`
*   **Body:**
    ```json
    {
      "phone": "01712345678",
      "purpose": "login" // or "signup", "verify", "reset-password"
    }
    ```
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "OTP sent to mobile successfully",
      "data": {
        "sent": true,
        "expiresInSec": 300,
        "resendInSec": 60
      }
    }
    ```

#### 2. Verify OTP & Log In
`POST /auth/phone/verify-otp`
*   **Body:**
    ```json
    {
      "phone": "01712345678",
      "code": "1234",
      "purpose": "login"
    }
    ```
*   **Response (200 OK):** Sets the HTTP-only cookie `sg_session` and returns:
    ```json
    {
      "success": true,
      "message": "Phone verified and logged in successfully",
      "data": {
        "name": "User 5678",
        "phone": "01712345678",
        "role": "customer",
        "phoneVerified": true
      }
    }
    ```

#### 3. Signup with Optional Email
`POST /auth/signup`
*   **Body:**
    ```json
    {
      "name": "Jane Doe",
      "phone": "01812345678",
      "email": "jane@example.com",
      "password": "securepassword1"
    }
    ```

#### 4. Login via Password
`POST /auth/login`
*   **Body:**
    ```json
    {
      "phone": "01712345678", // or "email"
      "password": "securepassword1"
    }
    ```

#### 5. Forgot Password (OTP Generation)
`POST /auth/forgot-password`
*   **Body:**
    ```json
    {
      "phone": "01712345678" // or "email"
    }
    ```

#### 6. Reset Password with OTP Code
`POST /auth/reset-password`
*   **Body:**
    ```json
    {
      "phone": "01712345678",
      "code": "1234",
      "password": "myNewPassword789"
    }
    ```

---

### 📦 Products & Collections (`/products`, `/collections`)

#### 1. Get All Products (Filtered & Paginated)
`GET /products`
*   **Query Params:**
    *   `page`: Page number (default `1`)
    *   `limit`: Page size (default `100`)
    *   `category`: `men`, `women`, `attar`, `unisex`
    *   `minPrice`, `maxPrice`
    *   `q`: Search query string (escaped against ReDoS)
    *   `sort`: `newest`, `price-asc`, `price-desc`, `popular`
*   **Response:** List of products matching the criteria.

#### 2. Get Featured Products
`GET /products/featured`

#### 3. Create Product (Admin Only)
`POST /products`
*   **Headers:** `Authorization: Bearer <JWT>`
*   **Body:**
    ```json
    {
      "name": { "en": "Rose Imperial", "bn": "রোজ ইম্পেরিয়াল" },
      "tagline": { "en": "Majestic rose blend", "bn": "রাজকীয় গোলাপ সুবাস" },
      "price": 1800,
      "category": "unisex",
      "images": ["https://res.cloudinary.com/image.jpg"],
      "sizes": [
        { "ml": 6, "price": 950, "stock": 45 },
        { "ml": 12, "price": 1800, "stock": 20 }
      ],
      "notes": { "top": ["Rose"], "heart": ["Vanilla"], "base": ["Amber"] }
    }
    ```

---

### 🛒 Orders (`/orders`)

#### 1. Place Order
`POST /orders`
*   **Body:**
    ```json
    {
      "items": [
        { "productId": "64b0f9c2d1b827e8a93d7c54", "ml": 6, "qty": 1 }
      ],
      "shipping": {
        "name": "Jane Doe",
        "phone": "01711223344",
        "address": "House 12, Road 4",
        "area": "Banani",
        "city": "Dhaka",
        "district": "Dhaka"
      },
      "paymentMethod": "cod",
      "couponCode": "EID20"
    }
    ```

#### 2. Get Guest or Authenticated Order Details
`GET /orders/:idOrNumber`
*   *For guests, you must supply the phone number matching shipping information:*
    `GET /orders/SG-482910?phone=01711223344`

---

### 🎫 Coupons & Testimonials (`/coupons`, `/reviews`)

#### 1. Validate Coupon
`POST /coupons/validate`
*   **Body:**
    ```json
    {
      "code": "WELCOME10",
      "subtotal": 1200
    }
    ```

#### 2. Submit Review
`POST /reviews`
*   **Body:**
    ```json
    {
      "productId": "64b0f9c2d1b827e8a93d7c54",
      "rating": 5,
      "comment": "Perfect notes, lasts all day."
    }
    ```

---

## 🚀 Getting Started Locally

### Install Dependencies
```bash
npm install
```

### Start Development Server
```bash
cem dev
```
Server runs at `http://localhost:5000`. You can test all routes instantly using the generated Postman Collection file `subaashghor_api_postman_collection.json`.
