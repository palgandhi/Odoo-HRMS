#!/usr/bin/env python3
"""
Demo Data Generator for Dayflow HRMS
Generates realistic demo data for 10 employees with attendance, leaves, payroll, and performance data
"""

import xmlrpc.client
from datetime import datetime, timedelta
import random

# Odoo Connection Settings
ODOO_URL = 'http://localhost:8069'
ODOO_DB = 'dayflow_db'  # Updated to match actual database name
ODOO_USERNAME = 'admin'
ODOO_PASSWORD = 'admin'

# Demo Data Configuration
EMPLOYEES = [
    {'name': 'Sarah Johnson', 'email': 'sarah.johnson@dayflow.com', 'phone': '+1-555-0101', 'job': 'Senior Developer', 'dept': 'Engineering'},
    {'name': 'Michael Chen', 'email': 'michael.chen@dayflow.com', 'phone': '+1-555-0102', 'job': 'Product Manager', 'dept': 'Product'},
    {'name': 'Emily Rodriguez', 'email': 'emily.rodriguez@dayflow.com', 'phone': '+1-555-0103', 'job': 'UX Designer', 'dept': 'Design'},
    {'name': 'James Wilson', 'email': 'james.wilson@dayflow.com', 'phone': '+1-555-0104', 'job': 'DevOps Engineer', 'dept': 'Engineering'},
    {'name': 'Sophia Martinez', 'email': 'sophia.martinez@dayflow.com', 'phone': '+1-555-0105', 'job': 'HR Manager', 'dept': 'Human Resources'},
    {'name': 'David Kim', 'email': 'david.kim@dayflow.com', 'phone': '+1-555-0106', 'job': 'Backend Developer', 'dept': 'Engineering'},
    {'name': 'Olivia Brown', 'email': 'olivia.brown@dayflow.com', 'phone': '+1-555-0107', 'job': 'Marketing Lead', 'dept': 'Marketing'},
    {'name': 'Daniel Lee', 'email': 'daniel.lee@dayflow.com', 'phone': '+1-555-0108', 'job': 'QA Engineer', 'dept': 'Engineering'},
    {'name': 'Ava Taylor', 'email': 'ava.taylor@dayflow.com', 'phone': '+1-555-0109', 'job': 'Sales Manager', 'dept': 'Sales'},
    {'name': 'Ethan Anderson', 'email': 'ethan.anderson@dayflow.com', 'phone': '+1-555-0110', 'job': 'Frontend Developer', 'dept': 'Engineering'},
]

LEAVE_TYPES = ['Paid Leave', 'Sick Leave', 'Casual Leave']

def connect_odoo():
    """Connect to Odoo and return common, uid, and models"""
    common = xmlrpc.client.ServerProxy(f'{ODOO_URL}/xmlrpc/2/common')
    uid = common.authenticate(ODOO_DB, ODOO_USERNAME, ODOO_PASSWORD, {})
    models = xmlrpc.client.ServerProxy(f'{ODOO_URL}/xmlrpc/2/object')
    
    if not uid:
        raise Exception("Authentication failed! Check your credentials.")
    
    print(f"✓ Connected to Odoo as user ID: {uid}")
    return common, uid, models

def execute_kw(models, uid, model, method, args, kwargs=None):
    """Execute Odoo method"""
    if kwargs is None:
        kwargs = {}
    return models.execute_kw(ODOO_DB, uid, ODOO_PASSWORD, model, method, args, kwargs)

def create_departments(models, uid):
    """Create departments if they don't exist"""
    print("\n📁 Creating Departments...")
    departments = {}
    dept_names = list(set([emp['dept'] for emp in EMPLOYEES]))
    
    for dept_name in dept_names:
        # Check if department exists
        existing = execute_kw(models, uid, 'hr.department', 'search_read',
                            [[['name', '=', dept_name]]], {'fields': ['id'], 'limit': 1})
        
        if existing:
            dept_id = existing[0]['id']
            print(f"  ✓ Department '{dept_name}' already exists (ID: {dept_id})")
        else:
            dept_id = execute_kw(models, uid, 'hr.department', 'create', [{
                'name': dept_name,
            }])
            print(f"  ✓ Created department '{dept_name}' (ID: {dept_id})")
        
        departments[dept_name] = dept_id
    
    return departments

