# Finance Dashboard Backend

A modular, secure, and performant backend system for financial data processing and access control. Built with **Node.js**, **Express**, **TypeScript**, and **PostgreSQL (Neon DB)**.

## 🏗️ Architecture Detail

The application follows a strict layered architecture to ensure separation of concerns and maximum maintainability:

1.  **Routes Layer (`src/routes/`)**: Defines the API endpoints and mounts the middleware chain (Auth, RBAC, Validation).
2.  **Middleware Layer (`src/middleware/`)**: 
    -   `auth.ts`: Verifies JWT access tokens and handles expiration.
    -   `rbac.ts`: Enforces role-based permissions (Viewer, Analyst, Admin).
    -   `validate.ts`: Validates request bodies/queries using Zod schemas.
3.  **Controller Layer (`src/controllers/`)**: Parses incoming requests, extracts parameters, and delegates to the appropriate service.
4.  **Service Layer (`src/services/`)**: Contains all business logic and executes **raw SQL queries** using the `pg` pool.
5.  **Data Layer (`src/db/`)**: Handles schema initialization (`init.sql`) and database bootstrapping.

## 🛡️ Access Control & RBAC

| Role | Permissions |
| :--- | :--- |
| **Viewer** | Read-only access to financial records and their profiles. |
| **Analyst** | All Viewer permissions + Access to all Dashboard Analytics and Trends. |
| **Admin** | Full Management Access: Create/Update/Delete records and Manage all Users/Roles. |

## 🚀 Key Features Implemented

-   **JWT Auth with Rotation**: Secure login using access tokens and hashed refresh tokens stored in the DB.
-   **Dashboard Analytics**: Advanced SQL aggregation for total income, expenses, net balance, category breakdown, and 12-month trends.
-   **Record Management**: Full CRUD with soft-delete functionality and powerful filtering (type, category, date range).
-   **Security**: 
    -   **Rate Limiting**: Global and Auth-specific guards (using `express-rate-limit`).
    -   **Helmet**: Security-focused HTTP headers.
    -   **CORS**: Configured for safe frontend interaction.
-   **Error Handling**: Standardized JSON error responses and specific handling for Postgres unique constraint violations.

## 🛠️ Setup & Installation

1.  **Environment**: Copy `.env.example` to `.env` and provide your Neon PostgreSQL credentials and JWT secrets.
2.  **Install Dependencies**: `npm install`
3.  **Database Sync**: `npm run db:sync` (Initializes the schema on Neon).
4.  **Seed Data**: `npm run seed` (Populates demo users and 60 transactions).
5.  **Run Development**: `npm run dev`

## 📊 API Endpoints (Core)

### Auth (`/api/auth`)
-   `POST /register`: Create a new account (First user becomes Admin).
-   `POST /login`: Generate session tokens.
-   `GET /me`: Get current user profile (Private).
-   `POST /refresh`: Rotate access tokens using a refresh token.

### Records (`/api/records`)
-   `GET /`: List records with pagination and filters (Viewer+).
-   `POST /`: Add a new entry (Admin).
-   `PATCH /:id`: Edit an entry (Admin).
-   `DELETE /:id`: Soft delete an entry (Admin).

### Dashboard (`/api/dashboard`)
-   `GET /summary`: Top-level balances (Analyst+).
-   `GET /monthly-trends`: 12-month area chart data (Analyst+).
-   `GET /category-totals`: Pie chart breakdown (Analyst+).

---

Developed for system assessment.
