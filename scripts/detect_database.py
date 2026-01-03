#!/usr/bin/env python3
"""
Database Name Detector for Odoo
Helps find the correct database name for your Odoo instance
"""

import xmlrpc.client
import sys

ODOO_URL = 'http://localhost:8069'

def list_databases():
    """List all available databases"""
    try:
        db = xmlrpc.client.ServerProxy(f'{ODOO_URL}/xmlrpc/2/db')
        databases = db.list()
        return databases
    except Exception as e:
        print(f"❌ Error connecting to Odoo: {e}")
        return None

def main():
    print("=" * 60)
    print("🔍 Odoo Database Detector")
    print("=" * 60)
    print(f"\nConnecting to: {ODOO_URL}")
    
    databases = list_databases()
    
    if databases is None:
        print("\n❌ Could not connect to Odoo!")
        print("\nTroubleshooting:")
        print("1. Make sure Odoo is running:")
        print("   ./odoo-bin -c odoo.conf")
        print("\n2. Check if Odoo is accessible:")
        print(f"   curl {ODOO_URL}")
        print("\n3. Verify the URL is correct (default: http://localhost:8069)")
        sys.exit(1)
    
    if not databases:
        print("\n⚠️  No databases found!")
        print("\nYou need to create a database first:")
        print(f"1. Open {ODOO_URL} in your browser")
        print("2. Click 'Create Database'")
        print("3. Enter a name (e.g., 'odoo_db' or 'dayflow_db')")
        print("4. Set master password and admin password")
        print("5. Click 'Create Database'")
        sys.exit(1)
    
    print(f"\n✅ Found {len(databases)} database(s):\n")
    for i, db_name in enumerate(databases, 1):
        print(f"  {i}. {db_name}")
    
    print("\n" + "=" * 60)
    print("📝 Update your demo data script:")
    print("=" * 60)
    print(f"\nEdit: scripts/generate_demo_data.py")
    print(f"Change line 15 to:")
    print(f"\n  ODOO_DB = '{databases[0]}'")
    print("\n" + "=" * 60)
    
    # Also check what's in the frontend config
    print("\n💡 Also check your frontend configuration:")
    print("   dayflow-frontend/src/services/odoo.ts")
    print(f"   Make sure DB_NAME = '{databases[0]}'")
    print("\n" + "=" * 60)

if __name__ == '__main__':
    main()
