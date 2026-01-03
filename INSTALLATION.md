# Installation Guide

## Prerequisites

- Python 3.11+
- PostgreSQL
- Git

## Setup

### 1. Install Odoo 17

```bash
# Clone Odoo
git clone https://github.com/odoo/odoo --depth 1 --branch 17.0
cd odoo

# Install Python dependencies
pip3 install -r requirements.txt
```

### 2. Setup PostgreSQL

```bash
# Start PostgreSQL
# macOS:
brew services start postgresql

# Ubuntu/Debian:
sudo service postgresql start

# Create database user (if needed)
createuser -s $USER
```

### 3. Run Odoo with Dayflow HRMS

```bash
# From the odoo directory
python3 odoo-bin --addons-path=addons,/path/to/Odoo-HRMS/custom_addons \
    -d dayflow_db -i dayflow_hrms
```

Replace `/path/to/Odoo-HRMS` with your actual project path.

### 4. Access the System

Open browser: `http://localhost:8069`

Default credentials:
- Email: admin
- Password: admin

## Docker Installation (Alternative)

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
  db:
    image: postgres:15
    environment:
      - POSTGRES_PASSWORD=odoo

# Run
docker-compose up -d
```

## Updating the Module

After code changes:

```bash
python3 odoo-bin --addons-path=addons,/path/to/custom_addons \
    -d dayflow_db -u dayflow_hrms
```

## Troubleshooting

**Module not showing:**
- Go to Apps → Update Apps List
- Search for "Dayflow HRMS"

**Database errors:**
```bash
dropdb dayflow_db
createdb dayflow_db
```

**Permission errors:**
```bash
chmod -R 755 custom_addons
```
