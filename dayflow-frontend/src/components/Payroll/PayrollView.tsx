
import { useState, useEffect } from 'react';
import { Plus, DollarSign, FileText, Download, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { UserSession } from '../../App';
import { PayrollService, type Payslip } from '../../services/PayrollService';
import { executeKw } from '../../services/odoo';

interface PayrollViewProps {
    session: UserSession;
}

export default function PayrollView({ session }: PayrollViewProps) {
    const isManager = session.isAdmin;
    const [slips, setSlips] = useState<Payslip[]>([]);
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
        try {
            let domain: any[] = [];

            if (!isManager) {
                // Employee: Only my payslips
                const empRes = await executeKw(session.uid, session.password, 'hr.employee', 'search_read', [[['user_id', '=', session.uid]]], { fields: ['id'] });
                if (empRes.length > 0) {
                    domain = [['employee_id', '=', empRes[0].id]];
                } else {
                    setSlips([]);
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
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await PayrollService.createPayslip(session, {
                name: `Payslip - ${formData.date} `,
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



    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{isManager ? 'Payroll Management' : 'My Payslips'}</h2>
                    <p className="text-slate-500 mt-1">Manage salaries and payment history</p>
                </div>
                {isManager && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all transform hover:-translate-y-0.5"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Generate Slip
                    </button>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-[2rem] p-6 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-indigo-100 font-medium mb-1">Total Net Pay</p>
                        <h3 className="text-3xl font-bold tracking-tight">${slips.reduce((sum, s) => sum + s.net_wage, 0).toLocaleString()}</h3>
                    </div>
                    <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4">
                        <DollarSign className="w-32 h-32" />
                    </div>
                </div>

                <div className="col-span-1 md:col-span-2 bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-emerald-500" />
                                Salary Distribution
                            </h4>
                        </div>
                    </div>
                    <div className="h-24 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={slips.slice(0, 10)}>
                                <XAxis dataKey="name" hide />
                                <YAxis hide />
                                <Bar dataKey="net_wage" fill="#6366f1" radius={[4, 4, 4, 4]} barSize={20} />
                                <Tooltip
                                    cursor={{ fill: '#f1f5f9' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    labelStyle={{ display: 'none' }}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                {slips.length === 0 ? (
                    <div className="p-20 text-center text-slate-400 font-medium">No payslips found in records.</div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-5 font-bold">Reference</th>
                                <th className="px-6 py-5 font-bold">Employee</th>
                                <th className="px-6 py-5 font-bold">Date</th>
                                <th className="px-6 py-5 font-bold text-right">Basic</th>
                                <th className="px-6 py-5 font-bold text-right">Net Pay</th>
                                <th className="px-6 py-5 font-bold text-center">Status</th>
                                <th className="px-6 py-5 font-bold"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {slips.map(slip => (
                                <tr key={slip.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-8 py-5 font-medium text-slate-900 flex items-center gap-3">
                                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-100 transition-colors">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        {slip.name}
                                    </td>
                                    <td className="px-6 py-5 text-slate-600 font-medium">{slip.employee_id[1]}</td>
                                    <td className="px-6 py-5 text-slate-500">{splitDate(slip.date)}</td>
                                    <td className="px-6 py-5 text-right text-slate-500 font-mono">${slip.basic_wage.toLocaleString()}</td>
                                    <td className="px-6 py-5 text-right font-bold text-slate-900 font-mono text-base">${slip.net_wage.toLocaleString()}</td>
                                    <td className="px-6 py-5 text-center">
                                        {slip.state === 'paid' ? (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                                PAID
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
                                                DRAFT
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 p-2 rounded-xl transition-all">
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
                <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100">
                        <div className="p-8 border-b border-slate-100 bg-slate-50/50 rounded-t-3xl">
                            <h3 className="text-2xl font-bold text-slate-900">Generate Payslip</h3>
                        </div>
                        <form onSubmit={handleCreate} className="p-8 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Employee</label>
                                <div className="relative">
                                    <select required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-medium appearance-none"
                                        value={formData.employeeId}
                                        onChange={e => setFormData({ ...formData, employeeId: e.target.value })}>
                                        <option value="">Select Employee...</option>
                                        {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                    </select>
                                    <div className="absolute right-4 top-3.5 pointer-events-none text-slate-500">
                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Payment Date</label>
                                <input type="date" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500"
                                    value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Basic Wage</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-3 text-slate-400">$</span>
                                        <input type="number" required className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-mono"
                                            value={formData.basicWage} onChange={e => setFormData({ ...formData, basicWage: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Allowances</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-3 text-slate-400">$</span>
                                        <input type="number" className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-mono"
                                            value={formData.allowances} onChange={e => setFormData({ ...formData, allowances: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Deductions</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-3 text-slate-400">$</span>
                                    <input type="number" className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-mono"
                                        value={formData.deductions} onChange={e => setFormData({ ...formData, deductions: e.target.value })} />
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 text-slate-600 hover:bg-slate-50 font-bold rounded-xl transition-colors">Cancel</button>
                                <button type="submit" className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all transform active:scale-95">Generate Slip</button>
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
