import React, { useState } from 'react';
import { X, Save, Lock, User, Loader, CheckCircle } from 'lucide-react';
import { executeKw } from '../../services/odoo';
import type { UserSession } from '../../App';

interface CreateUserModalProps {
    session: UserSession;
    employeeId: number;
    employeeName: string;
    employeeEmail: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateUserModal({ session, employeeId, employeeName, employeeEmail, onClose, onSuccess }: CreateUserModalProps) {
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [login, setLogin] = useState(employeeEmail || '');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }
        setLoading(true);

        try {
            // 1. Create Data Object
            // In Odoo, creating a user automatically creates a partner.
            // We set 'login' (username), 'name', and 'password'.
            const userData = {
                name: employeeName,
                login: login,
                password: password,
                active: true,
            };

            // 2. Create User
            const newUserId = await executeKw(
                session.uid,
                session.password,
                'res.users',
                'create',
                [userData]
            );

            if (typeof newUserId === 'number') {
                // 3. Link Employee to this User
                await executeKw(
                    session.uid,
                    session.password,
                    'hr.employee',
                    'write',
                    [[employeeId], { user_id: newUserId }]
                );
                onSuccess();
                onClose();
            } else {
                throw new Error("Failed to return new User ID");
            }
        } catch (err: any) {
            console.error(err);
            alert("Failed to create user. Email/Login might already exist.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900">Grant System Access</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="font-bold text-blue-900 text-sm">Employee</p>
                            <p className="text-blue-700 text-sm">{employeeName}</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Login (Email)</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={login}
                            onChange={(e) => setLogin(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Set Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
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
                            className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2 shadow-lg shadow-green-500/20"
                        >
                            {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                            Create Credentials
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
