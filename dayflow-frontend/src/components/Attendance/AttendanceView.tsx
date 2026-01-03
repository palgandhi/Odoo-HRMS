import { useState, useEffect } from 'react';
import { Clock, Play, Square, History, Users, Search, Smile, Meh, Frown, XCircle } from 'lucide-react';
import { useToast } from '../ui/Toast';
import { executeKw } from '../../services/odoo';
import type { UserSession } from '../../App';

interface AttendanceViewProps {
    session: UserSession;
}

interface AttendanceRecord {
    id: number;
    employee_id: [number, string]; // [id, name]
    check_in: string;
    check_out: string | false;
    worked_hours?: number;
}

export default function AttendanceView({ session }: AttendanceViewProps) {
    const isManager = session.isAdmin;
    const [viewMode, setViewMode] = useState<'personal' | 'team'>(isManager ? 'team' : 'personal');

    // ... (Keep existing state for Personal View)
    const [loading, setLoading] = useState(true);
    const [employeeId, setEmployeeId] = useState<number | null>(null);
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [checkInTime, setCheckInTime] = useState<string | null>(null);
    const [recentRecords, setRecentRecords] = useState<AttendanceRecord[]>([]);
    const [duration, setDuration] = useState<string>('00:00:00');

    // Manager State
    const [teamRecords, setTeamRecords] = useState<AttendanceRecord[]>([]);

    // Mood Tracking
    const [showMoodDialog, setShowMoodDialog] = useState(false);
    const { toast } = useToast();

    // ... (Keep existing Helper: parseOdooDate, updateDuration)
    const parseOdooDate = (dateStr: string) => new Date(dateStr.replace(' ', 'T') + 'Z');

    const updateDuration = () => {
        if (!checkInTime) {
            setDuration('00:00:00');
            return;
        }
        const start = parseOdooDate(checkInTime);
        const now = new Date();
        const diffMs = now.getTime() - start.getTime();
        if (diffMs < 0) return;
        const totalSeconds = Math.floor(diffMs / 1000);
        const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const s = (totalSeconds % 60).toString().padStart(2, '0');
        setDuration(`${h}:${m}:${s}`);
    };

    useEffect(() => {
        let interval: any;
        if (viewMode === 'personal' && isCheckedIn && checkInTime) {
            updateDuration();
            interval = setInterval(updateDuration, 1000);
        }
        return () => clearInterval(interval);
    }, [isCheckedIn, checkInTime, viewMode]);


    // 1. Fetch Data based on Mode
    useEffect(() => {
        if (viewMode === 'personal') {
            fetchPersonalData();
        } else {
            fetchTeamData();
        }
    }, [viewMode]);

    const fetchPersonalData = async () => {
        // ... (Existing Logic: fetch employee -> fetch status)
        // Reuse logic from previous step, abbreviated here for clarity
        try {
            setLoading(true);
            const employees = await executeKw(session.uid, session.password, 'hr.employee', 'search_read', [[['user_id', '=', session.uid]]], { fields: ['id'], limit: 1 });
            if (employees.length) {
                setEmployeeId(employees[0].id);
                const records = await executeKw(session.uid, session.password, 'hr.attendance', 'search_read', [[['employee_id', '=', employees[0].id]]], { fields: ['id', 'check_in', 'check_out', 'worked_hours'], order: 'check_in desc', limit: 5 });
                setRecentRecords(records);
                if (records.length && !records[0].check_out) {
                    setIsCheckedIn(true);
                    setCheckInTime(records[0].check_in);
                } else {
                    setIsCheckedIn(false);
                    setCheckInTime(null);
                }
            }
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const fetchTeamData = async () => {
        try {
            setLoading(true);
            // Fetch currently active attendance only? Or all recent?
            // Let's get today's attendance for everyone
            const records = await executeKw(
                session.uid, session.password, 'hr.attendance', 'search_read',
                [], // All records
                {
                    fields: ['id', 'employee_id', 'check_in', 'check_out', 'worked_hours'],
                    order: 'check_in desc',
                    limit: 20
                }
            );
            setTeamRecords(records);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleAttendance = async () => {
        if (!employeeId) return;

        // If checking out, show mood dialog first
        if (isCheckedIn) {
            setShowMoodDialog(true);
            return;
        }

        // Check In standard flow
        performCheckInOut(null);
    };

    const performCheckInOut = async (mood: string | null) => {
        setLoading(true);
        setShowMoodDialog(false);
        try {
            const nowUTC = new Date().toISOString().replace('T', ' ').split('.')[0];
            if (isCheckedIn) {
                await executeKw(session.uid, session.password, 'hr.attendance', 'write', [[recentRecords[0].id], { check_out: nowUTC }]);
                toast({ title: 'Session Ended', description: `Checked out successfully. Mood: ${mood || 'Not recorded'}`, variant: 'info' });
            } else {
                await executeKw(session.uid, session.password, 'hr.attendance', 'create', [{ employee_id: employeeId, check_in: nowUTC }]);
                toast({ title: 'Welcome!', description: 'Your session has started.', variant: 'success' });
            }
            await fetchPersonalData();
        } catch (e) {
            console.error(e);
            toast({ title: 'Error', description: 'Failed to update attendance.', variant: 'error' });
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">

            {/* Role Switcher (Visible only to Managers) */}
            {isManager && (
                <div className="flex justify-end">
                    <div className="bg-slate-100 p-1.5 rounded-xl inline-flex shadow-inner">
                        <button
                            onClick={() => setViewMode('team')}
                            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${viewMode === 'team' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Team Overview
                        </button>
                        <button
                            onClick={() => setViewMode('personal')}
                            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${viewMode === 'personal' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            My Attendance
                        </button>
                    </div>
                </div>
            )}

            {/* TEAM VIEW */}
            {viewMode === 'team' && (
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                        <div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                                    <div className="p-2 bg-indigo-100/50 rounded-lg">
                                        <Users className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    Team Attendance
                                </h2>
                            </div>
                        </div>
                        <div className="relative group">
                            <Search className="absolute left-4 top-3 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search employee..."
                                className="pl-10 pr-4 py-2.5 bg-slate-100 border-none rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 w-64 transition-all"
                            />
                        </div>
                    </div>

                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-5 font-semibold">Employee</th>
                                <th className="px-6 py-5 font-semibold">Status</th>
                                <th className="px-6 py-5 font-semibold">Check In</th>
                                <th className="px-6 py-5 font-semibold">Check Out</th>
                                <th className="px-8 py-5 font-semibold text-right">Worked</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {teamRecords.map(record => {
                                const start = parseOdooDate(record.check_in);
                                return (
                                    <tr key={record.id} className="hover:bg-indigo-50/30 transition-colors group">
                                        <td className="px-8 py-5 font-bold text-slate-900 flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm shadow-inner">
                                                {record.employee_id[1].charAt(0)}
                                            </div>
                                            {record.employee_id[1]}
                                        </td>
                                        <td className="px-6 py-5">
                                            {!record.check_out ? (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100/80 text-emerald-700 border border-emerald-200">
                                                    <span className="relative flex h-2 w-2 mr-2">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                                    </span>
                                                    Online
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
                                                    Offline
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5 text-slate-600 font-medium font-mono">
                                            {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-6 py-5 text-slate-600 font-medium font-mono">
                                            {record.check_out ? parseOdooDate(record.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                        </td>
                                        <td className="px-8 py-5 text-right font-bold text-indigo-900">
                                            {record.worked_hours ? record.worked_hours.toFixed(2) + ' h' : '-'}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* PERSONAL VIEW */}
            {viewMode === 'personal' && (
                <>
                    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-10 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
                        {/* Background Decor */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-50 to-transparent rounded-bl-full pointer-events-none" />

                        {/* Left: Status & Timer */}
                        <div className="flex items-center gap-8 w-full md:w-auto z-10">
                            <div className={`p-6 rounded-3xl shadow-lg transition-colors duration-500 ${isCheckedIn ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-emerald-200' : 'bg-white border-2 border-slate-100 text-slate-300'}`}>
                                <Clock className="w-12 h-12" />
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">Current Status</span>
                                    {isCheckedIn ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                            Active Session
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
                                            Not Checked In
                                        </span>
                                    )}
                                </div>

                                {isCheckedIn ? (
                                    <div className="animate-in slide-in-from-bottom-2 fade-in duration-500">
                                        <h1 className="text-6xl font-mono font-bold text-slate-900 tabular-nums tracking-tighter">
                                            {duration}
                                        </h1>
                                        <p className="text-slate-500 mt-2 font-medium">
                                            Started at <span className="text-slate-900">{checkInTime && parseOdooDate(checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </p>
                                    </div>
                                ) : (
                                    <div className="animate-in slide-in-from-bottom-2 fade-in duration-500">
                                        <h1 className="text-5xl font-bold text-slate-900 tracking-tight">Ready?</h1>
                                        <p className="text-slate-500 mt-2">Start your timer to track work hours.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right: Action Button */}
                        <div className="w-full md:w-auto z-10">
                            <button
                                onClick={handleToggleAttendance}
                                disabled={loading}
                                className={`
                    w-full md:w-64 py-6 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3 group
                    ${isCheckedIn
                                        ? 'bg-white border-2 border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200'
                                        : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-indigo-500/30'
                                    }
                    `}
                            >
                                {isCheckedIn ? (
                                    <>
                                        <Square className="w-6 h-6 fill-current" />
                                        <span>End Session</span>
                                    </>
                                ) : (
                                    <>
                                        <div className="relative">
                                            <Play className="w-6 h-6 fill-current relative z-10" />
                                            <span className="absolute inset-0 bg-white rounded-full animate-ping opacity-30"></span>
                                        </div>
                                        <span>Start Working</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* History */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-bold text-slate-900 flex items-center gap-3">
                                <History className="w-5 h-5 text-slate-400" />
                                Recent Activity
                            </h3>
                        </div>
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500">
                                <tr>
                                    <th className="px-8 py-4 font-semibold">Date</th>
                                    <th className="px-6 py-4 font-semibold">Session Time</th>
                                    <th className="px-8 py-4 font-semibold text-right">Total Hours</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {recentRecords.map(r => (
                                    <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-4 font-medium text-slate-900">{parseOdooDate(r.check_in).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</td>
                                        <td className="px-6 py-4 text-slate-500 font-mono">
                                            {parseOdooDate(r.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            <span className="mx-2 text-slate-300">➜</span>
                                            {r.check_out ? parseOdooDate(r.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : <span className="text-emerald-500 font-bold">Active</span>}
                                        </td>
                                        <td className="px-8 py-4 text-right font-bold text-slate-700">{r.worked_hours ? r.worked_hours.toFixed(2) : '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )
            }

            {/* Mood Tracking Modal */}
            {showMoodDialog && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300 border border-slate-100 relative">
                        <button onClick={() => setShowMoodDialog(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-50 rounded-full transition-colors">
                            <XCircle className="w-6 h-6" />
                        </button>

                        <div className="text-center mb-8">
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">How check-out feels?</h3>
                            <p className="text-slate-500">Track your well-being over time.</p>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <button onClick={() => performCheckInOut('Great')} className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-emerald-50 text-emerald-600 border-2 border-transparent hover:border-emerald-200 hover:shadow-lg hover:-translate-y-1 transition-all group">
                                <Smile className="w-12 h-12 stroke-[1.5]" />
                                <span className="font-bold text-sm">Great</span>
                            </button>
                            <button onClick={() => performCheckInOut('Neutral')} className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-amber-50 text-amber-600 border-2 border-transparent hover:border-amber-200 hover:shadow-lg hover:-translate-y-1 transition-all group">
                                <Meh className="w-12 h-12 stroke-[1.5]" />
                                <span className="font-bold text-sm">Okay</span>
                            </button>
                            <button onClick={() => performCheckInOut('Stressed')} className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-rose-50 text-rose-600 border-2 border-transparent hover:border-rose-200 hover:shadow-lg hover:-translate-y-1 transition-all group">
                                <Frown className="w-12 h-12 stroke-[1.5]" />
                                <span className="font-bold text-sm">Rough</span>
                            </button>
                        </div>
                        <div className="mt-8 text-center">
                            <button onClick={() => performCheckInOut(null)} className="text-slate-400 text-sm font-medium hover:text-slate-600 underline">
                                Skip & Just Check Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}
