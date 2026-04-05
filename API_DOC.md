# FinancePanel: REST API Reference Guide

This document specifies every available API endpoint, including the expected request payloads and response structures.

---

## 🔐 1. Authentication (Auth)
The core of system identity management. All protected routes require a `Bearer <AccessToken>` header.

### **POST /api/auth/register** (Public)
Register a new Analyst account.
*   **Request Body**:
    ```json
    { "name": "John Doe", "email": "john@example.com", "password": "SecretPassword123" }
    ```
*   **Response (201)**:
    ```json
    { "status": "success", "data": { "id": "uuid", "name": "John Doe", "email": "john@example.com", "role": "analyst" } }
    ```

### **POST /api/auth/login** (Public)
Sign in and generate session tokens.
*   **Request Body**:
    ```json
    { "email": "admin@example.com", "password": "••••••••" }
    ```
*   **Response (200)**:
    ```json
    {
      "status": "success",
      "data": {
        "user": { "id": "uuid", "name": "Admin", "email": "admin@example.com", "role": "admin" },
        "accessToken": "ey...",
        "refreshToken": "ey..."
      }
    }
    ```

---

## 📈 2. Financial Records
Centralized ledger management for transactions.

### **GET /api/records** (Analyst/Admin)
List paginated, filtered transactions.
*   **Query Params**: `page`, `limit`, `category`, `type` (income/expense), `startDate`, `endDate`.
*   **Response (200)**:
    ```json
    {
      "status": "success",
      "data": {
        "records": [{ "id": "uuid", "category": "Salary", "amount": 220037.5, "type": "income", "date": "2026-04-05" }],
        "total": 124, "page": 1, "limit": 10
      }
    }
    ```

### **POST /api/records** (Analyst/Admin)
Create a new financial entry.
*   **Request Body**:
    ```json
    { "amount": 54000, "type": "expense", "category": "Rent", "date": "2026-04-05", "notes": "Apt Rent" }
    ```
*   **Response (201)**:
    ```json
    { "status": "success", "data": { "id": "uuid", ... } }
    ```

---

## 👥 3. User Management (Admin Only)
Requires administrative privileges for all endpoints.

### **GET /api/users**
List all system accounts.
*   **Query Params**: `page`, `limit`, `search`.
*   **Response (200)**:
    ```json
    {
      "status": "success",
      "data": { 
        "users": [{ "id": "uuid", "name": "Staff 1", "email": "staff@ex.com", "role": "analyst", "status": "active" }],
        "total": 8
      }
    }
    ```

### **POST /api/users**
Manually onboarding staff.
*   **Request Body**:
    ```json
    { "name": "New Analyst", "email": "analyst@ex.com", "password": "StaffPassword99", "role": "analyst" }
    ```
*   **Response (201)**:
    ```json
    { "status": "success", "message": "User created successfully", "data": { "user": { ... } } }
    ```

### **PATCH /api/users/:id**
Update an account's role or system status.
*   **Request Body**:
    ```json
    { "role": "admin", "status": "inactive" }
    ```
*   **Response (200)**:
    ```json
    { "status": "success", "message": "User updated successfully" }
    ```

---

## 🔔 4. Notifications
Retrieve unread alerts for the authenticated user.

### **GET /api/notifications** (All Roles)
*   **Response (200)**:
    ```json
    {
      "status": "success",
      "data": [
        { "id": "uuid", "message": "Your role updated to ADMIN.", "type": "info", "is_read": false, "created_at": "..." }
      ]
    }
    ```

---

## 🛠 Standard Response Format
Unless otherwise specified, all responses follow this pattern:
```json
{
  "status": "success" | "error",
  "message": "Human readable description",
  "data": { ... } // Optional payload
}
```

