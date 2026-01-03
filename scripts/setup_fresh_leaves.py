#!/usr/bin/env python3
"""
Create fresh leave allocations and pending requests (clean slate)
"""

import xmlrpc.client
from datetime import datetime, timedelta

ODOO_URL = 'http://localhost:8069'
ODOO_DB = 'dayflow_db'
ODOO_USERNAME = 'admin'
ODOO_PASSWORD = 'admin'

def main():
    print("=" * 60)
    print("🔧 Creating Fresh Leave Data")
    print("=" * 60)
    
    common = xmlrpc.client.ServerProxy(f'{ODOO_URL}/xmlrpc/2/common')
    uid = common.authenticate(ODOO_DB, ODOO_USERNAME, ODOO_PASSWORD, {})
    models = xmlrpc.client.ServerProxy(f'{ODOO_URL}/xmlrpc/2/object')
    
    if not uid:
        print("❌ Authentication failed!")
        return
    
    print(f"✓ Connected\n")
    
    # Get all employees
    employees = models.execute_kw(ODOO_DB, uid, ODOO_PASSWORD,
                                 'hr.employee', 'search_read',
                                 [[]], {'fields': ['id', 'name']})
    
    # Get leave types
    leave_types = models.execute_kw(ODOO_DB, uid, ODOO_PASSWORD,
                                    'hr.leave.type', 'search_read',
                                    [[['active', '=', True]]],
                                    {'fields': ['id', 'name']})
    
    # Create allocations for all employees
    print(f"📋 Creating allocations for {len(employees)} employees...")
    alloc_count = 0
    
    for emp in employees:
        for lt in leave_types:
            try:
                models.execute_kw(ODOO_DB, uid, ODOO_PASSWORD,
                                'hr.leave.allocation', 'create', [{
                                    'name': f'{lt["name"]} Allocation',
                                    'employee_id': emp['id'],
                                    'holiday_status_id': lt['id'],
                                    'number_of_days': 20,
                                    'state': 'validate',
                                }])
                alloc_count += 1
            except:
                pass  # Already exists
    
    print(f"  ✓ Created {alloc_count} allocations\n")
    
    # Create 3 pending leaves
    print("🏖️  Creating 3 pending leave requests...")
    today = datetime.now()
    
    for i in range(min(3, len(employees))):
        emp = employees[i]
        lt = leave_types[0]  # Use first leave type
        
        days_ahead = 10 + (i * 7)
        date_from = (today + timedelta(days=days_ahead)).replace(hour=7, minute=0, second=0)
        date_to = (date_from + timedelta(days=2)).replace(hour=16, minute=0, second=0)
        
        try:
            leave_id = models.execute_kw(ODOO_DB, uid, ODOO_PASSWORD,
                                        'hr.leave', 'create', [{
                                            'employee_id': emp['id'],
                                            'holiday_status_id': lt['id'],
                                            'date_from': date_from.strftime('%Y-%m-%d %H:%M:%S'),
                                            'date_to': date_to.strftime('%Y-%m-%d %H:%M:%S'),
                                            'name': f'{lt["name"]} - Pending Request',
                                        }])
            
            models.execute_kw(ODOO_DB, uid, ODOO_PASSWORD,
                            'hr.leave', 'action_confirm', [[leave_id]])
            
            print(f"  ✓ Created for {emp['name']} ({date_from.strftime('%b %d')} - {date_to.strftime('%b %d')})")
        except Exception as e:
            print(f"  ⚠ Error for {emp['name']}: {e}")
    
    print("\n" + "=" * 60)
    print("✅ Done! Fresh leave data created.")
    print("=" * 60)
    print("\n💡 You can now:")
    print("  • Create new leave requests without errors")
    print("  • Approve/reject the 3 pending requests")
    print("  • See notifications for pending leaves")

if __name__ == '__main__':
    main()
