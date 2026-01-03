#!/bin/bash

# Dayflow HRMS - Development Launcher
# Usage: ./start-full.sh

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ODOO_SOURCE="$HOME/odoo" # Adjust if your Odoo source is elsewhere

echo "🚀 Starting Dayflow HRMS..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. Start PostgreSQL (MacOS specific, nice to keep for dev convenience)
if command -v brew &> /dev/null; then
    if brew services list | grep postgresql | grep started > /dev/null; then
        echo "✅ PostgreSQL is running"
    else
        echo "⚠️  Starting PostgreSQL..."
        brew services start postgresql@15
        sleep 2
    fi
fi

# 2. Start Odoo Backend
if [ ! -d "$ODOO_SOURCE" ]; then
    echo "❌ Odoo source not found at $ODOO_SOURCE"
    echo "   Please update script or link odoo source."
    exit 1
fi

echo "🔧 Starting Odoo Backend (Port 8069)..."
cd "$ODOO_SOURCE" || exit
# Using relative path for custom_addons based on PROJECT_ROOT
python3 odoo-bin --addons-path=addons,"$PROJECT_ROOT/custom_addons" -d dayflow_db --http-port=8069 > /dev/null 2>&1 &
ODOO_PID=$!
echo "✅ Odoo running (PID: $ODOO_PID)"

# 3. Start React Frontend
echo ""
echo "🎨 Starting React Frontend..."
echo "📍 App URL: http://localhost:5173"
echo ""

cd "$PROJECT_ROOT/dayflow-frontend" || exit
npm run dev

# Cleanup
kill $ODOO_PID
echo "🛑 Stopped Odoo Server"
