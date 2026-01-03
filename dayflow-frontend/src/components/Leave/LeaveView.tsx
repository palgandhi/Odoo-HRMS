import { useState, useEffect } from 'react';
import { Plus, Calendar, CheckCircle, Clock, XCircle, FileText, CheckSquare, User } from 'lucide-react';
import { useToast } from '../ui/Toast';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { executeKw } from '../../services/odoo';
import type { UserSession } from '../../App';

interface LeaveViewProps {
    session: UserSession;
}

interface LeaveType {
    id: number;
    name: string;
}

interface LeaveRequest {
    id: number;
    employee_id: [number, string];
    holiday_status_id: [number, string]; // [id, name]
    date_from: string;
    date_to: string;
    duration_display: string;
    state: string;
    name: string; // Description
}

export default function LeaveView({ session }: LeaveViewProps) {
    const isManager = session.isAdmin;
    const [viewMode, setViewMode] = useState<'my' | 'approvals'>(isManager ? 'approvals' : 'my');
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [employeeId, setEmployeeId] = useState<number | null>(null);
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [myRequests, setMyRequests] = useState<LeaveRequest[]>([]);
    const [pendingApprovals, setPendingApprovals] = useState<LeaveRequest[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        leaveTypeId: '',
        dateFrom: '',
        dateTo: '',
        description: ''
    });
    const [submitting, setSubmitting] = useState(false);

    // 1. Initialize data
    useEffect(() => {
        fetchInitialData();
    }, [session]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);

            // A. Get Employee ID
            const employees = await executeKw(session.uid, session.password, 'hr.employee', 'search_read', [[['user_id', '=', session.uid]]], { fields: ['id', 'name'], limit: 1 });
            if (!employees || employees.length === 0) {
                setError('No employee profile found.');
                setLoading(false);
                return;
            }
            const empId = employees[0].id;
            setEmployeeId(empId);

            // B. Get Leave Types
            const types = await executeKw(session.uid, session.password, 'hr.leave.type', 'search_read', [[['active', '=', true]]], { fields: ['id', 'name'] });
            setLeaveTypes(types);

            // C. Get Requests
            await fetchRequests(empId);
            if (isManager) await fetchApprovals();

        } catch (err) {
            console.error(err);
            setError("Failed to load leave data.");
        } finally {
            setLoading(false);
        }
    };

    const fetchRequests = async (empId: number) => {
        const myReqs = await executeKw(
            session.uid, session.password, 'hr.leave', 'search_read',
            [[['employee_id', '=', empId]]],
            { fields: ['id', 'employee_id', 'holiday_status_id', 'date_from', 'date_to', 'duration_display', 'state', 'name'], order: 'date_from desc', limit: 20 }
        );
        setMyRequests(myReqs);
    };

    const fetchApprovals = async () => {
        // Managers see requests in 'confirm' state (Pending Approval)
        const approvals = await executeKw(
            session.uid, session.password, 'hr.leave', 'search_read',
            [[['state', '=', 'confirm']]],
            { fields: ['id', 'employee_id', 'holiday_status_id', 'date_from', 'date_to', 'duration_display', 'state', 'name'], order: 'date_from asc' }
        );
        setPendingApprovals(approvals);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!employeeId) return;
        setSubmitting(true);
        try {
            const startDateTime = `${formData.dateFrom} 07:00:00`;
            const endDateTime = `${formData.dateTo} 16:00:00`;

            await executeKw(session.uid, session.password, 'hr.leave', 'create', [{
                employee_id: employeeId,
                holiday_status_id: parseInt(formData.leaveTypeId),
                date_from: startDateTime,
                date_to: endDateTime,
                name: formData.description || 'Time Off Request'
            }]);

            setShowForm(false);
            setFormData({ leaveTypeId: '', dateFrom: '', dateTo: '', description: '' });
            await fetchRequests(employeeId);
            toast({ title: 'Request Sent', description: 'Your leave request has been submitted.', variant: 'success' });
        } catch (err: any) {
            console.error(err);
            toast({ title: 'Submission Failed', description: err.data?.message || err.message, variant: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDecision = async (id: number, decision: 'approve' | 'refuse') => {
        if (!confirm(`Are you sure you want to ${decision} this request?`)) return;
        try {
            const method = decision === 'approve' ? 'action_approve' : 'action_refuse';
            await executeKw(session.uid, session.password, 'hr.leave', method, [[id]]);
            await fetchApprovals(); // Refresh list
            toast({ title: 'Success', description: `Request ${decision === 'approve' ? 'approved' : 'refused'}.`, variant: 'success' });
        } catch (err) {
            console.error(err);
            toast({ title: 'Action Failed', description: 'Could not update request status.', variant: 'error' });
        }
    };

    const renderStatus = (state: string) => {
        switch (state) {
            case 'confirm': return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" /> Pending</span>;
            case 'refuse': return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" /> Rejected</span>;
            case 'validate': return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Approved</span>;
            default: return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-600">{state}</span>;
        }
    };

    if (loading && !employeeId) return <div className="p-8 text-center text-slate-500">Loading leave portal...</div>;
    if (error) return <div className="p-8 text-red-500">{error}</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">

            {/* Header & Role Switcher */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Leave Management</h2>
                    <p className="text-slate-500 mt-1">{viewMode === 'approvals' ? 'Review and approve team requests' : 'Manage your time off and view history'}</p>
                </div>
                <div className="flex gap-4">
                    {isManager && (
                        <div className="bg-slate-100 p-1.5 rounded-xl inline-flex mr-2 shadow-inner">
                            <button onClick={() => setViewMode('approvals')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${viewMode === 'approvals' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                <CheckSquare className="w-4 h-4" /> Approvals
                                {pendingApprovals.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full shadow-sm">{pendingApprovals.length}</span>}
                            </button>
                            <button onClick={() => setViewMode('my')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${viewMode === 'my' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                <User className="w-4 h-4" /> My Leaves
                            </button>
                        </div>
                    )}
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center justify-center px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all transform hover:-translate-y-0.5"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        New Request
                    </button>
                </div>
            </div>

            {/* APPROVALS VIEW */}
            {viewMode === 'approvals' && (
                <div className="space-y-4">
                    {pendingApprovals.length === 0 ? (
                        <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-slate-200">
                            <div className="w-20 h-20 bg-emerald-50 rounded-full mx-auto flex items-center justify-center mb-6">
                                <CheckCircle className="w-10 h-10 text-emerald-500" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">All Caught Up!</h3>
                            <p className="text-slate-500 max-w-sm mx-auto mt-2">There are no pending leave requests requiring your attention.</p>
                        </div>
                    ) : (
                        pendingApprovals.map((req, i) => (
                            <div key={req.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-md transition-shadow animate-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${i * 100}ms` }}>
                                <div className="flex items-start gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-slate-100 text-indigo-600 flex items-center justify-center font-bold text-lg shadow-inner border border-white">
                                        {req.employee_id[1].charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                                            {req.employee_id[1]}
                                            <span className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-bold border border-indigo-100">{req.holiday_status_id[1]}</span>
                                        </h4>
                                        <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                                            <span className="flex items-center gap-1 font-medium text-slate-700">
                                                <Clock className="w-3.5 h-3.5" />
                                                {req.duration_display} days
                                            </span>
                                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {new Date(req.date_from).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                <span className="text-slate-300">➜</span>
                                                {new Date(req.date_to).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        {req.name && <p className="text-sm text-slate-500 mt-3 italic bg-slate-50 p-2 rounded-lg border border-slate-100 inline-block">"{req.name}"</p>}
                                    </div>
                                </div>
                                <div className="flex gap-3 w-full md:w-auto pl-16 md:pl-0">
                                    <button
                                        onClick={() => handleDecision(req.id, 'refuse')}
                                        className="flex-1 md:flex-none px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 font-bold text-sm transition-colors"
                                    >
                                        Refuse
                                    </button>
                                    <button
                                        onClick={() => handleDecision(req.id, 'approve')}
                                        className="flex-1 md:flex-none px-6 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all transform active:scale-95"
                                    >
                                        Approve
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* MY REQUESTS VIEW */}
            {viewMode === 'my' && (
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                        <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-500">
                            <FileText className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-slate-900 text-lg">Request History</h3>
                    </div>

                    {/* Chart Section */}
                    {myRequests.length > 0 && (
                        <div className="p-8 bg-white flex flex-col md:flex-row items-center justify-around border-b border-slate-100">
                            <div className="text-center md:text-left mb-6 md:mb-0">
                                <h4 className="text-2xl font-bold text-slate-900 mb-1">Time Off Analysis</h4>
                                <p className="text-slate-500 text-sm">Distribution of your leave requests by type.</p>
                            </div>
                            <div className="w-64 h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={Object.values(myRequests.reduce((acc, curr) => {
                                                const typeName = curr.holiday_status_id[1];
                                                if (!acc[typeName]) acc[typeName] = { name: typeName, value: 0 };
                                                acc[typeName].value += 1;
                                                return acc;
                                            }, {} as any))}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {[...Array(10)].map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {myRequests.length === 0 ? (
                        <div className="p-20 text-center text-slate-400 font-medium">No leave requests found in history.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                                    <tr>
                                        <th className="px-8 py-4">Type</th>
                                        <th className="px-6 py-4">Dates</th>
                                        <th className="px-6 py-4">Duration</th>
                                        <th className="px-6 py-4">Description</th>
                                        <th className="px-8 py-4 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {myRequests.map((req) => (
                                        <tr key={req.id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-8 py-5 font-bold text-slate-900">
                                                {req.holiday_status_id[1]}
                                            </td>
                                            <td className="px-6 py-5 text-slate-600">
                                                <div className="flex items-center gap-2 font-medium">
                                                    <span>{new Date(req.date_from).toLocaleDateString()}</span>
                                                    <span className="text-slate-300">➜</span>
                                                    <span>{new Date(req.date_to).toLocaleDateString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-slate-600 font-mono text-xs bg-slate-50 rounded px-2 w-fit mx-6">{req.duration_display}d</td>
                                            <td className="px-6 py-5 text-slate-500 italic max-w-xs truncate">{req.name || '-'}</td>
                                            <td className="px-8 py-5 text-right">{renderStatus(req.state)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* New Request Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl shadow-slate-900/20 animate-in zoom-in-95 duration-200 border border-slate-100 overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-xl font-bold text-slate-900">New Leave Request</h3>
                            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full transition-colors">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="p-8 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Leave Type</label>
                                <div className="relative">
                                    <select
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none appearance-none font-medium text-slate-700"
                                        value={formData.leaveTypeId}
                                        onChange={e => setFormData({ ...formData, leaveTypeId: e.target.value })}
                                    >
                                        <option value="">Select a type...</option>
                                        {leaveTypes.map(type => (
                                            <option key={type.id} value={type.id}>{type.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-3.5 pointer-events-none text-slate-500">
                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Start Date</label>
                                    <input type="date" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-medium" value={formData.dateFrom} onChange={e => setFormData({ ...formData, dateFrom: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">End Date</label>
                                    <input type="date" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-medium" value={formData.dateTo} onChange={e => setFormData({ ...formData, dateTo: e.target.value })} min={formData.dateFrom} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Notes</label>
                                <textarea className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none h-28 resize-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500" placeholder="Optional reasoning..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-bold transition-colors">Cancel</button>
                                <button type="submit" disabled={submitting} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:shadow-none transform active:scale-95">Submit Request</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
