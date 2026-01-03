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

import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie } from 'recharts';

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
                const totalEmp = await executeKw(session.uid, session.password, 'hr.employee', 'search_count', [[]]);
                const present = await executeKw(session.uid, session.password, 'hr.attendance', 'search_count', [[['check_out', '=', false]]]);

                const now = new Date();
                const todayStr = now.toISOString().split('T')[0];
                const onLeave = await executeKw(session.uid, session.password, 'hr.leave', 'search_count',
                    [[['state', '=', 'validate'], ['date_from', '<=', todayStr], ['date_to', '>=', todayStr]]]
                );
                // "My" pending requests for personalization
                const myPending = await executeKw(session.uid, session.password, 'hr.leave', 'search_count',
                    [[['state', '=', 'confirm'], ['user_id', '=', session.uid]]]
                );

                setStats({ employees: totalEmp, present, leave: onLeave, pending: myPending, loading: false });

                // Chart Data Logic (Keep existing)
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

    if (stats.loading) return <div className="p-12 text-center text-slate-400 font-medium animate-pulse">Loading your dashboard...</div>;

    // Time-based Greeting
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

    // Attendance Ring Data
    const ringData = [
        { name: 'Present', value: stats.present, fill: '#6366f1' },
        { name: 'Absent', value: stats.employees - stats.present, fill: '#f1f5f9' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">

            {/* 1. PERSONAL HEADER */}
            <div>
                <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
                    {greeting}, {session.username.split('.')[0]}!
                    <span className="ml-2 inline-block animate-wave origin-bottom-right">👋</span>
                </h1>
                <p className="text-slate-500 mt-2 text-lg">
                    You have <strong className="text-indigo-600">{stats.pending} pending requests</strong> and <strong className="text-emerald-600">running on time</strong> today.
                </p>
            </div>

            {/* 2. MAIN GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT COL: Live Status & Chart */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Live Status Card (The "Elevator" equivalent) */}
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50 pointer-events-none"></div>

                        <div className="flex-1 relative z-10">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="flex h-3 w-3 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                </span>
                                <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">Live Office Status</span>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Workspace Capacity</h3>
                            <p className="text-slate-500 text-sm leading-relaxed mb-6">
                                The office is currently <strong className="text-slate-900">{Math.round((stats.present / (stats.employees || 1)) * 100)}% occupied</strong>.
                                Looks like a buzzling day!
                            </p>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                    {stats.present} Checked In
                                </div>
                                <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                                    <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                                    {stats.employees - stats.present} Away / Planned Leave
                                </div>
                            </div>
                        </div>

                        {/* Donut Chart */}
                        <div className="w-48 h-48 relative flex-shrink-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={ringData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        startAngle={90}
                                        endAngle={-270}
                                        stroke="none"
                                        cornerRadius={10}
                                    />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center Text */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-3xl font-bold text-slate-900">{stats.present}</span>
                                <span className="text-[10px] font-bold uppercase text-slate-400">Active</span>
                            </div>
                        </div>
                    </div>

                    {/* Workforce Activity Chart (Restyled) */}
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-lg font-bold text-slate-900">Weekly Trends</h3>
                            <select className="bg-slate-50 border-none text-xs font-bold text-slate-500 py-2 px-4 rounded-xl outline-none cursor-pointer hover:bg-slate-100 transition-colors">
                                <option>Last 7 Days</option>
                                <option>This Month</option>
                            </select>
                        </div>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
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
                </div>

                {/* RIGHT COL: Action Cards */}
                <div className="space-y-6">

                    {/* Action Card: Time Off */}
                    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-[2.5rem] shadow-xl shadow-indigo-500/20 text-white relative overflow-hidden text-center group">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full opacity-10 -ml-10 -mt-10 blur-2xl group-hover:opacity-20 transition-opacity"></div>
                        <div className="relative z-10">
                            <Briefcase className="w-10 h-10 mx-auto mb-4 text-indigo-200" />
                            <h3 className="text-xl font-bold mb-2">Need a Break?</h3>
                            <p className="text-indigo-100 text-sm mb-6 px-4">You have {12} days of paid leave remaining this year.</p>
                            <button className="w-full py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg shadow-black/10">
                                Request Time Off
                            </button>
                        </div>
                    </div>

                    {/* Wellness / Quick Info */}
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mb-4">
                            <Zap className="w-8 h-8 fill-current" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Productivity Streak</h3>
                        <p className="text-sm text-slate-500 mt-1 mb-6">You've checked in on time for <strong>4 days</strong> in a row!</p>
                        <div className="flex gap-2 justify-center">
                            {[1, 2, 3, 4].map(i => <div key={i} className="w-2 h-2 rounded-full bg-orange-500"></div>)}
                            <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                        </div>
                    </div>

                    {/* Calendar Mini (Mock) */}
                    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100">
                        <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-indigo-500" /> Today's Agenda
                        </h4>
                        <div className="space-y-4">
                            {[
                                { time: '10:00 AM', title: 'Team Sync', color: 'bg-blue-500' },
                                { time: '02:00 PM', title: 'Project Review', color: 'bg-purple-500' }
                            ].map((evt, i) => (
                                <div key={i} className="flex gap-4 items-start relative pl-4 border-l border-slate-100">
                                    <div className={`absolute -left-1.5 top-1.5 w-3 h-3 rounded-full border-2 border-white shadow-sm ${evt.color}`}></div>
                                    <div className="text-left">
                                        <p className="text-xs font-bold text-slate-400">{evt.time}</p>
                                        <p className="text-sm font-bold text-slate-900">{evt.title}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
