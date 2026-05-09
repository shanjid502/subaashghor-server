# Subaashghor Backend Server

This is the backend server for the Subaashghor e-commerce platform, built with Node.js, Express, and MongoDB.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (Local or Atlas)

### Installation

1. Clone the repository
2. Navigate to the server directory:
   ```bash
   cd server
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file based on the `.env.example` (or use the provided `.env`):
   ```env
   PORT=5000
   DATABASE_URL=mongodb://localhost:27017/subaashghor
   JWT_ACCESS_SECRET=your_secret
   ...
   ```

### Running the Server

- **Development Mode**:
  ```bash
  npm run start:dev
  ```
- **Production Build**:
  ```bash
  npm run build
  npm start
  ```

---

## 📚 API Documentation

The server uses **Swagger** for interactive API documentation. Once the server is running, you can access it at:

👉 [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

---

## 🛠 Core API Endpoints

Below are some of the most common endpoints. All base URLs start with `/api/v1`.

### Authentication (`/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Register a new user |
| POST | `/auth/login` | Login and receive a JWT |
| POST | `/auth/logout` | Clear session/cookies |
| GET | `/auth/me` | Get current logged-in user details |

### Products (`/products`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | List all products (supports search/filters) |
| GET | `/products/featured` | Get featured products |
| GET | `/products/:slug` | Get single product details |
| POST | `/products` | Create product (Admin only) |

### Orders (`/orders`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/orders` | Place a new order |
| GET | `/orders/mine` | View user's order history |
| GET | `/orders/:id` | View specific order details |

---

## 🧪 Testing the APIs

### 1. Swagger UI (Recommended)
Open [http://localhost:5000/api-docs](http://localhost:5000/api-docs) in your browser. You can click "Try it out" on any endpoint to send requests directly from the browser.

### 2. Postman / Thunder Client
- **Base URL**: `http://localhost:5000/api/v1`
- **Authentication**: For protected routes, include the JWT token in the header:
  `Authorization: Bearer <your_token>`

### 3. Manual Testing via cURL
Example login:
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "user@example.com", "password": "password123"}'
```

---

## 🏗 Project Structure

```text
src/
├── app/
│   ├── modules/       # Feature-based modules (Auth, Product, Order, etc.)
│   ├── middlewares/   # Global and route-specific middlewares
│   ├── routes/        # Main router aggregation
│   ├── config/        # Environment configuration
│   └── utils/         # Helper functions and swagger setup
├── server.ts          # Entry point (Server listener)
└── app.ts             # Express app configuration
```

---

## 🛡️ Build Guard

This project uses a custom build guard to enforce architectural standards (e.g., file naming conventions). If your build fails, check the console output for "ARCHITECTURE VIOLATION" messages.

- **Rule**: All files in a module folder must start with the lowercase module name (e.g., `src/app/modules/User/user.service.ts`).
