# How to Run Dayflow HRMS

## Quick Start (3 Steps)

### Step 1: Start PostgreSQL
```bash
brew services start postgresql@15
```

### Step 2: Start Odoo Server
```bash
cd ~/odoo
python3 odoo-bin --addons-path=addons,/Users/palgandhi/Desktop/Odoo/custom_addons -d dayflow_db --http-port=8069
```

### Step 3: Open Browser
Go to: **http://localhost:8069**

---

## First Time Setup

When you open http://localhost:8069 for the first time:

1. **Create Database** (if prompted):
   - Master Password: `admin` (or leave default)
   - Database Name: `dayflow_db`
   - Email: `admin@dayflow.com`
   - Password: `admin`
   - Language: English
   - Country: India (or your country)
   - Click **Create Database**

2. **Install Dayflow HRMS**:
   - After login, go to **Apps** menu
   - Search for **"Dayflow HRMS"**
   - Click **Install**
   - Wait for installation to complete

3. **Start Using**:
   - Click on **Dayflow HRMS** in the main menu
   - You'll see: Employees, Attendance, Leave Management, Performance

---

## Daily Usage

### To Start the Server:
```bash
# Terminal 1: Make sure PostgreSQL is running
brew services start postgresql@15

# Terminal 2: Start Odoo
cd ~/odoo
python3 odoo-bin --addons-path=addons,/Users/palgandhi/Desktop/Odoo/custom_addons -d dayflow_db
```

Then open: **http://localhost:8069**

### To Stop the Server:
Press `Ctrl+C` in the terminal where Odoo is running

---

## Troubleshooting

### Server won't start?
```bash
# Check if PostgreSQL is running
brew services list | grep postgresql

# If not running, start it
brew services start postgresql@15
```

### Port 8069 already in use?
```bash
# Use a different port
python3 odoo-bin --addons-path=addons,/Users/palgandhi/Desktop/Odoo/custom_addons -d dayflow_db --http-port=8070
```
Then open: http://localhost:8070

### Database issues?
```bash
# Drop and recreate database
/opt/homebrew/opt/postgresql@15/bin/dropdb dayflow_db
/opt/homebrew/opt/postgresql@15/bin/createdb dayflow_db
```

---

## Development Mode

For development with auto-reload:
```bash
cd ~/odoo
python3 odoo-bin --addons-path=addons,/Users/palgandhi/Desktop/Odoo/custom_addons \
    -d dayflow_db --dev=all
```

---

## Module Updates

After making changes to the code:
```bash
cd ~/odoo
python3 odoo-bin --addons-path=addons,/Users/palgandhi/Desktop/Odoo/custom_addons \
    -d dayflow_db -u dayflow_hrms
```

---

## Quick Reference

| Action | Command |
|--------|---------|
| Start PostgreSQL | `brew services start postgresql@15` |
| Stop PostgreSQL | `brew services stop postgresql@15` |
| Start Odoo | `cd ~/odoo && python3 odoo-bin --addons-path=addons,/Users/palgandhi/Desktop/Odoo/custom_addons -d dayflow_db` |
| Access System | http://localhost:8069 |
| Default Login | admin@dayflow.com / admin |

---

## Features Available

Once logged in, you can:

### 1. Employee Management
- Add new employees
- View employee details
- Track employment status
- Manage departments

### 2. Attendance Tracking
- Mark check-in/check-out
- View attendance reports
- Track late arrivals
- Calculate overtime

### 3. Leave Management
- Apply for leaves
- Approve/reject leaves
- Track leave balance
- View leave history

### 4. Performance Reviews
- Create performance reviews
- Set goals for employees
- Track progress
- Generate reports

---

## Demo Data

To create demo data for testing:

1. Go to **Dayflow HRMS → Employees**
2. Click **Create** and add 5-10 employees
3. Go to **Attendance** and mark some attendance
4. Go to **Leave Management** and create leave requests
5. Go to **Performance** and create reviews

---

## For Hackathon Presentation

1. **Start the server** (as shown above)
2. **Login** to the system
3. **Show each module**:
   - Employees list
   - Attendance tracking
   - Leave requests
   - Performance reviews
4. **Demonstrate workflows**:
   - Add an employee
   - Mark attendance
   - Apply for leave
   - Create a performance review

---

## Need Help?

- Check INSTALLATION.md for detailed setup
- Check README.md for project overview
- All code is in `custom_addons/dayflow_hrms/`

---

**You're all set! 🚀**
