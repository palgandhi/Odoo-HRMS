#!/bin/bash

# Dayflow HRMS - Odoo Shell Wrapper
# Usage: ./shell.sh

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ODOO_SOURCE="$HOME/odoo"
DB_NAME="dayflow_db"

if [ ! -d "$ODOO_SOURCE" ]; then
    echo "❌ Odoo source not found at $ODOO_SOURCE"
    exit 1
fi

echo "🐚 Launching Odoo Shell for '$DB_NAME'..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💡 Cheatsheet:"
echo "   1. Count Employees:  env['hr.employee'].search_count([])"
echo "   2. List Users:       env['res.users'].search([]).mapped('name')"
echo "   3. Find Admin:       admin = env.ref('base.user_admin')"
echo "   4. Commit Changes:   env.cr.commit()   (Important if you write data!)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd "$ODOO_SOURCE" || exit
# We use the same addons path so we can access our custom models (Performance, Payroll)
python3 odoo-bin shell --addons-path=addons,"$PROJECT_ROOT/custom_addons" -d "$DB_NAME"