def create_employees(models, uid, departments):
    """Create employees"""
    print("\n👥 Creating Employees...")
    employee_ids = []
    
    for emp_data in EMPLOYEES:
        # Check if employee exists
        existing = execute_kw(models, uid, 'hr.employee', 'search_read',
                            [[['work_email', '=', emp_data['email']]]],
                            {'fields': ['id'], 'limit': 1})
        
        if existing:
            emp_id = existing[0]['id']
            print(f"  ✓ Employee '{emp_data['name']}' already exists (ID: {emp_id})")
        else:
            emp_id = execute_kw(models, uid, 'hr.employee', 'create', [{
                'name': emp_data['name'],
                'work_email': emp_data['email'],
                'mobile_phone': emp_data['phone'],
                'job_title': emp_data['job'],
                'department_id': departments[emp_data['dept']],
            }])
            print(f"  ✓ Created employee '{emp_data['name']}' (ID: {emp_id})")
        
        employee_ids.append(emp_id)
    
    return employee_ids

def create_attendance_records(models, uid, employee_ids):
    """Create attendance records for the last 7 days"""
    print("\n⏰ Creating Attendance Records (Last 7 Days)...")
    
    today = datetime.now()
    attendance_count = 0
    
    for day_offset in range(7):
        date = today - timedelta(days=day_offset)
        
        # Skip weekends
        if date.weekday() >= 5:
            continue
        
        for emp_id in employee_ids:
            # 90% chance of attendance
            if random.random() < 0.9:
                # Random check-in time between 8:00 and 9:30
                check_in_hour = random.randint(8, 9)
                check_in_minute = random.randint(0, 30) if check_in_hour == 9 else random.randint(0, 59)
                check_in = date.replace(hour=check_in_hour, minute=check_in_minute, second=0)
                
                # Random check-out time between 17:00 and 19:00
                check_out_hour = random.randint(17, 18)
                check_out_minute = random.randint(0, 59)
                check_out = date.replace(hour=check_out_hour, minute=check_out_minute, second=0)
                
                # Format for Odoo
                check_in_str = check_in.strftime('%Y-%m-%d %H:%M:%S')
                check_out_str = check_out.strftime('%Y-%m-%d %H:%M:%S')
                
                try:
                    execute_kw(models, uid, 'hr.attendance', 'create', [{
                        'employee_id': emp_id,
                        'check_in': check_in_str,
                        'check_out': check_out_str,
                    }])
                    attendance_count += 1
                except Exception as e:
                    print(f"    ⚠ Error creating attendance: {e}")
    
    print(f"  ✓ Created {attendance_count} attendance records")

def create_leave_requests(models, uid, employee_ids):
    """Create leave requests with proper allocations"""
    print("\n🏖️ Creating Leave Requests...")
    
    # Get leave types
    leave_types = execute_kw(models, uid, 'hr.leave.type', 'search_read',
                            [[['active', '=', True]]], {'fields': ['id', 'name']})
    
    if not leave_types:
        print("  ⚠ No leave types found. Creating default leave types...")
        leave_type_ids = []
        for leave_name in LEAVE_TYPES:
            lt_id = execute_kw(models, uid, 'hr.leave.type', 'create', [{
                'name': leave_name,
                'allocation_type': 'fixed',  # Changed to fixed allocation
                'validity_start': False,
            }])
            leave_type_ids.append({'id': lt_id, 'name': leave_name})
        leave_types = leave_type_ids
    
    # Create allocations for all employees (20 days per year)
    print("  Creating leave allocations...")
    allocation_count = 0
    for emp_id in employee_ids:
        for leave_type in leave_types:
            try:
                alloc_id = execute_kw(models, uid, 'hr.leave.allocation', 'create', [{
                    'name': f'{leave_type["name"]} Allocation',
                    'employee_id': emp_id,
                    'holiday_status_id': leave_type['id'],
                    'number_of_days': 20,  # 20 days allocation
                    'state': 'validate',  # Auto-approve allocation
                }])
                allocation_count += 1
            except Exception as e:
                # Skip if allocation already exists
                pass
    
    print(f"    ✓ Created/verified {allocation_count} leave allocations")
    
    leave_count = 0
    today = datetime.now()
    
    # Create some past approved leaves
    for emp_id in employee_ids:
        if random.random() < 0.4:  # 40% chance (reduced to avoid conflicts)
            leave_type = random.choice(leave_types)
            days_ago = random.randint(15, 45)
            duration = random.randint(1, 2)
            
            date_from = (today - timedelta(days=days_ago)).replace(hour=7, minute=0, second=0)
            date_to = (date_from + timedelta(days=duration)).replace(hour=16, minute=0, second=0)
            
            try:
                leave_id = execute_kw(models, uid, 'hr.leave', 'create', [{
                    'employee_id': emp_id,
                    'holiday_status_id': leave_type['id'],
                    'date_from': date_from.strftime('%Y-%m-%d %H:%M:%S'),
                    'date_to': date_to.strftime('%Y-%m-%d %H:%M:%S'),
                    'name': f'{leave_type["name"]} - {duration} days',
                }])
                
                # Approve the leave
                execute_kw(models, uid, 'hr.leave', 'action_approve', [[leave_id]])
                leave_count += 1
            except Exception as e:
                pass  # Skip if overlaps or other issues
    
    # Create some pending leaves (for demo - these will show in notifications)
    print("  Creating pending leave requests...")
    pending_count = 0
    for i in range(min(3, len(employee_ids))):
        emp_id = employee_ids[i]
        leave_type = random.choice(leave_types)
        days_ahead = random.randint(7, 20)
        duration = random.randint(1, 2)
        
        date_from = (today + timedelta(days=days_ahead)).replace(hour=7, minute=0, second=0)
        date_to = (date_from + timedelta(days=duration)).replace(hour=16, minute=0, second=0)
        
        try:
            leave_id = execute_kw(models, uid, 'hr.leave', 'create', [{
                'employee_id': emp_id,
                'holiday_status_id': leave_type['id'],
                'date_from': date_from.strftime('%Y-%m-%d %H:%M:%S'),
                'date_to': date_to.strftime('%Y-%m-%d %H:%M:%S'),
                'name': f'{leave_type["name"]} - {duration} days',
            }])
            
            # Submit for approval (set to 'confirm' state)
            execute_kw(models, uid, 'hr.leave', 'action_confirm', [[leave_id]])
            pending_count += 1
            leave_count += 1
        except Exception as e:
            pass
    
    print(f"  ✓ Created {leave_count} leave requests ({pending_count} pending for approval)")

