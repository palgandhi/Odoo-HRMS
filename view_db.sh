#!/bin/bash

# Dayflow HRMS Database Viewer

echo "🗄️  Dayflow HRMS Database Viewer"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

DB_NAME="dayflow_db"
PSQL="/opt/homebrew/opt/postgresql@15/bin/psql"

# Check if database exists
if ! $PSQL -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    echo "❌ Database '$DB_NAME' not found!"
    echo "Run ./start.sh first to create the database"
    exit 1
fi

echo "✅ Connected to database: $DB_NAME"
echo ""

# Main menu
while true; do
    echo "Choose an option:"
    echo "1. View all HR tables"
    echo "2. Count employees"
    echo "3. View recent attendance"
    echo "4. View leave requests"
    echo "5. View performance reviews"
    echo "6. Database statistics"
    echo "7. Open psql console"
    echo "8. Exit"
    echo ""
    read -p "Enter choice (1-8): " choice

    case $choice in
        1)
            echo ""
            echo "📊 HR Tables:"
            $PSQL $DB_NAME -c "\dt" | grep -E "hr_" | head -30
            echo ""
            ;;
        2)
            echo ""
            echo "👥 Employee Count:"
            $PSQL $DB_NAME -c "SELECT COUNT(*) as total_employees FROM hr_employee WHERE active=true;"
            echo ""
            ;;
        3)
            echo ""
            echo "⏰ Recent Attendance (Last 10):"
            $PSQL $DB_NAME -c "SELECT e.name as employee, a.check_in, a.check_out, a.worked_hours FROM hr_attendance a JOIN hr_employee e ON a.employee_id = e.id ORDER BY a.check_in DESC LIMIT 10;"
            echo ""
            ;;
        4)
            echo ""
            echo "🏖️  Leave Requests:"
            $PSQL $DB_NAME -c "SELECT COUNT(*) as total_leaves FROM hr_leave;"
            echo ""
            ;;
        5)
            echo ""
            echo "⭐ Performance Reviews:"
            $PSQL $DB_NAME -c "SELECT tablename FROM pg_tables WHERE tablename LIKE '%performance%';"
            echo ""
            ;;
        6)
            echo ""
            echo "📈 Database Statistics:"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            $PSQL $DB_NAME -c "SELECT pg_size_pretty(pg_database_size('$DB_NAME')) as database_size;"
            $PSQL $DB_NAME -c "SELECT COUNT(*) as total_tables FROM pg_tables WHERE schemaname='public';"
            echo ""
            ;;
        7)
            echo ""
            echo "🔧 Opening psql console..."
            echo "Type '\q' to exit psql and return to this menu"
            echo ""
            $PSQL $DB_NAME
            echo ""
            ;;
        8)
            echo ""
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo ""
            echo "❌ Invalid choice. Please enter 1-8"
            echo ""
            ;;
    esac
done
