# Dayflow HRMS - Installation & Setup Guide

## 📋 Prerequisites

Before installing Dayflow HRMS, ensure you have:

1. **Python 3.11+** installed
2. **PostgreSQL** database server running
3. **Git** for version control
4. **pip** package manager

## 🚀 Quick Start Installation

### Step 1: Install Odoo 17

```bash
# Install system dependencies (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install -y python3-pip python3-dev libxml2-dev libxslt1-dev \
    zlib1g-dev libsasl2-dev libldap2-dev build-essential libssl-dev \
    libffi-dev libmysqlclient-dev libjpeg-dev libpq-dev libjpeg8-dev \
    liblcms2-dev libblas-dev libatlas-base-dev npm

# For macOS
brew install postgresql python@3.11 node
```

### Step 2: Download Odoo 17

```bash
cd ~/
git clone https://www.github.com/odoo/odoo --depth 1 --branch 17.0 --single-branch
cd odoo
```

### Step 3: Install Python Dependencies

```bash
pip3 install -r requirements.txt
```

### Step 4: Setup PostgreSQL

```bash
# Start PostgreSQL
# On Ubuntu/Debian:
sudo service postgresql start

# On macOS:
brew services start postgresql

# Create PostgreSQL user (if not exists)
sudo -u postgres createuser -s $USER
```

### Step 5: Clone Dayflow HRMS Module

```bash
# Navigate to your workspace
cd /Users/palgandhi/Desktop/Odoo

# The module is already in custom_addons/dayflow_hrms
```

### Step 6: Run Odoo with Dayflow HRMS

```bash
# From the Odoo directory
cd ~/odoo

# Run Odoo with custom addons path
python3 odoo-bin --addons-path=addons,/Users/palgandhi/Desktop/Odoo/custom_addons \
    -d dayflow_db -i dayflow_hrms --db-filter=dayflow_db
```

**First-time setup:**
- Database: `dayflow_db`
- Email: `admin@dayflow.com`
- Password: `admin` (change after first login)

### Step 7: Access Dayflow HRMS

Open your browser and navigate to:
```
http://localhost:8069
```

Login with:
- **Email:** admin@dayflow.com
- **Password:** admin

## 📦 Alternative: Docker Installation

```bash
# Create docker-compose.yml
version: '3.1'
services:
  web:
    image: odoo:17.0
    depends_on:
      - db
    ports:
      - "8069:8069"
    volumes:
      - ./custom_addons:/mnt/extra-addons
      - odoo-data:/var/lib/odoo
    environment:
      - HOST=db
      - USER=odoo
      - PASSWORD=odoo
  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=postgres
      - POSTGRES_PASSWORD=odoo
      - POSTGRES_USER=odoo
    volumes:
      - db-data:/var/lib/postgresql/data

volumes:
  odoo-data:
  db-data:

# Run with Docker
docker-compose up -d
```

## 🔧 Configuration

### Enable Developer Mode

1. Go to Settings
2. Scroll to bottom
3. Click "Activate the developer mode"

### Install Required Modules

The following Odoo modules will be automatically installed:
- HR (base module)
- HR Attendance
- HR Holidays (Leave Management)
- HR Payroll
- HR Contract

## 📊 Module Features

### 1. Employee Management
- Navigate to: **Dayflow HRMS → Employees → All Employees**
- Add new employees with extended fields
- Track employment status, joining date, salary

### 2. Attendance Tracking
- Navigate to: **Dayflow HRMS → Attendance → Attendance Tracking**
- Mark check-in/check-out
- View attendance reports with late detection

### 3. Leave Management
- Navigate to: **Dayflow HRMS → Leave Management → Leave Requests**
- Apply for leave with reasons
- Approve/reject leave requests
- Track leave balances

### 4. Payroll Management
- Navigate to: **Dayflow HRMS → Payroll → Payslips**
- Generate payslips based on attendance
- Calculate overtime, bonuses, deductions
- View payroll reports

### 5. Performance Tracking
- Navigate to: **Dayflow HRMS → Performance → Performance Reviews**
- Create performance reviews
- Set and track goals
- Generate performance reports

## 🐛 Troubleshooting

### Module Not Showing Up

```bash
# Update module list
# Go to Apps → Update Apps List
# Search for "Dayflow HRMS" and install
```

### Database Connection Error

```bash
# Check PostgreSQL is running
sudo service postgresql status

# Restart PostgreSQL
sudo service postgresql restart
```

### Permission Errors

```bash
# Fix file permissions
chmod -R 755 /Users/palgandhi/Desktop/Odoo/custom_addons
```

## 📝 Development Mode

To run in development mode with auto-reload:

```bash
python3 odoo-bin --addons-path=addons,/Users/palgandhi/Desktop/Odoo/custom_addons \
    -d dayflow_db --dev=all
```

## 🔄 Updating the Module

After making changes to the code:

1. Restart Odoo server
2. Go to Apps
3. Search for "Dayflow HRMS"
4. Click "Upgrade"

Or via command line:

```bash
python3 odoo-bin --addons-path=addons,/Users/palgandhi/Desktop/Odoo/custom_addons \
    -d dayflow_db -u dayflow_hrms
```

## 📧 Support

For issues or questions:
- GitHub: https://github.com/palgandhi/Odoo-HRMS
- Email: support@dayflow.com

## 🎯 Next Steps

1. Configure company information
2. Add departments
3. Create employee records
4. Set up leave types
5. Configure payroll rules
6. Start using the system!

---

**Built for Odoo Hackathon 2026** 🚀