def create_payroll_records(models, uid, employee_ids):
    """Create payroll records for last 3 months"""
    print("\n💰 Creating Payroll Records (Last 3 Months)...")
    
    payroll_count = 0
    base_salaries = {
        'Senior Developer': 790000,      # ₹7.9 LPA
        'Product Manager': 875000,       # ₹8.75 LPA
        'UX Designer': 708000,           # ₹7.08 LPA
        'DevOps Engineer': 750000,       # ₹7.5 LPA
        'HR Manager': 667000,            # ₹6.67 LPA
        'Backend Developer': 733000,     # ₹7.33 LPA
        'Marketing Lead': 767000,        # ₹7.67 LPA
        'QA Engineer': 625000,           # ₹6.25 LPA
        'Sales Manager': 817000,         # ₹8.17 LPA
        'Frontend Developer': 725000,    # ₹7.25 LPA
    }
    
    today = datetime.now()
    
    # Create payslips for last 3 months
    for month_offset in range(3):
        payslip_date = today - timedelta(days=30 * month_offset)
        month_name = payslip_date.strftime("%B %Y")
        
        for i, emp_id in enumerate(employee_ids):
            emp_data = EMPLOYEES[i]
            base_salary = base_salaries.get(emp_data['job'], 80000)
            monthly_salary = base_salary / 12
            
            # Add some variation each month (±2%)
            variation = random.uniform(0.98, 1.02)
            basic_wage = monthly_salary * variation
            
            # Realistic allowances (15-20% of basic)
            hra = basic_wage * 0.40  # House Rent Allowance
            transport = basic_wage * 0.10  # Transport Allowance
            medical = basic_wage * 0.05  # Medical Allowance
            total_allowances = hra + transport + medical
            
            # Deductions (10-15% of basic)
            provident_fund = basic_wage * 0.12  # PF
            professional_tax = 200  # Fixed PT
            tds = basic_wage * 0.05  # Tax Deducted at Source
            total_deductions = provident_fund + professional_tax + tds
            
            # Net wage (computed automatically by Odoo)
            # gross_wage = basic_wage + total_allowances
            # net_wage = gross_wage - total_deductions
            
            try:
                execute_kw(models, uid, 'hr.payroll.slip', 'create', [{
                    'name': f'Payslip - {emp_data["name"]} - {month_name}',
                    'employee_id': emp_id,
                    'date': payslip_date.strftime('%Y-%m-%d'),
                    'basic_wage': round(basic_wage, 2),
                    'allowances': round(total_allowances, 2),
                    'deductions': round(total_deductions, 2),
                    # net_wage is computed automatically
                    'state': 'paid' if month_offset > 0 else 'draft',  # Current month is draft
                }])
                payroll_count += 1
            except Exception as e:
                print(f"    ⚠ Error creating payslip: {e}")
    
    print(f"  ✓ Created {payroll_count} payslips (3 months × {len(employee_ids)} employees)")

