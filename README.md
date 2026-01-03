# 🚀 Dayflow HRMS - Intelligent Human Resource Management System

[![Odoo](https://img.shields.io/badge/Odoo-17.0-purple?style=flat-square)](https://www.odoo.com/)
[![React](https://img.shields.io/badge/React-18-blue?style=flat-square)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

> A modern, intelligent HRMS built for the Odoo Hackathon 2026 with real-time notifications, advanced analytics, and a premium user experience.

---

## ✨ Features

### 🎯 Core Features
- ✅ **Employee Management** - Complete profile management with digital ID cards
- ✅ **Attendance Tracking** - Check-in/out with mood tracking and team views
- ✅ **Leave Management** - Request, approve, and track time-off with smart validation
- ✅ **Payroll System** - Generate payslips with detailed breakdowns (INR)
- ✅ **Performance Reviews** - Track and manage employee performance with ratings

### 🚀 Advanced Features
- 🔔 **Real-Time Notifications** - Auto-refreshing notifications with persistent read state
- 📊 **Analytics Dashboard** - 5 interactive charts with time-range selection
- 🎨 **Premium UI/UX** - Modern design with smooth animations and glassmorphism
- 🇮🇳 **Indian Localization** - Currency in INR (₹), realistic Indian salaries

---

## 🏗️ Architecture

### Backend (Odoo 17)
- **Framework**: Odoo 17 (Python)
- **Database**: PostgreSQL
- **API**: XML-RPC
- **Custom Modules**:
  - `dayflow_hrms` - Core HR functionality
  - `dayflow_payroll` - Payroll management
  - `dayflow_performance` - Performance reviews

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Odoo 17

### Backend Setup

1. **Install Odoo dependencies**:
```bash
pip install -r requirements.txt
```

2. **Start Odoo server**:
```bash
./odoo-bin -c odoo.conf
```

3. **Access Odoo**:
- URL: `http://localhost:8069`
- Create database: `dayflow_db`
- Install custom modules

### Frontend Setup

1. **Install dependencies**:
```bash
cd dayflow-frontend
npm install
```

2. **Start dev server**:
```bash
npm run dev
```

3. **Access app**:
- URL: `http://localhost:5173`

### Demo Data Setup

```bash
# Generate demo data (10 employees, attendance, payroll, etc.)
python3 scripts/generate_demo_data.py

# Add yourself as an employee
python3 scripts/add_pal_gandhi.py
```

---

## 👤 Demo Accounts

### Admin Account
- **Email**: `admin`
- **Password**: `admin`
- **Access**: Full system access

### Employee Account
- **Email**: `palgandhi@icloud.com`
- **Password**: `password123`
- **Access**: Employee features

---

## 📊 Demo Data

The system includes realistic demo data:
- **10 Employees** across 6 departments
- **Attendance Records** - Last 7 days
- **Payslips** - 3 months history (₹6.25L - ₹8.75L LPA)
- **Performance Reviews** - Q4 2025 with ratings
- **Leave Allocations** - 20 days per type
- **Pending Leaves** - For notification testing

---

## 🎯 Key Highlights

### 1. Real-Time Notifications 🔔
- Auto-refresh every 30 seconds
- Persistent read state (localStorage)
- Priority-based sorting
- Click-to-navigate
- Role-based filtering (Manager vs Employee)

### 2. Analytics Dashboard 📊
- **Attendance Trend** - Area chart (7/30/90 days)
- **Leave Distribution** - Pie chart by type
- **Department Headcount** - Bar chart
- **Top Performers** - Leaderboard with ratings
- **Key Metrics** - Live employee count, salary, performance

### 3. Premium UI/UX 🎨
- Modern glassmorphism design
- Smooth Framer Motion animations
- Responsive layouts
- Color-coded status indicators
- Interactive charts

### 4. Smart Features 🧠
- Leave overlap validation
- Automatic state transitions
- Real-time data sync
- Error handling with user-friendly messages

---

## 📁 Project Structure

```
dayflow/
├── custom_addons/          # Odoo custom modules
│   ├── dayflow_hrms/       # Core HR module
│   ├── dayflow_payroll/    # Payroll module
│   └── dayflow_performance/# Performance module
├── dayflow-frontend/       # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   └── App.tsx         # Main app
│   └── package.json
├── scripts/                # Utility scripts
│   ├── generate_demo_data.py
│   ├── add_pal_gandhi.py
│   └── clean_leaves.py
├── docs/                   # Documentation
│   ├── HACKATHON_READY.md
│   ├── SUBMISSION_SUMMARY.md
│   └── ...
├── odoo.conf              # Odoo configuration
└── README.md              # This file
```

---

## 🛠️ Development

### Frontend Development
```bash
cd dayflow-frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Backend Development
```bash
# Restart Odoo with auto-reload
./odoo-bin -c odoo.conf --dev=all

# Update modules
./odoo-bin -c odoo.conf -u dayflow_hrms,dayflow_payroll,dayflow_performance
```

### Utility Scripts
```bash
# Generate demo data
python3 scripts/generate_demo_data.py

# Clean old leaves
python3 scripts/clean_leaves.py

# Add employee
python3 scripts/add_pal_gandhi.py

# Detect database
python3 scripts/detect_database.py
```

---

## 🎬 Demo Flow

1. **Login** → See dashboard with metrics
2. **Notifications** → Bell shows pending leaves (3)
3. **Analytics** → View charts with real data
4. **Attendance** → Check-in/out with mood
5. **Leave** → Request leave, approve as manager
6. **Payroll** → View payslips in INR (₹)
7. **Performance** → View reviews and ratings

---

## 🏆 Hackathon Features

### What Makes Dayflow Stand Out:
1. ✅ **All Requirements Met** + 2 future enhancements
2. ✅ **Real-Time Notifications** - Auto-refresh, persistent state
3. ✅ **Advanced Analytics** - 5 chart types, time-range selection
4. ✅ **Premium UI** - Better than default Odoo
5. ✅ **Real Odoo Integration** - Not mocked data
6. ✅ **Indian Localization** - INR currency, realistic salaries

---

## 📚 Documentation

- [Hackathon Submission](docs/SUBMISSION_SUMMARY.md)
- [Demo Setup Guide](docs/DEMO_SETUP.md)
- [Notifications System](docs/NOTIFICATIONS_SYSTEM.md)
- [UI Enhancements](docs/UI_ENHANCEMENTS.md)
- [Fixes Applied](docs/FIXES_APPLIED.md)

---

## 🐛 Troubleshooting

### Currency shows $ instead of ₹
```bash
# Hard refresh browser
Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
```

### Leave approval doesn't work
```bash
# Check browser console for errors
# Ensure leave is in "confirm" state
# Verify employee has leave allocation
```

### Database connection error
```bash
# Detect correct database name
python3 scripts/detect_database.py
```

---

## 🤝 Contributing

This project was built for the Odoo Hackathon 2026. Contributions are welcome!

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 👨‍💻 Author

**Pal Gandhi**
- Email: palgandhi@icloud.com
- Project: Dayflow HRMS
- Hackathon: Odoo Hackathon 2026

---

## 🙏 Acknowledgments

- Odoo Community for the amazing framework
- React Team for the excellent library
- All open-source contributors

---

**Built with ❤️ for Odoo Hackathon 2026** 🚀
