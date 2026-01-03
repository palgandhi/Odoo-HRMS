# Dayflow HRMS

Complete Human Resource Management System built on Odoo 17.

## Features

**Employee Management**
- Employee records with comprehensive details
- Employment status tracking
- Department and position management

**Attendance System**
- Check-in/check-out tracking
- Automatic late detection
- Overtime calculation
- Attendance reports

**Leave Management**
- Leave applications and approvals
- Multiple leave types
- Half-day leave support
- Leave balance tracking

**Payroll**
- Attendance-based salary calculation
- Overtime pay (1.5x rate)
- Bonuses and deductions
- Automated payslip generation

**Performance Reviews**
- Multi-criteria performance ratings
- Goal setting and tracking
- Employee feedback system
- Performance analytics

## Installation

See [INSTALLATION.md](INSTALLATION.md) for detailed setup instructions.

Quick start:
```bash
# Install dependencies
pip install -r requirements.txt

# Run Odoo
python3 odoo-bin --addons-path=addons,custom_addons -d dayflow_db -i dayflow_hrms
```

## Tech Stack

- Odoo 17
- Python 3.11
- PostgreSQL

## License

MIT
