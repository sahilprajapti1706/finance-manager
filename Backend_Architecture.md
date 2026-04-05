# FinancePanel: Backend Architecture & Technical Guide

This document provides a deep-dive into the server-side architecture of the FinancePanel Administrative Suite—a high-performance, secure, and scalable Node.js environment.

---

## 🏗️ Architectural Pattern
The backend adheres to a **Strict Layered Architecture** (Service-Controller-Router), ensuring a clean separation of concerns and maximum maintainability.

1.  **Routers**: Entry points for HTTP requests. Handles URL mapping and applies global/route-specific middleware (Authentication, Role-Based Access, Validation).
2.  **Controllers**: Orchestrators. They parse request data, call appropriate services, and manage HTTP responses using standardized JSON formats.
3.  **Services**: Core Business Logic. This layer interacts with the database (`Pool`) and external utilities (JWT, Bcrypt). Services are entirely decoupled from the HTTP context.
4.  **Database Library**: A dedicated `pool` configuration for PostgreSQL, supporting high-concurrency connection pooling.

---

## 🛠️ Technical Stack
*   **Runtime**: Node.js (TypeScript-powered)
*   **Framework**: Express.js
*   **Database**: PostgreSQL
*   **Auth**: JWT (JSON Web Tokens) with Access/Refresh token rotation and SHA-256 Hashing.
*   **Encryption**: Bcryptjs (12-round salt) for data-at-rest security.
*   **Validation**: Zod/Custom Schema validation for every incoming request body/query.

---

## 📂 Directory Structure Highlights
*   `src/index.ts`: Application entry point. Configures global rate limiters, CORS, and centralized error handling.
*   `src/routes/`: Route definitions for `auth`, `records`, `users`, and `notifications`.
*   `src/controllers/`: Request handlers that bridge routers and services.
*   `src/services/`: The brain of the application. Contains transaction logic, data processing, and user management checks.
*   `src/middleware/`: 
    *   `auth.ts`: Validates JWT Access Tokens.
    *   `rbac.ts`: Enforces Role-Based Access (Admin/Analyst/Viewer).
    *   `error.ts`: Centralizes server-side error capturing and logging.
*   `src/db/init.sql`: The primary source of truth for the database schema and 12-month wavy seed data.

---

## 🔐 Security & Identity Management
### **1. Access Control**
A granular **Owner/Admin/Role** security policy is enforced across all endpoints:
*   **Public Access**: `/api/auth/login`, `/api/auth/register`.
*   **Administrative Access**: `/api/users/*`.
*   **Staff Access**: `/api/records/*` (Mutations for Admins/Analysts only).

### **2. Account Immutability**
To prevent critical system failure, the **Primary Administrator Account** (`admin@example.com`) is hard-coded into the service layer as immutable. Any attempt to modify its role or deactivate it is blocked at the code level.

---

## 📡 Core API Endpoints
### **Authentication**
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| POST | `/api/auth/register` | Public | Self-registration (Defaults to Analyst role). |
| POST | `/api/auth/login` | Public | Generates Access & Refresh tokens. |
| POST | `/api/auth/logout` | Public | Revokes refresh tokens. |

### **Financial Records**
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| GET | `/api/records` | Staff | Returns paginated, filtered transaction data. |
| POST | `/api/records` | Staff+ | Creates a new entry (Income/Expense). |
| PATCH | `/api/records/:id`| Staff+ | Modifies an existing financial record. |
| DELETE | `/api/records/:id`| Staff+ | Removes a record from the ledger. |

### **User Management**
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| GET | `/api/users` | Admin | Lists all system accounts. |
| POST | `/api/users` | Admin | Direct staff onboarding with role assignment. |
| PATCH | `/api/users/:id` | Admin | Modifies account role or system status. |

---

## 🔄 Live Notification Engine
The backend implements a **Push-to-Pulse** notification service. When a critical event occurs (Role change, Record creation), a record is inserted into the `notifications` table. The frontend polls this every 30s to provide real-time feedback without the overhead of heavy socket connections for lightweight administrative work.

---

## 📊 Database Schema Summary
*   `users`: Stores identity, bcrypt hashes, roles, and status.
*   `financial_records`: Stores transactions, precise amounts (`NUMERIC`), category indices, and audit notes.
*   `notifications`: Stores user-specific alerts, categorized by type (`success`, `warning`, `info`).
*   `refresh_tokens`: Manages persistent sessions and token rotation hashes.