def create_performance_reviews(models, uid, employee_ids):
    """Create performance reviews with realistic feedback"""
    print("\n⭐ Creating Performance Reviews...")
    
    review_count = 0
    today = datetime.now()
    
    # Realistic feedback templates by rating
    feedback_templates = {
        5: [
            "Exceptional performance! Consistently exceeds expectations and demonstrates outstanding leadership.",
            "Top performer who delivers high-quality work and mentors junior team members effectively.",
            "Excellent contributions to the team. Shows initiative and drives projects to successful completion.",
        ],
        4: [
            "Strong performance with consistent delivery of quality work. Great team player.",
            "Meets and often exceeds expectations. Reliable and shows good technical skills.",
            "Good performance overall. Demonstrates solid understanding of role responsibilities.",
        ],
        3: [
            "Meets expectations. Shows potential for growth with continued development.",
            "Satisfactory performance. Would benefit from additional training in key areas.",
        ],
    }
    
    # Skills for different roles
    role_skills = {
        'Developer': ['Coding', 'Problem Solving', 'Code Review', 'Testing', 'Documentation'],
        'Manager': ['Leadership', 'Communication', 'Planning', 'Team Building', 'Decision Making'],
        'Designer': ['Creativity', 'User Research', 'Prototyping', 'Visual Design', 'Collaboration'],
        'Engineer': ['Technical Skills', 'System Design', 'Troubleshooting', 'Innovation', 'Quality'],
    }
    
    for i, emp_id in enumerate(employee_ids):
        emp_data = EMPLOYEES[i]
        
        # Determine rating based on role and randomness
        # Senior roles tend to have higher ratings
        if 'Senior' in emp_data['job'] or 'Manager' in emp_data['job'] or 'Lead' in emp_data['job']:
            rating = random.choice([4, 4, 5, 5])  # 50% chance of 5, 50% chance of 4
        else:
            rating = random.choice([3, 4, 4, 5])  # Mix of 3, 4, and 5
        
        # Get appropriate feedback
        feedback = random.choice(feedback_templates[rating])
        
        # Determine skill category
        skill_category = 'Engineer'
        if 'Developer' in emp_data['job'] or 'Engineer' in emp_data['job']:
            skill_category = 'Developer'
        elif 'Manager' in emp_data['job'] or 'Lead' in emp_data['job']:
            skill_category = 'Manager'
        elif 'Designer' in emp_data['job']:
            skill_category = 'Designer'
        
        # Create review for Q4 2025
        start_date = (today - timedelta(days=90)).strftime('%Y-%m-%d')
        end_date = today.strftime('%Y-%m-%d')
        
        try:
            execute_kw(models, uid, 'hr.performance.review', 'create', [{
                'name': f'Q4 2025 Performance Review - {emp_data["name"]}',
                'employee_id': emp_id,
                'start_date': start_date,
                'end_date': end_date,
                'manager_rating': str(rating),
                'manager_feedback': feedback,
                'state': 'finalized',
            }])
            review_count += 1
            print(f"    ✓ Created review for {emp_data['name']} (Rating: {rating}/5)")
        except Exception as e:
            print(f"    ⚠ Error creating review for {emp_data['name']}: {e}")
    
    # Create some ongoing reviews (not finalized) for realism
    print("\n  Creating ongoing reviews...")
    for i in range(min(3, len(employee_ids))):
        emp_id = employee_ids[i]
        emp_data = EMPLOYEES[i]
        
        start_date = today.strftime('%Y-%m-%d')
        end_date = (today + timedelta(days=90)).strftime('%Y-%m-%d')
        
        try:
            execute_kw(models, uid, 'hr.performance.review', 'create', [{
                'name': f'Q1 2026 Performance Review - {emp_data["name"]}',
                'employee_id': emp_id,
                'start_date': start_date,
                'end_date': end_date,
                'manager_rating': '0',  # Not rated yet
                'manager_feedback': 'Review in progress...',
                'state': 'ongoing',
            }])
            review_count += 1
        except Exception as e:
            pass
    
    print(f"\n  ✓ Created {review_count} performance reviews (finalized + ongoing)")

def main():
    """Main function"""
    print("=" * 60)
    print("🚀 Dayflow HRMS - Demo Data Generator")
    print("=" * 60)
    
    try:
        # Connect to Odoo
        common, uid, models = connect_odoo()
        
        # Create departments
        departments = create_departments(models, uid)
        
        # Create employees
        employee_ids = create_employees(models, uid, departments)
        
        # Create attendance records
        create_attendance_records(models, uid, employee_ids)
        
        # Create leave requests
        create_leave_requests(models, uid, employee_ids)
        
        # Create payroll records
        create_payroll_records(models, uid, employee_ids)
        
        # Create performance reviews
        create_performance_reviews(models, uid, employee_ids)
        
        print("\n" + "=" * 60)
        print("✅ Demo Data Generation Complete!")
        print("=" * 60)
        print(f"\n📊 Summary:")
        print(f"  • Employees: {len(employee_ids)}")
        print(f"  • Departments: {len(departments)}")
        print(f"  • Attendance records: Last 7 days")
        print(f"  • Leave requests: Past + Pending")
        print(f"  • Payslips: Current month")
        print(f"  • Performance reviews: Q4 2025")
        print(f"\n🎉 Your demo is ready!")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()
