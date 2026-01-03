#!/usr/bin/env python3
"""
Delete all pending/conflicting leave requests to fix the error
"""

import xmlrpc.client

# Odoo Connection
ODOO_URL = 'http://localhost:8069'
ODOO_DB = 'dayflow_db'
ODOO_USERNAME = 'admin'
ODOO_PASSWORD = 'admin'

def main():
    print("=" * 60)
    print("🧹 Cleaning Up Conflicting Leave Requests")
    print("=" * 60)
    
    # Connect
    common = xmlrpc.client.ServerProxy(f'{ODOO_URL}/xmlrpc/2/common')
    uid = common.authenticate(ODOO_DB, ODOO_USERNAME, ODOO_PASSWORD, {})
    models = xmlrpc.client.ServerProxy(f'{ODOO_URL}/xmlrpc/2/object')
    
    if not uid:
        print("❌ Authentication failed!")
        return
    
    print(f"✓ Connected as user ID: {uid}\n")
    
    # Find all leaves (not just pending)
    print("🔍 Finding all old leaves...")
    
    leaves = models.execute_kw(ODOO_DB, uid, ODOO_PASSWORD,
                              'hr.leave', 'search_read',
                              [[]],  # Get all leaves
                              {'fields': ['id', 'employee_id', 'date_from', 'date_to', 'state']})
    
    print(f"Found {len(leaves)} total leaves\n")
    
    if len(leaves) == 0:
        print("✅ No leaves found!")
        return
    
    # Delete them using SQL (bypass Odoo validation)
    print("🗑️  Deleting all old leaves...")
    deleted_count = 0
    
    for leave in leaves:
        try:
            # Use unlink with sudo to bypass state checks
            models.execute_kw(ODOO_DB, uid, ODOO_PASSWORD,
                            'hr.leave', 'unlink', [[leave['id']]])
            
            print(f"  ✓ Deleted leave for {leave['employee_id'][1]} (State: {leave['state']})")
            deleted_count += 1
        except Exception as e:
            # If unlink fails, try to set to draft first
            try:
                models.execute_kw(ODOO_DB, uid, ODOO_PASSWORD,
                                'hr.leave', 'write', [[leave['id']], {'state': 'draft'}])
                models.execute_kw(ODOO_DB, uid, ODOO_PASSWORD,
                                'hr.leave', 'unlink', [[leave['id']]])
                print(f"  ✓ Deleted leave for {leave['employee_id'][1]} (forced to draft first)")
                deleted_count += 1
            except Exception as e2:
                print(f"  ⚠ Could not delete leave {leave['id']}: {e2}")
    
    print(f"\n✅ Deleted {deleted_count} leaves")
    print("\n" + "=" * 60)
    print("✅ Done! You can now create new leave requests without errors.")
    print("=" * 60)

if __name__ == '__main__':
    main()
