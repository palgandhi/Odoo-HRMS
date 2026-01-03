import { useState, useEffect } from 'react';
import { Plus, Calendar, CheckCircle, Clock, XCircle, FileText, CheckSquare, User } from 'lucide-react';
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
        } catch (err: any) {
            console.error(err);
            alert("Failed: " + (err.data?.message || err.message));
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
        } catch (err) {
            console.error(err);
            alert("Action failed. Check console.");
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
        <div className="max-w-6xl mx-auto space-y-6">

            {/* Header & Role Switcher */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Leave Management</h2>
                    <p className="text-slate-500">{viewMode === 'approvals' ? 'Review and approve team requests' : 'Manage your time off'}</p>
                </div>
                <div className="flex gap-2">
                    {isManager && (
                        <div className="bg-slate-100 p-1 rounded-xl inline-flex mr-2">
                            <button onClick={() => setViewMode('approvals')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'approvals' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>
                                <CheckSquare className="w-4 h-4" /> Approvals
                                {pendingApprovals.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">{pendingApprovals.length}</span>}
                            </button>
                            <button onClick={() => setViewMode('my')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'my' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>
                                <User className="w-4 h-4" /> My Leaves
                            </button>
                        </div>
                    )}
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-lg shadow-blue-500/20 transition-all"
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
                        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-200">
                            <CheckCircle className="w-12 h-12 text-green-100 mx-auto mb-4 bg-green-500 rounded-full p-2" />
                            <h3 className="text-lg font-bold text-slate-900">All Caught Up!</h3>
                            <p className="text-slate-500">No pending leave requests to review.</p>
                        </div>
                    ) : (
                        pendingApprovals.map(req => (
                            <div key={req.id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                                        {req.employee_id[1].charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-lg">{req.employee_id[1]}</h4>
                                        <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                                            <span className="font-medium text-slate-900">{req.holiday_status_id[1]}</span>
                                            <span>•</span>
                                            <span>{req.duration_display} days</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-2 bg-slate-50 px-3 py-1.5 rounded-lg inline-flex">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(req.date_from).toLocaleDateString()} — {new Date(req.date_to).toLocaleDateString()}
                                        </div>
                                        {req.name && <p className="text-sm text-slate-500 mt-2 italic">"{req.name}"</p>}
                                    </div>
                                </div>
                                <div className="flex gap-3 w-full md:w-auto">
                                    <button
                                        onClick={() => handleDecision(req.id, 'refuse')}
                                        className="flex-1 md:flex-none px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium text-sm"
                                    >
                                        Refuse
                                    </button>
                                    <button
                                        onClick={() => handleDecision(req.id, 'approve')}
                                        className="flex-1 md:flex-none px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm shadow-sm"
                                    >
                                        Approve Request
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* MY REQUESTS VIEW */}
            {viewMode === 'my' && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-slate-400" />
                        <h3 className="font-bold text-slate-900">Request History</h3>
                    </div>

                    {myRequests.length === 0 ? (
                        <div className="p-12 text-center text-slate-400">No leave requests found.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-500">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">Type</th>
                                        <th className="px-6 py-3 font-medium">Dates</th>
                                        <th className="px-6 py-3 font-medium">Duration</th>
                                        <th className="px-6 py-3 font-medium">Description</th>
                                        <th className="px-6 py-3 font-medium text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {myRequests.map((req) => (
                                        <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-900">
                                                {req.holiday_status_id[1]}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-slate-400" />
                                                    <span>{new Date(req.date_from).toLocaleDateString()}</span>
                                                    <span className="text-slate-300">→</span>
                                                    <span>{new Date(req.date_to).toLocaleDateString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">{req.duration_display}</td>
                                            <td className="px-6 py-4 text-slate-600 max-w-xs truncate">{req.name || '-'}</td>
                                            <td className="px-6 py-4 text-right">{renderStatus(req.state)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* New Request Modal (Same as before) */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-900">New Leave Request</h3>
                            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Leave Type</label>
                                <select
                                    required
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.leaveTypeId}
                                    onChange={e => setFormData({ ...formData, leaveTypeId: e.target.value })}
                                >
                                    <option value="">Select a type...</option>
                                    {leaveTypes.map(type => (
                                        <option key={type.id} value={type.id}>{type.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                                    <input type="date" required className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none" value={formData.dateFrom} onChange={e => setFormData({ ...formData, dateFrom: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                                    <input type="date" required className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none" value={formData.dateTo} onChange={e => setFormData({ ...formData, dateTo: e.target.value })} min={formData.dateFrom} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none h-24 resize-none" placeholder="Reason..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                            </div>
                            <div className="pt-2 flex justify-end gap-2">
                                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg font-medium">Cancel</button>
                                <button type="submit" disabled={submitting} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">Submit Request</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
