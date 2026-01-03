# 🎯 Quick Start Guide - Demo Data Setup

## ⚡ Quick Commands

### **1. Generate Demo Data**
```bash
cd /Users/palgandhi/Desktop/Odoo
python3 scripts/generate_demo_data.py
```

### **2. Start Frontend**
```bash
cd dayflow-frontend
npm run dev
```

### **3. Open Browser**
```
http://localhost:5173
```

---

## 📊 What You'll Get

After running the demo data script:

### **✅ 10 Employees**
- Across 6 departments (Engineering, Product, Design, HR, Marketing, Sales)
- With realistic job titles and contact info
- Ready to showcase in Employee directory

### **✅ Attendance Data**
- Last 7 days of check-in/check-out records
- ~90% attendance rate
- Realistic times (8-9:30 AM check-in, 5-7 PM check-out)
- **Perfect for Analytics charts!**

### **✅ Leave Requests**
- Past approved leaves
- **3 pending requests** → Triggers notifications! 🔔
- Mix of leave types (Paid, Sick, Casual)

### **✅ Payroll Records**
- Monthly payslips for all 10 employees
- Salaries ranging from ₹75K - ₹105K/year
- **Charts will show salary distribution!**

### **✅ Performance Reviews**
- 7 finalized reviews
- Ratings 3.5 - 5.0 stars
- **Top performers leaderboard populated!**

---

## 🎬 Demo Flow

### **1. Login**
- Username: `admin`
- Password: `admin`

### **2. Dashboard**
- ✅ Shows 10 employees
- ✅ Attendance chart has data
- ✅ Metrics populated

### **3. Notifications** 🔔
- ✅ Bell shows "3" pending leaves
- ✅ Click to see requests
- ✅ Navigate to Leave page

### **4. Analytics** 📊
- ✅ Attendance trend (last 7 days)
- ✅ Leave distribution pie chart
- ✅ Department headcount bar chart
- ✅ Top performers leaderboard

### **5. Employees**
- ✅ 10 employees listed
- ✅ Filter by department works
- ✅ Profile cards populated

### **6. Attendance**
- ✅ Team view shows recent check-ins
- ✅ Personal view has records

### **7. Leave**
- ✅ 3 pending requests visible
- ✅ Past approved leaves shown
- ✅ Pie chart displays

### **8. Payroll**
- ✅ 10 payslips listed
- ✅ Salary chart displays
- ✅ Total net pay shown

### **9. Performance**
- ✅ 7 reviews visible
- ✅ Ratings displayed
- ✅ Manager feedback shown

---

## 🐛 Troubleshooting

### **Script fails with "Authentication failed"**
```bash
# Check Odoo is running
curl http://localhost:8069

# If not running, start it:
./odoo-bin -c odoo.conf
```

### **No data appears in frontend**
```bash
# Clear browser cache
# Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

# Or clear localStorage:
# Open browser console (F12)
localStorage.clear()
location.reload()
```

### **Employee page error**
- Fixed! Removed unused imports
- Rebuild frontend:
```bash
cd dayflow-frontend
npm run build
```

---

## ✅ Pre-Demo Checklist

- [ ] Odoo backend running (`./odoo-bin -c odoo.conf`)
- [ ] Demo data generated (`python3 scripts/generate_demo_data.py`)
- [ ] Frontend running (`npm run dev`)
- [ ] Browser open to `http://localhost:5173`
- [ ] Logged in as admin
- [ ] Notifications show 3 pending leaves
- [ ] Analytics charts have data
- [ ] All pages load without errors

---

## 🎉 You're Ready!

Your demo environment is fully set up with:
- ✅ 10 realistic employees
- ✅ 7 days of attendance data
- ✅ Pending leave requests (notifications!)
- ✅ Payroll records
- ✅ Performance reviews
- ✅ All charts populated

**Good luck with your presentation! 🚀**
