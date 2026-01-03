# 🎭 Demo Data Generator

## 📋 Overview

This script generates realistic demo data for **Dayflow HRMS** to showcase all features during your hackathon presentation.

---

## 🎯 What It Creates

### **10 Employees** with realistic profiles:
- Sarah Johnson - Senior Developer (Engineering)
- Michael Chen - Product Manager (Product)
- Emily Rodriguez - UX Designer (Design)
- James Wilson - DevOps Engineer (Engineering)
- Sophia Martinez - HR Manager (Human Resources)
- David Kim - Backend Developer (Engineering)
- Olivia Brown - Marketing Lead (Marketing)
- Daniel Lee - QA Engineer (Engineering)
- Ava Taylor - Sales Manager (Sales)
- Ethan Anderson - Frontend Developer (Engineering)

### **Attendance Records** (Last 7 Days):
- ~90% attendance rate
- Random check-in times (8:00 AM - 9:30 AM)
- Random check-out times (5:00 PM - 7:00 PM)
- Skips weekends automatically

### **Leave Requests**:
- Past approved leaves (60% of employees)
- 3 pending leave requests (for demo notifications)
- Mix of Paid, Sick, and Casual leave types

### **Payroll Records**:
- Monthly payslips for all employees
- Realistic salaries based on role:
  - Product Manager: ₹8,75,000/year
  - Senior Developer: ₹7,90,000/year
  - Sales Manager: ₹8,17,000/year
  - Marketing Lead: ₹7,67,000/year
  - DevOps Engineer: ₹7,50,000/year
  - Backend/Frontend Developer: $87-88,000/year
  - UX Designer: ₹7,08,000/year
  - HR Manager: ₹6,67,000/year
  - QA Engineer: ₹6,25,000/year
- Includes allowances and deductions

### **Performance Reviews**:
- Q4 2025 reviews for 70% of employees
- Ratings between 3.5 - 5.0 stars
- Manager feedback included
- Finalized state

---

## 🚀 Usage

### **Step 1: Ensure Odoo is Running**
```bash
cd /Users/palgandhi/Desktop/Odoo
./odoo-bin -c odoo.conf
```

### **Step 2: Run the Script**
```bash
python3 scripts/generate_demo_data.py
```

### **Expected Output:**
```
============================================================
🚀 Dayflow HRMS - Demo Data Generator
============================================================
✓ Connected to Odoo as user ID: 2

📁 Creating Departments...
  ✓ Created department 'Engineering' (ID: 1)
  ✓ Created department 'Product' (ID: 2)
  ...

👥 Creating Employees...
  ✓ Created employee 'Sarah Johnson' (ID: 10)
  ✓ Created employee 'Michael Chen' (ID: 11)
  ...

⏰ Creating Attendance Records (Last 7 Days)...
  ✓ Created 45 attendance records

🏖️ Creating Leave Requests...
  ✓ Created 9 leave requests

💰 Creating Payroll Records...
  ✓ Created 10 payslips

⭐ Creating Performance Reviews...
  ✓ Created 7 performance reviews

============================================================
✅ Demo Data Generation Complete!
============================================================

📊 Summary:
  • Employees: 10
  • Departments: 6
  • Attendance records: Last 7 days
  • Leave requests: Past + Pending
  • Payslips: Current month
  • Performance reviews: Q4 2025

🎉 Your demo is ready!
```

---

## ⚙️ Configuration

Edit the script to customize:

### **Odoo Connection** (Lines 14-17):
```python
ODOO_URL = 'http://localhost:8069'
ODOO_DB = 'dayflow'
ODOO_USERNAME = 'admin'
ODOO_PASSWORD = 'admin'
```

### **Employee Data** (Lines 20-31):
Add/remove employees from the `EMPLOYEES` list

### **Leave Types** (Line 33):
```python
LEAVE_TYPES = ['Paid Leave', 'Sick Leave', 'Casual Leave']
```

---

## 🔍 Verification

After running the script, verify in the frontend:

### **1. Dashboard**
- Should show 10 employees
- Attendance chart should have data for last 7 days
- Metrics should be populated

### **2. Employees Page**
- Should list all 10 employees
- Filter by department should work
- Each employee should have profile data

### **3. Attendance Page**
- Team view should show recent check-ins
- Personal view should have records

### **4. Leave Page**
- Should show 3 pending requests (notifications!)
- Past approved leaves visible

### **5. Payroll Page**
- Should show 10 payslips
- Charts should display salary distribution

### **6. Performance Page**
- Should show 7 reviews
- Ratings should be visible

### **7. Analytics Dashboard**
- All charts should have data
- Metrics cards should show correct counts

---

## 🐛 Troubleshooting

### **Error: Authentication failed**
- Check Odoo is running: `http://localhost:8069`
- Verify database name is 'dayflow'
- Confirm admin credentials

### **Error: Module not found**
- Ensure custom modules are installed:
  - `hr_attendance_extended`
  - `dayflow_payroll`
  - `dayflow_performance`

### **Error: Field does not exist**
- Update Odoo modules: Settings → Apps → Update Apps List
- Restart Odoo server

### **Script runs but no data appears**
- Check Odoo logs for errors
- Verify database connection
- Try running script again (it skips existing records)

---

## 🔄 Re-running the Script

The script is **idempotent** - it checks for existing records and skips them:
- Departments: Checked by name
- Employees: Checked by email
- Other records: Created fresh each time

To **completely reset** demo data:
1. Delete all employees from Odoo UI
2. Delete all departments
3. Run script again

---

## 📝 Notes

- **Attendance**: Only creates records for weekdays (Mon-Fri)
- **Leaves**: Creates 3 pending requests for demo notifications
- **Salaries**: Randomized ±5% for realism
- **Ratings**: Random between 3.5-5.0 for top performers
- **Safe to run multiple times** - won't create duplicates

---

## 🎬 Demo Tips

1. **Before Demo**: Run this script
2. **Show Notifications**: 3 pending leave requests will trigger notifications
3. **Show Analytics**: All charts will have data
4. **Show Attendance**: Last 7 days of realistic data
5. **Show Payroll**: All employees have payslips
6. **Show Performance**: Top performers visible in leaderboard

---

## ✅ Checklist

Before your demo:
- [ ] Odoo server is running
- [ ] Run `python3 scripts/generate_demo_data.py`
- [ ] Verify all 10 employees appear
- [ ] Check notifications show 3 pending leaves
- [ ] Confirm analytics charts have data
- [ ] Test all pages load correctly

---

**Your demo data is ready! Good luck! 🚀**
