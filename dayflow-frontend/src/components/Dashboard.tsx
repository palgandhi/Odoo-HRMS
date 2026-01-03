import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Settings, LogOut, Menu, Bell, Search, LayoutDashboard, Zap, Users, Calendar, Briefcase, DollarSign, BarChart, UserCircle
} from 'lucide-react';

import type { UserSession } from '../App';
import EmployeeList from './Employees/EmployeeList';
import AttendanceView from './Attendance/AttendanceView';
import LeaveView from './Leave/LeaveView';
import PerformanceView from './Performance/PerformanceView';
import PayrollView from './Payroll/PayrollView';
import ProfileView from './Profile/ProfileView';
import NotificationDropdown from './ui/NotificationDropdown';
import { NotificationService, type Notification } from '../services/NotificationService';
import AnalyticsView from './Analytics/AnalyticsView';

// Define the navigation items
const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics', icon: BarChart },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'leave', label: 'Leave', icon: Briefcase },
    { id: 'payroll', label: 'Payroll', icon: DollarSign },
    { id: 'performance', label: 'Performance', icon: BarChart },
    { id: 'profile', label: 'My Profile', icon: UserCircle },
];

interface DashboardProps {
    session: UserSession;
    onLogout: () => void;
}

export default function Dashboard({ session, onLogout }: DashboardProps) {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Fetch notifications on mount and every 30 seconds
    useEffect(() => {
        const fetchNotifications = async () => {
            const notifs = await NotificationService.fetchNotifications(session);
            setNotifications(notifs);
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Refresh every 30 seconds

        return () => clearInterval(interval);
    }, [session]);

    const handleMarkAsRead = (id: string) => {
        setNotifications(NotificationService.markAsRead(id, notifications));
    };

    const handleMarkAllAsRead = () => {
        setNotifications(NotificationService.markAllAsRead(notifications));
    };

    const handleNotificationClick = (notification: Notification) => {
        // Navigate based on notification type
        if (notification.type === 'leave_request' || notification.type === 'leave_approved' || notification.type === 'leave_rejected') {
            setActiveTab('leave');
        } else if (notification.type === 'review_due') {
            setActiveTab('performance');
        } else if (notification.type === 'attendance_alert') {
            setActiveTab('attendance');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isSidebarOpen ? 280 : 80 }}
                className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex-shrink-0 relative z-20 flex flex-col transition-all duration-300 shadow-2xl border-r border-white/5"
            >
                <div className="h-24 flex items-center px-6 border-b border-white/10">
                    <div className={`font-bold text-2xl flex items-center ${!isSidebarOpen && 'justify-center w-full'}`}>
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-indigo-500/20">
                            <span className="text-xl font-bold text-white">D</span>
                        </div>
                        {isSidebarOpen && (
                            <div className="flex flex-col">
                                <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent tracking-tight">Dayflow</span>
                                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">Enterprise</span>
                            </div>
                        )}
                    </div>
                </div>

                <nav className="flex-1 py-8 space-y-2 px-4">
                    {NAV_ITEMS.map((item) => {
                        if (item.id === 'employees' && !session.isAdmin) return null;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${activeTab === item.id
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 relative z-10 ${isSidebarOpen ? 'mr-4' : 'mx-auto'} ${activeTab === item.id ? 'text-indigo-100' : 'text-slate-500 group-hover:text-white transition-colors'}`} />
                                {isSidebarOpen && <span className="font-medium relative z-10">{item.label}</span>}

                                {/* Hover Effect */}
                                {activeTab !== item.id && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/10 mx-4 mb-4">
                    <button
                        onClick={onLogout}
                        className={`w-full flex items-center px-4 py-3 text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all ${!isSidebarOpen && 'justify-center'}`}
                    >
                        <LogOut className={`w-5 h-5 ${isSidebarOpen ? 'mr-4' : ''}`} />
                        {isSidebarOpen && <span className="font-medium">Logout</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50">
                {/* Header */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-8 z-10 sticky top-0">
                    <button
                        onClick={() => setSidebarOpen(!isSidebarOpen)}
                        className="p-2 hover:bg-slate-100/80 rounded-xl text-slate-600 transition-colors"
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    <div className="flex items-center flex-1 max-w-2xl mx-8">
                        <div className="w-full relative group">
                            <Search className="absolute left-4 top-3 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search employees, documents..."
                                className="w-full pl-12 pr-4 py-3 bg-slate-100/50 border-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 rounded-2xl transition-all outline-none text-sm font-medium"
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-6">
                        <NotificationDropdown
                            notifications={notifications}
                            onMarkAsRead={handleMarkAsRead}
                            onMarkAllAsRead={handleMarkAllAsRead}
                            onNotificationClick={handleNotificationClick}
                        />
                        <div className="flex items-center cursor-pointer pl-6 border-l border-slate-200">
                            <div className="text-right mr-4 hidden md:block">
                                <p className="text-sm font-bold text-slate-900">{session.username}</p>
                                <p className="text-xs text-indigo-600 font-medium">Administrator</p>
                            </div>
                            <div
                                onClick={() => setActiveTab('profile')}
                                className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl shadow-md border-2 border-white flex items-center justify-center text-white font-bold text-sm hover:scale-105 active:scale-95 transition-transform"
                                title="Go to Profile"
                            >
                                {session.username.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Render Area */}
                <main className="flex-1 overflow-y-auto p-8 relative">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:16px_16px]" />

                    <div className="max-w-7xl mx-auto relative z-10">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
                                    {NAV_ITEMS.find(item => item.id === activeTab)?.label}
                                </h1>
                                <p className="text-slate-500 mt-1">
                                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                        </div>

                        {/* Content Switcher */}
                        <div className="grid gap-8">
                            {activeTab === 'dashboard' && <DashboardStats session={session} setActiveTab={setActiveTab} />}
                            {activeTab === 'analytics' && <AnalyticsView session={session} />}
                            {activeTab === 'employees' && <EmployeeList session={session} />}
                            {activeTab === 'attendance' && <AttendanceView session={session} />}
                            {activeTab === 'leave' && <LeaveView session={session} />}
                            {activeTab === 'payroll' && <PayrollView session={session} />}
                            {activeTab === 'performance' && <PerformanceView session={session} />}
                            {activeTab === 'profile' && <ProfileView session={session} />}

                            {activeTab !== 'dashboard' && activeTab !== 'analytics' && activeTab !== 'employees' && activeTab !== 'attendance' && activeTab !== 'leave' && activeTab !== 'performance' && activeTab !== 'payroll' && activeTab !== 'profile' && (
                                <div className="bg-white rounded-3xl p-20 text-center border border-slate-100 shadow-sm">
                                    <div className="w-24 h-24 bg-slate-50 rounded-full mx-auto flex items-center justify-center mb-6">
                                        <Settings className="w-10 h-10 text-slate-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">Coming Soon</h3>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div >
        </div >
    );
}

// Real Stats Component
import { executeKw } from '../services/odoo';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

function DashboardStats({ session, setActiveTab }: { session: UserSession; setActiveTab: (t: string) => void }) {
    const [stats, setStats] = useState({
        employees: 0,
        present: 0,
        leave: 0,
        pending: 0,
        loading: true
    });
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const totalEmp = await executeKw(session.uid, session.password, 'hr.employee', 'search_count', [[]]);
                const present = await executeKw(session.uid, session.password, 'hr.attendance', 'search_count', [[['check_out', '=', false]]]);

                const now = new Date();
                const todayStr = now.toISOString().split('T')[0];
                const onLeave = await executeKw(session.uid, session.password, 'hr.leave', 'search_count',
                    [[['state', '=', 'validate'], ['date_from', '<=', todayStr], ['date_to', '>=', todayStr]]]
                );
                const myPending = await executeKw(session.uid, session.password, 'hr.leave', 'search_count',
                    [[['state', '=', 'confirm'], ['user_id', '=', session.uid]]]
                );

                setStats({ employees: totalEmp, present, leave: onLeave, pending: myPending, loading: false });

                const days = [];
                for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(now.getDate() - i);
                    days.push(d);
                }
                const chartPromises = days.map(async (date) => {
                    const start = new Date(date);
                    start.setHours(0, 0, 0, 0);
                    const end = new Date(date);
                    end.setHours(23, 59, 59, 999);
                    const startStr = start.toISOString().replace('T', ' ').split('.')[0];
                    const endStr = end.toISOString().replace('T', ' ').split('.')[0];
                    const count = await executeKw(session.uid, session.password, 'hr.attendance', 'search_count',
                        [[['check_in', '>=', startStr], ['check_in', '<=', endStr]]]
                    );
                    return { name: date.toLocaleDateString('en-US', { weekday: 'short' }), value: count };
                });
                setChartData(await Promise.all(chartPromises));

            } catch (err) {
                console.error(err);
                setStats(prev => ({ ...prev, loading: false }));
            }
        };
        fetchStats();
    }, [session]);

    if (stats.loading) return <div className="p-12 text-center text-slate-400 font-medium animate-pulse">Loading dashboard...</div>;

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

    const activePct = stats.employees > 0 ? Math.round((stats.present / stats.employees) * 100) : 0;
    const ringData = [
        { name: 'Present', value: stats.present, color: '#10b981' },
        { name: 'Absent', value: stats.employees - stats.present, color: '#f1f5f9' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* CLEAN HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
                        {greeting}, {session.username.split('.')[0]}
                    </h1>
                    <p className="text-slate-500 mt-2">
                        Here's what's happening in your workspace today.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setActiveTab('leave')}
                        className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <Briefcase className="w-4 h-4" /> Request Leave
                    </button>
                    {session.isAdmin && (
                        <button
                            onClick={() => setActiveTab('employees')}
                            className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-200"
                        >
                            <Users className="w-4 h-4" /> Add Employee
                        </button>
                    )}
                </div>
            </div>

            {/* KEY METRICS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                    <div>
                        <p className="text-slate-500 font-medium text-sm mb-1">Total Present</p>
                        <h3 className="text-3xl font-bold text-slate-900">{stats.present} <span className="text-lg text-slate-400 font-medium">/ {stats.employees}</span></h3>
                        <div className="mt-2 text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-full w-fit">
                            {activePct}% Active
                        </div>
                    </div>
                    <div className="w-16 h-16 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={ringData} innerRadius={20} outerRadius={32} dataKey="value" stroke="none">
                                    {ringData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                    <div>
                        <p className="text-slate-500 font-medium text-sm mb-1">On Leave</p>
                        <h3 className="text-3xl font-bold text-slate-900">{stats.leave}</h3>
                        <p className="text-xs font-medium text-slate-400 mt-2">Valid leaves today</p>
                    </div>
                    <div className="p-4 bg-orange-50 text-orange-500 rounded-2xl">
                        <Briefcase className="w-8 h-8" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all cursor-pointer" onClick={() => setActiveTab('leave')}>
                    <div>
                        <p className="text-slate-500 font-medium text-sm mb-1">Pending Requests</p>
                        <h3 className="text-3xl font-bold text-slate-900">{stats.pending}</h3>
                        <p className="text-xs font-medium text-indigo-500 mt-2 group-hover:underline">Click to review →</p>
                    </div>
                    <div className="p-4 bg-indigo-50 text-indigo-500 rounded-2xl">
                        <Bell className="w-8 h-8" />
                    </div>
                </div>
            </div>

            {/* CHART & STATUS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-900">Attendance Trends</h3>
                        <div className="flex gap-2 items-center">
                            <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                            <span className="text-xs font-bold text-slate-400">Check-ins</span>
                        </div>
                    </div>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} dy={10} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[2rem] text-white flex flex-col justify-between shadow-xl shadow-slate-200">
                    <div>
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6">
                            <Zap className="w-6 h-6 text-yellow-400 fill-current" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">System Status</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Everything is running smoothly. All modules are active and synced with Odoo.
                        </p>
                    </div>
                    <div className="mt-8 pt-6 border-t border-white/10">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">Database</span>
                            <span className="font-mono font-bold text-emerald-400">CONNECTED</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
