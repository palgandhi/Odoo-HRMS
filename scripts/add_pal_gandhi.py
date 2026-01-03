#!/usr/bin/env python3
"""
Add Pal Gandhi as an employee with complete demo data
"""

import xmlrpc.client
from datetime import datetime, timedelta
import random

# Odoo Connection
ODOO_URL = 'http://localhost:8069'
ODOO_DB = 'dayflow_db'
ODOO_USERNAME = 'admin'
ODOO_PASSWORD = 'admin'

# Your details
YOUR_DATA = {
    'name': 'Pal Gandhi',
    'email': 'palgandhi@icloud.com',
    'phone': '+91-98765-43210',
    'job': 'Full Stack Developer',
    'dept': 'Engineering'
}

def execute_kw(models, uid, model, method, args, kwargs=None):
    """Execute Odoo method"""
    if kwargs is None:
        kwargs = {}
    return models.execute_kw(ODOO_DB, uid, ODOO_PASSWORD, model, method, args, kwargs)

def main():
    print("=" * 60)
    print("👤 Adding Pal Gandhi to Dayflow HRMS")
    print("=" * 60)
    
    # Connect
    common = xmlrpc.client.ServerProxy(f'{ODOO_URL}/xmlrpc/2/common')
    uid = common.authenticate(ODOO_DB, ODOO_USERNAME, ODOO_PASSWORD, {})
    models = xmlrpc.client.ServerProxy(f'{ODOO_URL}/xmlrpc/2/object')
    
    if not uid:
        print("❌ Authentication failed!")
        return
    
    print(f"✓ Connected as user ID: {uid}\n")
    
    # 1. Get/Create Department
    print("📁 Setting up department...")
    dept = execute_kw(models, uid, 'hr.department', 'search_read',
                     [[['name', '=', YOUR_DATA['dept']]]],
                     {'fields': ['id'], 'limit': 1})
    
    if dept:
        dept_id = dept[0]['id']
        print(f"  ✓ Using existing department '{YOUR_DATA['dept']}' (ID: {dept_id})")
    else:
        dept_id = execute_kw(models, uid, 'hr.department', 'create', [{
            'name': YOUR_DATA['dept']
        }])
        print(f"  ✓ Created department '{YOUR_DATA['dept']}' (ID: {dept_id})")
    
    # 2. Create Employee
    print(f"\n👤 Creating employee '{YOUR_DATA['name']}'...")
    
    # Check if already exists
    existing = execute_kw(models, uid, 'hr.employee', 'search_read',
                         [[['work_email', '=', YOUR_DATA['email']]]],
                         {'fields': ['id'], 'limit': 1})
    
    if existing:
        emp_id = existing[0]['id']
        print(f"  ✓ Employee already exists (ID: {emp_id})")
    else:
        emp_id = execute_kw(models, uid, 'hr.employee', 'create', [{
            'name': YOUR_DATA['name'],
            'work_email': YOUR_DATA['email'],
            'mobile_phone': YOUR_DATA['phone'],
            'job_title': YOUR_DATA['job'],
            'department_id': dept_id,
        }])
        print(f"  ✓ Created employee (ID: {emp_id})")
    
    # 3. Create User Account
    print(f"\n🔐 Creating user account...")
    
    # Check if user exists
    user_exists = execute_kw(models, uid, 'res.users', 'search_read',
                            [[['login', '=', YOUR_DATA['email']]]],
                            {'fields': ['id'], 'limit': 1})
    
    if user_exists:
        user_id = user_exists[0]['id']
        print(f"  ✓ User already exists (ID: {user_id})")
    else:
        user_id = execute_kw(models, uid, 'res.users', 'create', [{
            'name': YOUR_DATA['name'],
            'login': YOUR_DATA['email'],
            'password': 'password123',  # Change this!
            'active': True,
        }])
        print(f"  ✓ Created user (ID: {user_id})")
        print(f"  📧 Login: {YOUR_DATA['email']}")
        print(f"  🔑 Password: password123")
        
        # Link user to employee
        execute_kw(models, uid, 'hr.employee', 'write',
                  [[emp_id], {'user_id': user_id}])
        print(f"  ✓ Linked user to employee")
    
    # 4. Create Leave Allocations
    print(f"\n🏖️ Creating leave allocations...")
    
    leave_types = execute_kw(models, uid, 'hr.leave.type', 'search_read',
                            [[['active', '=', True]]],
                            {'fields': ['id', 'name']})
    
    allocation_count = 0
    for leave_type in leave_types:
        try:
            execute_kw(models, uid, 'hr.leave.allocation', 'create', [{
                'name': f'{leave_type["name"]} Allocation',
                'employee_id': emp_id,
                'holiday_status_id': leave_type['id'],
                'number_of_days': 20,
                'state': 'validate',
            }])
            allocation_count += 1
        except:
            pass  # Already exists
    
    print(f"  ✓ Created {allocation_count} leave allocations (20 days each)")
    
    # 5. Create Attendance Records (Last 7 days)
    print(f"\n⏰ Creating attendance records...")
    
    today = datetime.now()
    attendance_count = 0
    
    for day_offset in range(7):
        date = today - timedelta(days=day_offset)
        
        # Skip weekends
        if date.weekday() >= 5:
            continue
        
        # Random check-in/out times
        check_in_hour = random.randint(8, 9)
        check_in_minute = random.randint(0, 30)
        check_in = date.replace(hour=check_in_hour, minute=check_in_minute, second=0)
        
        check_out_hour = random.randint(17, 18)
        check_out_minute = random.randint(0, 59)
        check_out = date.replace(hour=check_out_hour, minute=check_out_minute, second=0)
        
        try:
            execute_kw(models, uid, 'hr.attendance', 'create', [{
                'employee_id': emp_id,
                'check_in': check_in.strftime('%Y-%m-%d %H:%M:%S'),
                'check_out': check_out.strftime('%Y-%m-%d %H:%M:%S'),
            }])
            attendance_count += 1
        except:
            pass  # Already exists
    
    print(f"  ✓ Created {attendance_count} attendance records")
    
    # 6. Create Payslips (Last 3 months)
    print(f"\n💰 Creating payslips...")
    
    base_salary = 850000  # ₹8.5 LPA
    monthly_salary = base_salary / 12
    payslip_count = 0
    
    for month_offset in range(3):
        payslip_date = today - timedelta(days=30 * month_offset)
        month_name = payslip_date.strftime("%B %Y")
        
        basic_wage = monthly_salary * random.uniform(0.98, 1.02)
        hra = basic_wage * 0.40
        transport = basic_wage * 0.10
        medical = basic_wage * 0.05
        total_allowances = hra + transport + medical
        
        provident_fund = basic_wage * 0.12
        professional_tax = 200
        tds = basic_wage * 0.05
        total_deductions = provident_fund + professional_tax + tds
        
        try:
            execute_kw(models, uid, 'hr.payroll.slip', 'create', [{
                'name': f'Payslip - {YOUR_DATA["name"]} - {month_name}',
                'employee_id': emp_id,
                'date': payslip_date.strftime('%Y-%m-%d'),
                'basic_wage': round(basic_wage, 2),
                'allowances': round(total_allowances, 2),
                'deductions': round(total_deductions, 2),
                'state': 'paid' if month_offset > 0 else 'draft',
            }])
            payslip_count += 1
        except:
            pass
    
    print(f"  ✓ Created {payslip_count} payslips")
    
    # 7. Create Performance Review
    print(f"\n⭐ Creating performance review...")
    
    try:
        start_date = (today - timedelta(days=90)).strftime('%Y-%m-%d')
        end_date = today.strftime('%Y-%m-%d')
        
        execute_kw(models, uid, 'hr.performance.review', 'create', [{
            'name': f'Q4 2025 Performance Review - {YOUR_DATA["name"]}',
            'employee_id': emp_id,
            'start_date': start_date,
            'end_date': end_date,
            'manager_rating': '5',
            'manager_feedback': 'Exceptional performance! Consistently exceeds expectations and demonstrates outstanding technical leadership.',
            'state': 'finalized',
        }])
        print(f"  ✓ Created performance review (Rating: 5/5)")
    except:
        print(f"  ⚠ Performance review already exists")
    
    print("\n" + "=" * 60)
    print("✅ Pal Gandhi added successfully!")
    print("=" * 60)
    print(f"\n📊 Summary:")
    print(f"  • Name: {YOUR_DATA['name']}")
    print(f"  • Email: {YOUR_DATA['email']}")
    print(f"  • Job: {YOUR_DATA['job']}")
    print(f"  • Department: {YOUR_DATA['dept']}")
    print(f"  • Salary: ₹8.5 LPA")
    print(f"  • Leave Allocations: {allocation_count} types (20 days each)")
    print(f"  • Attendance: {attendance_count} records (last 7 days)")
    print(f"  • Payslips: {payslip_count} (last 3 months)")
    print(f"  • Performance: 5/5 rating")
    print(f"\n🔑 Login Credentials:")
    print(f"  Email: {YOUR_DATA['email']}")
    print(f"  Password: password123")
    print(f"\n🎉 You can now login and test the app!")

if __name__ == '__main__':
    main()
