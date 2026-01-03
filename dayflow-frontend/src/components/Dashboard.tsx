import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Settings, LogOut, Menu, Bell, Search, LayoutDashboard, Zap, Activity, Users, Calendar, Briefcase, DollarSign, BarChart, UserCircle
} from 'lucide-react';

import type { UserSession } from '../App';
import EmployeeList from './Employees/EmployeeList';
import AttendanceView from './Attendance/AttendanceView';
import LeaveView from './Leave/LeaveView';
import PerformanceView from './Performance/PerformanceView';
import PayrollView from './Payroll/PayrollView';
import ProfileView from './Profile/ProfileView';

// Define the navigation items
const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
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
                        <button className="relative p-2.5 hover:bg-slate-100 rounded-xl transition-colors">
                            <Bell className="w-6 h-6 text-slate-600" />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                        </button>
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
                            {activeTab === 'dashboard' && <DashboardStats session={session} />}
                            {activeTab === 'employees' && <EmployeeList session={session} />}
                            {activeTab === 'attendance' && <AttendanceView session={session} />}
                            {activeTab === 'leave' && <LeaveView session={session} />}
                            {activeTab === 'payroll' && <PayrollView session={session} />}
                            {activeTab === 'performance' && <PerformanceView session={session} />}
                            {activeTab === 'profile' && <ProfileView session={session} />}

                            {activeTab !== 'dashboard' && activeTab !== 'employees' && activeTab !== 'attendance' && activeTab !== 'leave' && activeTab !== 'performance' && activeTab !== 'payroll' && activeTab !== 'profile' && (
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

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

function DashboardStats({ session }: { session: UserSession }) {
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
                // 1. Basic Counts
                const totalEmp = await executeKw(session.uid, session.password, 'hr.employee', 'search_count', [[]]);
                const present = await executeKw(session.uid, session.password, 'hr.attendance', 'search_count', [[['check_out', '=', false]]]);

                const now = new Date();
                const todayStr = now.toISOString().split('T')[0];
                const onLeave = await executeKw(session.uid, session.password, 'hr.leave', 'search_count',
                    [[['state', '=', 'validate'], ['date_from', '<=', todayStr], ['date_to', '>=', todayStr]]]
                );
                const pending = await executeKw(session.uid, session.password, 'hr.leave', 'search_count', [[['state', '=', 'confirm']]]);

                setStats({ employees: totalEmp, present, leave: onLeave, pending, loading: false });

                // 2. Real Chart Data (Last 7 Days Attendance)
                const days = [];
                for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(now.getDate() - i);
                    days.push(d);
                }

                const chartPromises = days.map(async (date) => {
                    const start = new Date(date);
                    start.setHours(0, 0, 0, 0); // UTC conversion might be needed in prod, keeping local for simpler logic
                    const end = new Date(date);
                    end.setHours(23, 59, 59, 999);

                    // Odoo expects UTC usually, sending naive local time string might work depends on server, 
                    // generally safe to pass string 'YYYY-MM-DD 00:00:00'.
                    // Formatting to simple string format
                    const startStr = start.toISOString().replace('T', ' ').split('.')[0];
                    const endStr = end.toISOString().replace('T', ' ').split('.')[0];

                    const count = await executeKw(session.uid, session.password, 'hr.attendance', 'search_count',
                        [[['check_in', '>=', startStr], ['check_in', '<=', endStr]]]
                    );

                    return {
                        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
                        fullDate: date.toLocaleDateString(),
                        value: count
                    };
                });

                const realChartData = await Promise.all(chartPromises);
                setChartData(realChartData);

            } catch (err) {
                console.error("Dashboard Sync Error:", err);
                setStats(prev => ({ ...prev, loading: false }));
            }
        };

        fetchStats();
    }, [session]);

    if (stats.loading) return <div className="p-12 text-center text-slate-400 font-medium animate-pulse">Syncing Dashboard...</div>;

    const cards = [
        { label: 'Total Employees', value: stats.employees.toString(), gradient: 'from-blue-500 to-indigo-600', icon: Users, trend: 'Registered' },
        { label: 'Present Today', value: stats.present.toString(), gradient: 'from-emerald-500 to-teal-600', icon: Calendar, sub: stats.employees > 0 ? `${Math.round((stats.present / stats.employees) * 100)}%` : '0%', trend: 'Active now' },
        { label: 'On Leave', value: stats.leave.toString(), gradient: 'from-orange-400 to-red-500', icon: Briefcase, trend: 'Returning soon' },
        { label: 'Pending Requests', value: stats.pending.toString(), gradient: 'from-violet-500 to-purple-600', icon: Bell, trend: 'Requires attention' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((stat, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="relative overflow-hidden bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300 group"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.gradient} text-white shadow-lg`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        {stat.sub && (
                            <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-100">
                                {stat.sub} Active
                            </span>
                        )}
                    </div>
                    <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                    <div className="mt-1 flex items-baseline">
                        <span className="text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</span>
                    </div>
                    <p className="mt-2 text-xs font-medium text-slate-400 group-hover:text-indigo-500 transition-colors">{stat.trend}</p>
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                        <stat.icon className="w-24 h-24" />
                    </div>
                </motion.div>
            ))}

            {/* Real Chart Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="col-span-1 lg:col-span-3 bg-white p-8 rounded-[2.5rem] shadow-lg shadow-indigo-100/50 border border-slate-100 relative overflow-hidden flex flex-col items-stretch"
            >
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-indigo-500" />
                            Workforce Activity
                        </h3>
                        <p className="text-sm text-slate-400 font-medium">Real-time check-in volume (Last 7 Days)</p>
                    </div>
                </div>

                <div className="h-[300px] w-full">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                    cursor={{ stroke: '#6366f1', strokeWidth: 2 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#6366f1"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorValue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-400">Loading chart data...</div>
                    )}
                </div>
            </motion.div>

            {/* AI Insights / Activity Feed */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="col-span-1 bg-gradient-to-b from-slate-900 to-slate-800 p-6 rounded-[2.5rem] shadow-xl shadow-slate-900/10 text-white flex flex-col relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-[80px] opacity-20 pointer-events-none"></div>

                <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400 fill-current" />
                    AI Insights
                </h3>

                <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="relative pl-4 border-l-2 border-indigo-500/30">
                        <div className="mb-1 flex items-center gap-2">
                            <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded uppercase tracking-wider">Analysis</span>
                            <span className="text-[10px] text-slate-400">Just now</span>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed font-light">
                            Workforce attendance is currently at <span className="text-emerald-400 font-bold">{stats.employees > 0 ? Math.round((stats.present / stats.employees) * 100) : 0}%</span> capacity.
                        </p>
                    </div>

                    <div className="relative pl-4 border-l-2 border-indigo-500/30">
                        <div className="mb-1 flex items-center gap-2">
                            <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded uppercase tracking-wider">Leave</span>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed font-light">
                            There are <span className="text-white font-bold">{stats.pending}</span> pending leave requests requiring review.
                        </p>
                    </div>

                    <div className="mt-auto pt-4 border-t border-white/10">
                        <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold text-white transition-colors flex items-center justify-center gap-2">
                            View Full Report
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
