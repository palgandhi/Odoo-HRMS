import { useState, useEffect } from 'react';
import { Download, Plus, FileText } from 'lucide-react';
import type { UserSession } from '../../App';
import { PayrollService, type Payslip } from '../../services/PayrollService';
import { executeKw } from '../../services/odoo';

interface PayrollViewProps {
    session: UserSession;
}

export default function PayrollView({ session }: PayrollViewProps) {
    const isManager = session.isAdmin;
    const [slips, setSlips] = useState<Payslip[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Form Data
    const [employees, setEmployees] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        employeeId: '',
        date: new Date().toISOString().split('T')[0],
        basicWage: '',
        allowances: '',
        deductions: ''
    });

    useEffect(() => {
        fetchData();
    }, [session]);

    const fetchData = async () => {
        setLoading(true);
        try {
            let domain: any[] = [];

            if (!isManager) {
                // Employee: Only my payslips
                const empRes = await executeKw(session.uid, session.password, 'hr.employee', 'search_read', [[['user_id', '=', session.uid]]], { fields: ['id'] });
                if (empRes.length > 0) {
                    domain = [['employee_id', '=', empRes[0].id]];
                } else {
                    setSlips([]);
                    setLoading(false);
                    return;
                }
            }

            const data = await PayrollService.searchPayslips(session, domain);
            setSlips(data);

            if (isManager && employees.length === 0) {
                const empList = await executeKw(session.uid, session.password, 'hr.employee', 'search_read', [[]], { fields: ['id', 'name'] });
                setEmployees(empList);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await PayrollService.createPayslip(session, {
                name: `Payslip - ${formData.date}`,
                employee_id: parseInt(formData.employeeId),
                date: formData.date,
                basic_wage: parseFloat(formData.basicWage),
                allowances: parseFloat(formData.allowances || '0'),
                deductions: parseFloat(formData.deductions || '0'),
                state: 'paid' // Auto-pay for simplicity
            });
            setShowForm(false);
            fetchData();
        } catch (err) {
            console.error(err);
            alert("Failed to generate payslip");
        }
    };

    const totalPaid = slips.reduce((sum, s) => sum + (s.state === 'paid' ? s.net_wage : 0), 0);

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">{isManager ? 'Payroll Management' : 'My Payslips'}</h2>
                    <p className="text-slate-500">Manage salaries and payment history</p>
                </div>
                {isManager && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-lg shadow-blue-500/20"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Generate Slip
                    </button>
                )}
            </div>

            {/* Stats Card */}
            {!isManager && slips.length > 0 && (
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/20">
                    <p className="text-emerald-100 font-medium mb-1">Total Earnings (YTD)</p>
                    <h3 className="text-4xl font-bold">${totalPaid.toLocaleString()}</h3>
                </div>
            )}

            {/* List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {slips.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">No payslips found.</div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Reference</th>
                                <th className="px-6 py-4 font-semibold">Employee</th>
                                <th className="px-6 py-4 font-semibold">Date</th>
                                <th className="px-6 py-4 font-semibold text-right">Basic</th>
                                <th className="px-6 py-4 font-semibold text-right">Net Pay</th>
                                <th className="px-6 py-4 font-semibold text-center">Status</th>
                                <th className="px-6 py-4 font-semibold"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {slips.map(slip => (
                                <tr key={slip.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-slate-400" />
                                        {slip.name}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{slip.employee_id[1]}</td>
                                    <td className="px-6 py-4 text-slate-600">{splitDate(slip.date)}</td>
                                    <td className="px-6 py-4 text-right text-slate-500">${slip.basic_wage.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right font-bold text-slate-900">${slip.net_wage.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-center">
                                        {slip.state === 'paid' ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                                PAID
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500">
                                                DRAFT
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors">
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Create Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100">
                            <h3 className="text-xl font-bold text-slate-900">Generate Payslip</h3>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Employee</label>
                                <select required className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none"
                                    value={formData.employeeId}
                                    onChange={e => setFormData({ ...formData, employeeId: e.target.value })}>
                                    <option value="">Select...</option>
                                    {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Payment Date</label>
                                <input type="date" required className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none"
                                    value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Basic Wage</label>
                                    <input type="number" required className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none"
                                        value={formData.basicWage} onChange={e => setFormData({ ...formData, basicWage: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Allowances</label>
                                    <input type="number" className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none"
                                        value={formData.allowances} onChange={e => setFormData({ ...formData, allowances: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Deductions</label>
                                <input type="number" className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none"
                                    value={formData.deductions} onChange={e => setFormData({ ...formData, deductions: e.target.value })} />
                            </div>
                            <div className="pt-4 flex justify-end gap-2">
                                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-50 font-medium">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">Generate</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function splitDate(d: string) {
    if (!d) return '-';
    return d.split(' ')[0];
}
