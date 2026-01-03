import React, { useState } from 'react';
import { X, Save, Loader } from 'lucide-react';
import { executeKw } from '../../services/odoo';
import type { UserSession } from '../../App';

interface EmployeeFormProps {
    session: UserSession;
    onClose: () => void;
    onSuccess: () => void;
}

export default function EmployeeForm({ session, onClose, onSuccess }: EmployeeFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        work_email: '',
        mobile_phone: '',
        // Defaulting to empty strings, which Odoo handles well
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Create employee in Odoo
            await executeKw(
                session.uid,
                session.password,
                'hr.employee',
                'create',
                [formData]
            );

            onSuccess();
            onClose();
        } catch (err) {
            console.error("Failed to create employee", err);
            alert("Failed to create employee. Check console for details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900">Add New Employee</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Jane Doe"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Work Email</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.work_email}
                            onChange={(e) => setFormData({ ...formData, work_email: e.target.value })}
                            placeholder="jane@company.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Phone</label>
                        <input
                            type="tel"
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.mobile_phone}
                            onChange={(e) => setFormData({ ...formData, mobile_phone: e.target.value })}
                            placeholder="+1 234 567 890"
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/20"
                        >
                            {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Create Employee
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
