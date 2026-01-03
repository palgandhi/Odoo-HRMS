# Dayflow HRMS - Deployment Guide

This repository contains a full-stack HRMS application consisting of a **React Frontend** and a custom **Odoo Backend Module**.

## System Architecture

*   **Frontend:** React (Vite) + Tailwind CSS + Framer Motion.
*   **Backend:** Odoo 17 (Python) + PostgreSQL.
*   **Communication:** JSON-RPC (via HTTP Proxy).
*   **Authentication:** Odoo Session-based Auth (uid, password/key).
*   **RBAC:** Odoo Groups mapped to Frontend States (`base.group_system` = Admin).

---

## 1. Backend Deployment (Odoo)

The project relies on a custom Odoo module named `dayflow_performance` to handle performance reviews. 

### Prerequisites
*   Odoo 17 installed and running.
*   PostgreSQL running.
*   Odoo configured with a database (e.g., `dayflow_db`).

### Installation Steps

1.  **Locate Addons Folder:**
    Copy the `custom_addons/dayflow_performance` folder from this project to your Odoo `addons` path.
    
    ```bash
    cp -r ./custom_addons/dayflow_performance /path/to/your/odoo/addons/
    ```

2.  **Restart Odoo:**
    Restart the Odoo server to load the new manifest.
    
    ```bash
    ./odoo-bin -u all -d dayflow_db
    ```

3.  **Install Module:**
    *   Log in to Odoo as Admin.
    *   Activate **Developer Mode** (Settings -> Scroll down -> Activate Developer Mode).
    *   Go to **Apps**.
    *   Click **Using the menu "Update Apps List"**.
    *   Search for `Dayflow Performance`.
    *   Click **Activate** / **Install**.

4.  **Verify Model:**
    Go to **Settings -> Technical -> Database Structure -> Models** and verify `hr.performance.review` exists.

---

## 2. Frontend Deployment (React)

### Configuration
The frontend connects to Odoo via a proxy. In production, this is usually handled by Nginx/Apache.

**Environment Variables (.env)**
Create a `.env` file for production builds:

```env
VITE_ODOO_DB=dayflow_db
VITE_API_URL=http://your-production-odoo-url.com
```

### Build Process

1.  **Install Dependencies:**
    ```bash
    cd dayflow-frontend
    npm install
    ```

2.  **Build Static Assets:**
    ```bash
    npm run build
    ```
    This will generate a `dist/` folder containing index.html, JS, and CSS files.

3.  **Serve:**
    Serve the `dist` folder using any static host (Vercel, Netlify, Nginx).
    *Note: You must configure a proxy rule to forward `/jsonrpc` calls to your Odoo backend to avoid CORS issues if they are on different domains.*

    **Nginx Example:**
    ```nginx
    location /jsonrpc {
        proxy_pass http://localhost:8069;
    }
    location / {
        root /var/www/dayflow-frontend/dist;
        try_files $uri /index.html;
    }
    ```

## 3. Role-Based Access Control (RBAC)

The application automatically enforces RBAC:

*   **Admins:** Users belonging to the `Administration / Settings` group in Odoo.
*   **Employees:** Standard users.
*   **Managers:** (Future) Users belonging to `HR / Administrator`.

To promote a user to Admin:
1.  Go to Odoo Backend -> Settings -> Users.
2.  Select User.
3.  Set **Administration** to **Settings**.
