#!/usr/bin/env python3
"""
Quick script to create 3 pending leave requests for testing approval workflow
"""

import xmlrpc.client
from datetime import datetime, timedelta

# Odoo Connection
ODOO_URL = 'http://localhost:8069'
ODOO_DB = 'dayflow_db'
ODOO_USERNAME = 'admin'
ODOO_PASSWORD = 'admin'

def main():
    print("=" * 60)
    print("🔧 Creating Test Leave Requests")
    print("=" * 60)
    
    # Connect
    common = xmlrpc.client.ServerProxy(f'{ODOO_URL}/xmlrpc/2/common')
    uid = common.authenticate(ODOO_DB, ODOO_USERNAME, ODOO_PASSWORD, {})
    models = xmlrpc.client.ServerProxy(f'{ODOO_URL}/xmlrpc/2/object')
    
    if not uid:
        print("❌ Authentication failed!")
        return
    
    print(f"✓ Connected as user ID: {uid}\n")
    
    # Get first 3 employees
    employees = models.execute_kw(ODOO_DB, uid, ODOO_PASSWORD,
                                 'hr.employee', 'search_read',
                                 [[]], {'fields': ['id', 'name'], 'limit': 3})
    
    # Get first leave type
    leave_types = models.execute_kw(ODOO_DB, uid, ODOO_PASSWORD,
                                    'hr.leave.type', 'search_read',
                                    [[['active', '=', True]]], 
                                    {'fields': ['id', 'name'], 'limit': 1})
    
    if not leave_types:
        print("❌ No leave types found!")
        return
    
    leave_type = leave_types[0]
    today = datetime.now()
    
    print(f"Creating 3 pending leave requests...\n")
    
    for i, emp in enumerate(employees):
        days_ahead = 10 + (i * 5)
        date_from = (today + timedelta(days=days_ahead)).replace(hour=7, minute=0, second=0)
        date_to = (date_from + timedelta(days=1)).replace(hour=16, minute=0, second=0)
        
        try:
            # Create leave
            leave_id = models.execute_kw(ODOO_DB, uid, ODOO_PASSWORD,
                                        'hr.leave', 'create', [{
                                            'employee_id': emp['id'],
                                            'holiday_status_id': leave_type['id'],
                                            'date_from': date_from.strftime('%Y-%m-%d %H:%M:%S'),
                                            'date_to': date_to.strftime('%Y-%m-%d %H:%M:%S'),
                                            'name': f'{leave_type["name"]} - Test Request',
                                        }])
            
            # Submit for approval
            models.execute_kw(ODOO_DB, uid, ODOO_PASSWORD,
                            'hr.leave', 'action_confirm', [[leave_id]])
            
            print(f"  ✓ Created pending leave for {emp['name']} (ID: {leave_id})")
            print(f"    Date: {date_from.strftime('%Y-%m-%d')} to {date_to.strftime('%Y-%m-%d')}")
            
        except Exception as e:
            print(f"  ⚠ Error for {emp['name']}: {e}")
    
    print("\n" + "=" * 60)
    print("✅ Done! Check the Leave page for pending requests.")
    print("=" * 60)

if __name__ == '__main__':
    main()
