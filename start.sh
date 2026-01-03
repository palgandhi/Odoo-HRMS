#!/bin/bash

# Dayflow HRMS Startup Script

echo "🚀 Starting Dayflow HRMS..."
echo ""

# Check if PostgreSQL is running
echo "📊 Checking PostgreSQL..."
if brew services list | grep postgresql@15 | grep started > /dev/null; then
    echo "✅ PostgreSQL is running"
else
    echo "⚠️  PostgreSQL not running. Starting..."
    brew services start postgresql@15
    sleep 2
    echo "✅ PostgreSQL started"
fi

echo ""
echo "🔧 Starting Odoo server..."
echo "📍 Server will be available at: http://localhost:8069"
echo "🔑 Default login: admin@dayflow.com / admin"
echo ""
echo "Press Ctrl+C to stop the server"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start Odoo
cd ~/odoo
python3 odoo-bin --addons-path=addons,/Users/palgandhi/Desktop/Odoo/custom_addons -d dayflow_db --http-port=8069
