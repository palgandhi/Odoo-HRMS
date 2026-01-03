# Dayflow - Human Resource Management System

## 🎯 Hackathon Project - Odoo HRMS

A comprehensive Human Resource Management System built with Odoo framework.

## 📋 Core Features

### 1. Employee Management Module
- Add, edit, and delete employee records
- Store employee details (name, contact, department, position, salary)
- Employee profile management
- Search and filter functionality

### 2. Attendance Tracking
- Daily attendance marking (check-in/check-out)
- Attendance history and reports
- Leave management integration
- Real-time attendance dashboard

### 3. Payroll Management
- Salary calculation based on attendance
- Deductions and bonuses
- Payslip generation
- Monthly/yearly payroll reports

### 4. Leave Management
- Leave application system
- Leave approval workflow
- Leave balance tracking
- Multiple leave types (sick, casual, earned)

### 5. Performance Tracking
- Performance review system
- Goal setting and tracking
- Feedback mechanism
- Performance reports and analytics

## 🛠️ Tech Stack

- **Framework:** Odoo 17
- **Backend:** Python 3.11
- **Database:** PostgreSQL
- **Frontend:** Odoo Web Framework (XML/JS/OWL)

## 🚀 Installation

### Prerequisites
- Python 3.11+
- PostgreSQL
- pip

### Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/palgandhi/Odoo-HRMS.git
cd Odoo-HRMS
```

2. Install Odoo and dependencies:
```bash
pip install -r requirements.txt
```

3. Start PostgreSQL service

4. Run Odoo:
```bash
python3 odoo-bin --addons-path=addons,custom_addons -d dayflow_db
```

## 📁 Project Structure

```
Odoo-HRMS/
├── custom_addons/
│   └── dayflow_hrms/          # Main custom module
│       ├── models/            # Database models
│       ├── views/             # UI views
│       ├── security/          # Access rights
│       ├── data/              # Demo/default data
│       └── __manifest__.py    # Module configuration
├── requirements.txt
└── README.md
```

## 👥 Team

Built for Odoo Hackathon 2026

## 📄 License

MIT License
