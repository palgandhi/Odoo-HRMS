#!/bin/bash

# Dayflow HRMS Full Stack Launcher

echo "🚀 Starting Dayflow HRMS (Full Stack)..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. Start PostgreSQL
echo "📊 Checking PostgreSQL..."
if brew services list | grep postgresql@15 | grep started > /dev/null; then
    echo "✅ PostgreSQL is running"
else
    echo "⚠️  PostgreSQL not running. Starting..."
    brew services start postgresql@15
    sleep 2
    echo "✅ PostgreSQL started"
fi

# 2. Start Odoo Backend (in background)
echo ""
echo "🔧 Starting Odoo Backend (Port 8069)..."
cd ~/odoo
python3 odoo-bin --addons-path=addons,/Users/palgandhi/Desktop/Odoo/custom_addons -d dayflow_db --http-port=8069 > /dev/null 2>&1 &
ODOO_PID=$!
echo "✅ Odoo running (PID: $ODOO_PID)"

# 3. Start React Frontend
echo ""
echo "🎨 Starting React Frontend (Port 5173)..."
echo "📍 Access your app at: http://localhost:5173"
echo ""

cd /Users/palgandhi/Desktop/Odoo/dayflow-frontend
npm run dev

# Cleanup when frontend stops
kill $ODOO_PID
echo "🛑 Stopped Odoo Server"
