import { useState, useEffect } from 'react';
import { TrendingUp, Users, Calendar, DollarSign, Award, Download, BarChart3 } from 'lucide-react';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import type { UserSession } from '../../App';
import { executeKw } from '../../services/odoo';

interface AnalyticsViewProps {
    session: UserSession;
}

export default function AnalyticsView({ session }: AnalyticsViewProps) {
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

    // Analytics Data
    const [attendanceTrend, setAttendanceTrend] = useState<any[]>([]);
    const [leaveDistribution, setLeaveDistribution] = useState<any[]>([]);
    const [departmentStats, setDepartmentStats] = useState<any[]>([]);
    const [payrollSummary, setPayrollSummary] = useState<any>({});
    const [topPerformers, setTopPerformers] = useState<any[]>([]);

    useEffect(() => {
        fetchAnalytics();
    }, [session, timeRange]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            // 1. Attendance Trend (Last N days)
            const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
            const attendanceData = [];
            const now = new Date();

            for (let i = days - 1; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];

                const count = await executeKw(
                    session.uid,
                    session.password,
                    'hr.attendance',
                    'search_count',
                    [[
                        ['check_in', '>=', `${dateStr} 00:00:00`],
                        ['check_in', '<=', `${dateStr} 23:59:59`]
                    ]]
                );

                attendanceData.push({
                    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    checkIns: count
                });
            }
            setAttendanceTrend(attendanceData);

            // 2. Leave Distribution by Type
            const leaveTypes = await executeKw(
                session.uid,
                session.password,
                'hr.leave.type',
                'search_read',
                [[['active', '=', true]]],
                { fields: ['id', 'name'] }
            );

            const leaveData = await Promise.all(
                leaveTypes.map(async (type: any) => {
                    const count = await executeKw(
                        session.uid,
                        session.password,
                        'hr.leave',
                        'search_count',
                        [[['holiday_status_id', '=', type.id], ['state', '=', 'validate']]]
                    );
                    return { name: type.name, value: count };
                })
            );
            setLeaveDistribution(leaveData.filter(d => d.value > 0));

            // 3. Department Headcount
            const departments = await executeKw(
                session.uid,
                session.password,
                'hr.department',
                'search_read',
                [[]],
                { fields: ['id', 'name'] }
            );

            const deptData = await Promise.all(
                departments.map(async (dept: any) => {
                    const count = await executeKw(
                        session.uid,
                        session.password,
                        'hr.employee',
                        'search_count',
                        [[['department_id', '=', dept.id]]]
                    );
                    return { name: dept.name, employees: count };
                })
            );
            setDepartmentStats(deptData.filter(d => d.employees > 0));

            // 4. Payroll Summary
            const payslips = await executeKw(
                session.uid,
                session.password,
                'hr.payslip',
                'search_read',
                [[['state', '=', 'paid']]],
                { fields: ['net_wage', 'basic_wage'], limit: 100 }
            ).catch(() => []);

            if (payslips.length > 0) {
                const totalNet = payslips.reduce((sum: number, p: any) => sum + p.net_wage, 0);
                const avgNet = totalNet / payslips.length;
                setPayrollSummary({
                    total: totalNet,
                    average: avgNet,
                    count: payslips.length
                });
            }

            // 5. Top Performers (based on performance reviews)
            const reviews = await executeKw(
                session.uid,
                session.password,
                'hr.performance.review',
                'search_read',
                [[['state', '=', 'finalized']]],
                {
                    fields: ['employee_id', 'manager_rating'],
                    order: 'manager_rating desc',
                    limit: 5
                }
            ).catch(() => []);

            setTopPerformers(reviews.map((r: any) => ({
                name: r.employee_id[1],
                rating: parseFloat(r.manager_rating) || 0
            })));

        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-xl">
                            <BarChart3 className="w-8 h-8 text-indigo-600" />
                        </div>
                        Analytics Dashboard
                    </h2>
                    <p className="text-slate-500 mt-1">Comprehensive insights and data visualization</p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-slate-100 p-1.5 rounded-xl inline-flex shadow-inner">
                        <button
                            onClick={() => setTimeRange('7d')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${timeRange === '7d' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            7 Days
                        </button>
                        <button
                            onClick={() => setTimeRange('30d')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${timeRange === '30d' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            30 Days
                        </button>
                        <button
                            onClick={() => setTimeRange('90d')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${timeRange === '90d' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            90 Days
                        </button>
                    </div>
                    <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Export Report
                    </button>
                </div>
            </div>

            {/* Key Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-200">
                    <div className="flex items-center justify-between mb-4">
                        <Users className="w-8 h-8 opacity-80" />
                        <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full">Total</span>
                    </div>
                    <h3 className="text-3xl font-bold">{departmentStats.reduce((sum, d) => sum + d.employees, 0)}</h3>
                    <p className="text-indigo-100 text-sm mt-1">Employees</p>
                </div>

                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl shadow-emerald-200">
                    <div className="flex items-center justify-between mb-4">
                        <Calendar className="w-8 h-8 opacity-80" />
                        <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full">Active</span>
                    </div>
                    <h3 className="text-3xl font-bold">{leaveDistribution.reduce((sum, l) => sum + l.value, 0)}</h3>
                    <p className="text-emerald-100 text-sm mt-1">Total Leaves</p>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl shadow-orange-200">
                    <div className="flex items-center justify-between mb-4">
                        <DollarSign className="w-8 h-8 opacity-80" />
                        <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full">Avg</span>
                    </div>
                    <h3 className="text-3xl font-bold">${payrollSummary.average?.toLocaleString(undefined, { maximumFractionDigits: 0 }) || 0}</h3>
                    <p className="text-orange-100 text-sm mt-1">Salary</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl shadow-purple-200">
                    <div className="flex items-center justify-between mb-4">
                        <Award className="w-8 h-8 opacity-80" />
                        <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full">Top</span>
                    </div>
                    <h3 className="text-3xl font-bold">{topPerformers.length > 0 ? topPerformers[0].rating.toFixed(1) : '-'}</h3>
                    <p className="text-purple-100 text-sm mt-1">Performance</p>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Attendance Trend */}
                <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-indigo-500" />
                        Attendance Trend
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={attendanceTrend}>
                                <defs>
                                    <linearGradient id="colorCheckIns" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                <Area type="monotone" dataKey="checkIns" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCheckIns)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Leave Distribution */}
                <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Leave Distribution</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={leaveDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {leaveDistribution.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Department Headcount */}
                <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Department Headcount</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={departmentStats} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} width={120} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                <Bar dataKey="employees" fill="#6366f1" radius={[0, 8, 8, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Performers */}
                <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Award className="w-5 h-5 text-orange-500" />
                        Top Performers
                    </h3>
                    {topPerformers.length === 0 ? (
                        <div className="h-80 flex items-center justify-center text-slate-400">
                            <p>No performance data available</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {topPerformers.map((performer, index) => (
                                <div key={index} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400' : 'bg-gradient-to-br from-orange-300 to-orange-400'}`}>
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-900">{performer.name}</h4>
                                        <p className="text-sm text-slate-500">Performance Rating</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Award key={i} className={`w-4 h-4 ${i < performer.rating ? 'text-orange-500 fill-orange-500' : 'text-slate-300'}`} />
                                            ))}
                                        </div>
                                        <p className="text-sm font-bold text-slate-600 mt-1">{performer.rating.toFixed(1)}/5.0</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
