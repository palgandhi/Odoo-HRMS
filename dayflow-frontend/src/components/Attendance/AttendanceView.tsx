import { useState, useEffect } from 'react';
import { Clock, Play, Square, History, Users, Search } from 'lucide-react';
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
        // (Keep existing logic)
        if (!employeeId) return;
        setLoading(true);
        try {
            const nowUTC = new Date().toISOString().replace('T', ' ').split('.')[0];
            if (isCheckedIn) {
                await executeKw(session.uid, session.password, 'hr.attendance', 'write', [[recentRecords[0].id], { check_out: nowUTC }]);
            } else {
                await executeKw(session.uid, session.password, 'hr.attendance', 'create', [{ employee_id: employeeId, check_in: nowUTC }]);
            }
            await fetchPersonalData();
        } catch (e) { console.error(e); setLoading(false); }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">

            {/* Role Switcher (Visible only to Managers) */}
            {isManager && (
                <div className="flex justify-end">
                    <div className="bg-slate-100 p-1 rounded-lg inline-flex">
                        <button
                            onClick={() => setViewMode('team')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'team' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Team Overview
                        </button>
                        <button
                            onClick={() => setViewMode('personal')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'personal' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            My Attendance
                        </button>
                    </div>
                </div>
            )}

            {/* TEAM VIEW */}
            {viewMode === 'team' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                        <div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    <Users className="w-6 h-6 text-blue-600" />
                                    Team Attendance
                                </h2>
                                <p className="text-slate-500 text-sm ml-8">Monitor employee check-ins in real-time</p>
                            </div>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                            <input type="text" placeholder="Search employee..." className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                    </div>

                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Employee</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold">Check In</th>
                                <th className="px-6 py-4 font-semibold">Check Out</th>
                                <th className="px-6 py-4 font-semibold text-right">Worked</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {teamRecords.map(record => {
                                const start = parseOdooDate(record.check_in);
                                return (
                                    <tr key={record.id} className="hover:bg-blue-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                                {record.employee_id[1].charAt(0)}
                                            </div>
                                            {record.employee_id[1]}
                                        </td>
                                        <td className="px-6 py-4">
                                            {!record.check_out ? (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                                                    Working
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                                                    Signed Out
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            <div className="text-xs text-slate-400">{start.toLocaleDateString()}</div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {record.check_out ? parseOdooDate(record.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono text-slate-900">
                                            {record.worked_hours ? record.worked_hours.toFixed(2) + ' h' : '-'}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* PERSONAL VIEW (Existing Code Refined) */}
            {viewMode === 'personal' && (
                <>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                        {/* Left: Status & Timer */}
                        <div className="flex items-start gap-4 w-full md:w-auto">
                            <div className={`p-4 rounded-xl ${isCheckedIn ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400'}`}>
                                <Clock className="w-8 h-8" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-slate-500 font-medium uppercase tracking-wide text-xs">Current Status</span>
                                    {isCheckedIn ? (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                            Active
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                                            Away
                                        </span>
                                    )}
                                </div>

                                {isCheckedIn ? (
                                    <div>
                                        <h1 className="text-4xl font-mono font-bold text-slate-900 tabular-nums tracking-tight">
                                            {duration}
                                        </h1>
                                        <p className="text-sm text-slate-500 mt-1">
                                            Started at {checkInTime && parseOdooDate(checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                ) : (
                                    <div>
                                        <h1 className="text-3xl font-bold text-slate-900">Not Working</h1>
                                        <p className="text-sm text-slate-500 mt-1">Ready to start?</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right: Action Button */}
                        <div className="w-full md:w-auto">
                            <button
                                onClick={handleToggleAttendance}
                                disabled={loading}
                                className={`
                    w-full md:w-48 py-4 px-6 rounded-lg font-bold shadow-sm transition-all flex items-center justify-center gap-2
                    ${isCheckedIn
                                        ? 'bg-white border-2 border-red-500 text-red-600 hover:bg-red-50'
                                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
                                    }
                    `}
                            >
                                {isCheckedIn ? (
                                    <>
                                        <Square className="w-5 h-5 fill-current" />
                                        <span>Stop Work</span>
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-5 h-5 fill-current" />
                                        <span>Start Work</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <History className="w-5 h-5 text-slate-500" />
                                My Activity
                            </h3>
                        </div>
                        {/* Simplified Personal Table */}
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Date</th>
                                    <th className="px-6 py-3 font-medium">Time</th>
                                    <th className="px-6 py-3 font-medium text-right">Hours</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {recentRecords.map(r => (
                                    <tr key={r.id}>
                                        <td className="px-6 py-3">{parseOdooDate(r.check_in).toLocaleDateString()}</td>
                                        <td className="px-6 py-3 text-slate-600">
                                            {parseOdooDate(r.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                            {r.check_out ? parseOdooDate(r.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                                        </td>
                                        <td className="px-6 py-3 text-right">{r.worked_hours ? r.worked_hours.toFixed(2) : '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

        </div>
    );
}
