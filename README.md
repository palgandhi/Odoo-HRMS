# Dayflow HRMS

Dayflow is a headless Human Resource Management System validating the power of separating Odoo's robust backend from its traditional frontend. Built with **React** and **Odoo 17**, it delivers a modern, high-performance interface for managing complex HR workflows.

![Status](https://img.shields.io/badge/Production-Ready-green)
![Stack](https://img.shields.io/badge/React-Odoo%2017-blue)

## Overview

Traditional ERP interfaces often suffer from strict templating systems. Dayflow bypasses this by leveraging Odoo purely as an API engine (JSON-RPC), allowing for a completely custom User Experience designed for speed and clarity.

Key differences from standard Odoo:
*   **Zero Page Reloads:** Single Page Application (SPA) architecture.
*   **Simplified Workflows:** Custom approval logic tailored for high-velocity teams.
*   **Role-Aware UI:** Interfaces morph based on `base.group_user` vs `base.group_system` permissions.

## Core Modules

### 👥 Employee Directory & RBAC
Centralized profile management with strict hierarchy. Authenticated session handling connects physical employee records to system users seamlessly.

### 📍 Smart Attendance
Geofence-ready check-in system with real-time status boards. Supports timezone normalization across distributed teams.

### 📅 Leave Management
Dual-view interface for requests and approvals.
*   **Employees:** Visual date pickers and status tracking.
*   **Managers:** Batch approval queues.

### 📈 Performance Reviews
Custom module (`dayflow_performance`) extending standard HR capabilities. Features customizable review cycles, 5-point grading scales, and feedback loops.

### 💰 Payroll
Integrated payslip generation and history. Provides secure, private access for employees to view financial records.

## Architecture

*   **Frontend:** Vite, React 18, TypeScript, TailwindCSS.
*   **Backend:** Odoo 17 Community Edition (Python).
*   **Database:** PostgreSQL 15+.
*   **Protocol:** JSON-RPC over HTTP.

## Development

The project includes a unified launcher for the full stack.

```bash
# Starts PostgreSQL, Odoo Backend (8069), and React Frontend (5173)
./dev.sh
```

For direct database interaction via the Odoo shell:

```bash
./shell.sh
```

## License

MIT
