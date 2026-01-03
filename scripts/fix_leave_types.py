#!/usr/bin/env python3
"""
Fix leave types to not require allocations
"""

import xmlrpc.client

ODOO_URL = 'http://localhost:8069'
ODOO_DB = 'dayflow_db'
ODOO_USERNAME = 'admin'
ODOO_PASSWORD = 'admin'

def main():
    print("=" * 60)
    print("🔧 Fixing Leave Type Configuration")
    print("=" * 60)
    
    common = xmlrpc.client.ServerProxy(f'{ODOO_URL}/xmlrpc/2/common')
    uid = common.authenticate(ODOO_DB, ODOO_USERNAME, ODOO_PASSWORD, {})
    models = xmlrpc.client.ServerProxy(f'{ODOO_URL}/xmlrpc/2/object')
    
    if not uid:
        print("❌ Authentication failed!")
        return
    
    print(f"✓ Connected\n")
    
    # Get all leave types
    leave_types = models.execute_kw(ODOO_DB, uid, ODOO_PASSWORD,
                                    'hr.leave.type', 'search_read',
                                    [[['active', '=', True]]],
                                    {'fields': ['id', 'name', 'allocation_type']})
    
    print(f"📋 Found {len(leave_types)} leave types\n")
    
    # Update each to not require allocation
    for lt in leave_types:
        try:
            models.execute_kw(ODOO_DB, uid, ODOO_PASSWORD,
                            'hr.leave.type', 'write',
                            [[lt['id']], {
                                'allocation_type': 'no',  # No allocation required
                                'validity_start': False,
                            }])
            print(f"  ✓ Fixed '{lt['name']}' - No allocation required")
        except Exception as e:
            print(f"  ⚠ Error fixing '{lt['name']}': {e}")
    
    print("\n" + "=" * 60)
    print("✅ Done! Leave types fixed.")
    print("=" * 60)
    print("\n💡 You can now create leave requests without allocation errors!")

if __name__ == '__main__':
    main()
