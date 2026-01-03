# Dayflow HRMS

**Enterprise-Grade HR Management System built on Odoo 17 & React.**

Dayflow is a modern, headless HRMS that provides a beautiful, high-performance frontend for Odoo's powerful HR backend. It features Role-Based Access Control (RBAC), real-time attendance, leave workflows, and performance reviews.

![Status](https://img.shields.io/badge/Status-Production%20Ready-green)
![Stack](https://img.shields.io/badge/Stack-React%20%7C%20Odoo%20%7C%20Tailwind-blue)

## 🚀 Features

### 1. Dashboard
*   **Real-time Stats:** Overview of company health.
*   **Activity Feed:** Live updates on HR events.

### 2. Employee Directory
*   **RBAC Protected:**
    *   **Admins:** View/Edit all employee profiles. Grant system access (create users).
    *   **Employees:** View only their own personal "Contact Card".
*   **Onboarding:** Streamlined flow to link Employee Records to Odoo User Accounts.

### 3. Smart Attendance
*   **Geofenced/IP-restricted Check-in** (Configurable).
*   **Manager View:** Live status board of who is IN/OUT.
*   **Employee View:** One-tap Check-in with live duration timer.
*   **Timezone Aware:** Automatically handles Odoo's UTC storage vs Local Time.

### 4. Leave Management
*   **Approval Workflow:**
    *   **Employees:** Submit requests with date ranges and types.
    *   **Managers:** dedicated "Approvals" queue to Approve/Refuse requests.
*   **History:** Complete audit log of leave history.

### 5. Performance Reviews
*   **Custom Module:** Built on `hr.performance.review`.
*   **Cycle Management:** Managers create review cycles (Q1, Q2, etc.).
*   **Grading System:** 5-Star rating system with qualitative feedback.
*   **Transparency:** Employees view finalized reviews instantly.

### 6. Payroll Management
*   **Payslip Generation:** Admins generate slips linked to Employee records.
*   **Status Tracking:** Track Draft vs Paid status.
*   **Employee Access:** Secure access for employees to view their own salary history and net pay.

---

## 🛠️ Technical Architecture

*   **Frontend:** React 18, TypeScript, TailwindCSS, Lucide Icons, Framer Motion.
*   **Backend:** Odoo 17 Community (Python).
*   **Protocol:** JSON-RPC.
*   **State Management:** Local React State + Odoo Session handling.

## 📦 Installation

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full production deployment instructions.

## 🏃‍♂️ Quick Start (Development)

1.  **Start the Full Stack:**
    ```bash
    ./start-full.sh
    ```
    This script launches PostgreSQL, Odoo Backend (Port 8069), and React Frontend (Port 5173).

2.  **Access:**
    *   Frontend: `http://localhost:5173`
    *   Backend: `http://localhost:8069`

3.  **Credentials:**
    *   Default Admin: `admin` / `admin`

4.  **Developer Console:**
    Access the Odoo environment directly for debugging:
    ```bash
    ./shell.sh
    ```
    *Useful for direct DB queries using Odoo ORM syntax.*
