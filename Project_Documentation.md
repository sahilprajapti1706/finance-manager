# FinancePanel: Elite Administrative Dashboard

A high-performance, data-dense financial management system designed for precision, security, and elite analytical depth.

---

## 🏗️ Core Architecture
The system is built on a **Full-Stack Node.js/React** architecture, utilizing a robust PostgreSQL database to handle high volumes of financial transaction and user management data.

### **Technical Stack**
*   **Frontend**: React.js with Vite, Tailwind CSS (Custom Premium UI/UX), Lucide-Icons, and Recharts for advanced visualization.
*   **Backend**: Node.js with Express, JWT-based Authentication, and RESTful API endpoints.
*   **Database**: PostgreSQL with `pg-pool` for efficient query handling.
*   **Security**: Bcryptjs for password hashing (12 rounds) and Role-Based Access Control (RBAC).

---

## 🔐 Authentication & Access Control (RBAC)
The platform implements a multi-tier authorization system ensuring data integrity and account security.

### **User Roles**
1.  **Viewer**: Can view the dashboard and see financial records but cannot create, edit, or delete data.
2.  **Analyst**: Full access to financial records—can add, edit, and delete entries. Accesses analytical charts and health metrics.
3.  **Admin (Super User)**: Complete system authority, including administrative user management (role/status changes) and system-wide settings.

### **New: Sign-Up Flow**
*   **Default Analyst Role**: Every new registrant is automatically assigned the **Analyst** role.
*   **Immutable Root Admin**: The primary system account (`admin@example.com`) is strictly protected from role/status modifications to prevent system lockouts.

---

## 📊 Dashboard & Elite Analytics
Designed for maximum density and high-level decision-making without unnecessary scrolling.

### **1. 12-Month Wavy Trend Chart**
*   **Interactivity**: Switch between "Income", "Expense", or "Both" views using dedicated tab filters.
*   **Visual Data**: Displays a 12-month trajectory with realistic synthetic datasets (April 2025 – April 2026).
*   **Precision Tooltips**: Shows exact transaction totals on hover.

### **2. Category Breakdown (Elite Pie)**
*   **Visual**: A high-impact, solid pie chart (110px radius) highlighting fiscal distribution.
*   **Dynamic Hover**: Minimalism-focused; detailed category names and percentage distributions appear only on hover to maintain a clean aesthetic.

### **3. Live Financial Health Metric**
*   **Dynamic Logic**: A real-time score representing the ratio of **Net Balance** to **Total Income**.
*   **Contextual Advice**: The "Growth Strategy" section changes its feedback based on the current health score (e.g., suggesting investment vs. emergency budgeting).

---

## 📑 Financial Records Management
A centralized repository for all transactions with integrated export and management capabilities.

### **Key Features**
*   **Permanent Actions**: 'Edit' and 'Delete' controls are always visible on the table, enabling rapid management without hover delays.
*   **Advanced Filtering**: Filter entries by Category (Search), Type (Income/Expense), or custom Date ranges.
*   **Export Capability**: Generate instant professional **PDF Statements** or **CSV Data Dumps** for offline audit.
*   **RBAC Protected**: Mutation buttons (Add/Edit/Delete) are automatically hidden for 'Viewer' accounts.

---

## 👥 User & Staff Management
Exclusive to the **Administrator** role, providing complete control over system access.

### **Key Features**
*   **Direct Onboarding (Add User)**: Admins can manually create staff accounts (Viewers/Analysts) with custom roles and initial credentials.
*   **Status Toggles**: Instantly deactivate or activate system accounts.
*   **Locked Primary Admin**: Enforced immutability for the root administrator account to guarantee system stability and root-access continuity.

---

## 🌐 Real-Time Notification System
Keeps users informed of critical account and system changes.
*   **Contextual Alerts**: Direct alerts for role updates, account status changes, and new financial records.
*   **Polling-to-Pulse**: High-frequency notification checking (30s polling) ensures users are never out of the loop.

---

## 💾 Data Persistence & Initialization
The system ensures a rich, interactive experience out-of-the-box through a comprehensive initialization script.

*   **init.sql**: Handles idempotent database creation, including roles, user types, and a **100+ entry synthetic dataset** to create the signature "Wavy" trend chart on first launch.
*   **Category Logic**: Smart category categorization including "Other" overrides for non-standard transactions.

