import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Calendar, Briefcase, BarChart, DollarSign,
    Settings, LogOut, Menu, Bell, Search, LayoutDashboard
} from 'lucide-react';
import type { UserSession } from '../App';
import EmployeeList from './Employees/EmployeeList';
import AttendanceView from './Attendance/AttendanceView';
import LeaveView from './Leave/LeaveView';
import PerformanceView from './Performance/PerformanceView';
import PayrollView from './Payroll/PayrollView';

// Define the navigation items
const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'leave', label: 'Leave', icon: Briefcase },
    { id: 'payroll', label: 'Payroll', icon: DollarSign },
    { id: 'performance', label: 'Performance', icon: BarChart },
];

interface DashboardProps {
    session: UserSession;
    onLogout: () => void;
}

export default function Dashboard({ session, onLogout }: DashboardProps) {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isSidebarOpen ? 280 : 80 }}
                className="bg-slate-900 text-white flex-shrink-0 relative z-20 flex flex-col transition-all duration-300 shadow-xl"
            >
                <div className="h-20 flex items-center px-6 border-b border-slate-800">
                    <div className={`font-bold text-2xl flex items-center ${!isSidebarOpen && 'justify-center w-full'}`}>
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-lg font-bold">D</span>
                        </div>
                        {isSidebarOpen && <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Dayflow</span>}
                    </div>
                </div>

                <nav className="flex-1 py-6 space-y-2 px-3">
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center px-4 py-3.5 rounded-xl transition-all ${activeTab === item.id
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 ${isSidebarOpen ? 'mr-4' : 'mx-auto'}`} />
                            {isSidebarOpen && <span className="font-medium">{item.label}</span>}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={onLogout}
                        className={`w-full flex items-center px-4 py-3 text-slate-400 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-colors ${!isSidebarOpen && 'justify-center'}`}
                    >
                        <LogOut className={`w-5 h-5 ${isSidebarOpen ? 'mr-4' : ''}`} />
                        {isSidebarOpen && <span className="font-medium">Logout</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 shadow-sm">
                    <button
                        onClick={() => setSidebarOpen(!isSidebarOpen)}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    <div className="flex items-center flex-1 max-w-xl mx-8">
                        <div className="w-full relative">
                            <Search className="absolute left-4 top-3 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search employees, documents..."
                                className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl transition-all outline-none text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-6">
                        <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
                            <Bell className="w-6 h-6 text-slate-600" />
                            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity">
                            <div className="text-right mr-4 hidden md:block">
                                <p className="text-sm font-bold text-slate-900">{session.username}</p>
                                <p className="text-xs text-slate-500">Administrator</p>
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-green-500 rounded-full border-2 border-white shadow-md"></div>
                        </div>
                    </div>
                </header>

                {/* Content Render Area */}
                <main className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between mb-8">
                            <h1 className="text-3xl font-bold text-slate-900">
                                {NAV_ITEMS.find(item => item.id === activeTab)?.label}
                            </h1>
                            <div className="text-sm text-slate-500">
                                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                        </div>

                        {/* Content Switcher */}
                        <div className="grid gap-6">
                            {activeTab === 'dashboard' && <DashboardStats session={session} />}
                            {activeTab === 'employees' && <EmployeeList session={session} />}
                            {activeTab === 'attendance' && <AttendanceView session={session} />}
                            {activeTab === 'leave' && <LeaveView session={session} />}
                            {activeTab === 'payroll' && <PayrollView session={session} />}
                            {activeTab === 'performance' && <PerformanceView session={session} />}

                            {activeTab !== 'dashboard' && activeTab !== 'employees' && activeTab !== 'attendance' && activeTab !== 'leave' && activeTab !== 'performance' && activeTab !== 'payroll' && (
                                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 border-dashed">
                                    <div className="w-20 h-20 bg-slate-50 rounded-full mx-auto flex items-center justify-center mb-6">
                                        <Settings className="w-10 h-10 text-slate-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">Work in Progress</h3>
                                    <p className="text-slate-500 max-w-md mx-auto">
                                        The {NAV_ITEMS.find(item => item.id === activeTab)?.label} module is being connected to the Odoo backend.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

// Real Stats Component
import { executeKw } from '../services/odoo';

function DashboardStats({ session }: { session: UserSession }) {
    const [stats, setStats] = useState({
        employees: 0,
        present: 0,
        leave: 0,
        pending: 0,
        loading: true
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // 1. Total Employees
                const totalEmp = await executeKw(session.uid, session.password, 'hr.employee', 'search_count', [[]]);

                // 2. Present Today (Active Check-ins)
                const present = await executeKw(session.uid, session.password, 'hr.attendance', 'search_count', [[['check_out', '=', false]]]);

                // 3. On Leave (Date range overlap)
                const now = new Date().toISOString().split('T')[0];
                const onLeave = await executeKw(session.uid, session.password, 'hr.leave', 'search_count',
                    [[['state', '=', 'validate'], ['date_from', '<=', now], ['date_to', '>=', now]]]
                );

                // 4. Pending Requests
                const pending = await executeKw(session.uid, session.password, 'hr.leave', 'search_count', [[['state', '=', 'confirm']]]);

                setStats({
                    employees: totalEmp,
                    present: present,
                    leave: onLeave,
                    pending: pending,
                    loading: false
                });
            } catch (err) {
                console.error(err);
                setStats(prev => ({ ...prev, loading: false }));
            }
        };

        fetchStats();
    }, [session]);

    if (stats.loading) return <div className="p-12 text-center text-slate-400">Loading Dashboard...</div>;

    const cards = [
        { label: 'Total Employees', value: stats.employees.toString(), color: 'blue' },
        { label: 'Present Today', value: stats.present.toString(), color: 'green', sub: stats.employees > 0 ? `${Math.round((stats.present / stats.employees) * 100)}%` : '0%' },
        { label: 'On Leave', value: stats.leave.toString(), color: 'orange' },
        { label: 'Pending Requests', value: stats.pending.toString(), color: 'purple' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((stat, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
                >
                    <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                    <div className="mt-4 flex items-baseline">
                        <span className="text-3xl font-bold text-slate-900">{stat.value}</span>
                        {stat.sub && <span className="ml-2 text-sm text-green-500 font-medium">{stat.sub}</span>}
                    </div>
                </motion.div>
            ))}

            {/* Chart Section - Keeping Placeholder for now as charting lib requires more setup */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="col-span-1 lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-96 flex flex-col justify-center items-center text-center"
            >
                <BarChart className="w-12 h-12 text-slate-200 mb-4" />
                <h3 className="text-lg font-bold text-slate-700">Analytics Dashboard</h3>
                <p className="text-slate-400">Activity visualization coming in v2.0</p>
            </motion.div>

            {/* Activity Feed */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
            >
                <h3 className="font-bold text-slate-900 mb-4">Live Updates</h3>
                <div className="space-y-6">
                    <div className="flex gap-4">
                        <div className="w-2 h-2 mt-2 rounded-full bg-green-500 shrink-0" />
                        <div>
                            <p className="text-xs text-slate-400">Just Now</p>
                            <p className="text-sm text-slate-600 mt-1">Dashboard data synced with <span className="font-bold">Odoo Backend</span>.</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
