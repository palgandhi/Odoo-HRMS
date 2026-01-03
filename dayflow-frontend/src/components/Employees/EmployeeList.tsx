import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Mail, Phone, RefreshCw, Key, UserCheck, User } from 'lucide-react';
import { executeKw } from '../../services/odoo';
import type { UserSession } from '../../App';
import EmployeeForm from './EmployeeForm';
import CreateUserModal from './CreateUserModal';

interface Employee {
    id: number;
    name: string;
    work_email: string;
    mobile_phone: string;
    job_title?: string;
    department_id?: [number, string] | false;
    user_id?: [number, string] | false;
    image_1920?: string; // Avatar
}

interface EmployeeListProps {
    session: UserSession;
}

export default function EmployeeList({ session }: EmployeeListProps) {
    const isManager = session.isAdmin;
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            setError('');

            const fields = ['name', 'work_email', 'mobile_phone', 'department_id', 'job_title', 'user_id'];

            let domain: any[] = [];
            if (!isManager) {
                // If not manager, only fetch MY profile
                // We filter by user_id = current uid
                domain = [['user_id', '=', session.uid]];
            }

            const result = await executeKw(
                session.uid,
                session.password,
                'hr.employee',
                'search_read',
                [domain],
                { fields: fields, limit: 100 }
            );

            setEmployees(result);
        } catch (err: any) {
            console.error("Failed to fetch employees", err);
            setError(err.message || 'Could not load employees.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, [session]);

    // RENDER: Loading / Error
    if (loading && !employees.length) return (
        <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-400">Loading...</p>
        </div>
    );

    if (error) return (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={fetchEmployees} className="text-sm font-bold underline">Try Again</button>
        </div>
    );

    // RENDER: My Profile (Non-Manager)
    if (!isManager) {
        if (employees.length === 0) return (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                <User className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-700">No Profile Found</h3>
                <p className="text-slate-500">Your user account is not linked to an employee profile.</p>
            </div>
        );

        const profile = employees[0];
        return (
            <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">My Profile</h2>
                <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
                    <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                    <div className="px-8 pb-8">
                        <div className="relative -mt-16 mb-6">
                            <div className="w-32 h-32 rounded-3xl bg-white p-1 shadow-xl">
                                <div className="w-full h-full rounded-2xl bg-slate-100 flex items-center justify-center text-4xl font-bold text-blue-600">
                                    {profile.name.charAt(0)}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900">{profile.name}</h1>
                                <p className="text-lg text-blue-600 font-medium">{profile.job_title || 'Employee'}</p>
                            </div>
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                                Active
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-slate-50 p-6 rounded-2xl">
                                <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <Mail className="w-5 h-5 text-slate-400" /> Contact Info
                                </h4>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase font-bold">Work Email</p>
                                        <p className="text-slate-700 font-medium">{profile.work_email || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase font-bold">Mobile</p>
                                        <p className="text-slate-700 font-medium">{profile.mobile_phone || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-2xl">
                                <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <User className="w-5 h-5 text-slate-400" /> Employment
                                </h4>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase font-bold">Department</p>
                                        <p className="text-slate-700 font-medium">{Array.isArray(profile.department_id) ? profile.department_id[1] : '-'}</p>
                                    </div>
                                    {/* Add more fields like Manager later */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // RENDER: Admin List View
    return (
        <div>
            {/* Action Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search employees..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                    />
                </div>
                <div className="flex gap-3">
                    <button onClick={fetchEmployees} className="p-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 shadow-sm transition-colors">
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-lg shadow-blue-500/20 transition-colors"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Add Employee
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {employees.length === 0 ? (
                    <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
                        <p className="text-slate-500">No employees found.</p>
                    </div>
                ) : (
                    employees.map((employee, i) => (
                        <motion.div
                            key={employee.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow group relative flex flex-col h-full"
                        >
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 flex items-center justify-center text-xl font-bold border-2 border-white shadow-sm shrink-0">
                                    {employee.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-lg leading-tight line-clamp-1">{employee.name}</h3>
                                    <p className="text-blue-600 font-medium text-sm mt-1 truncate">
                                        {employee.job_title || 'No Job Title'}
                                    </p>
                                    <p className="text-slate-400 text-xs mt-1 truncate">
                                        {Array.isArray(employee.department_id) ? employee.department_id[1] : 'No Dept'}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3 pt-6 border-t border-slate-50 mb-6 flex-1">
                                <div className="flex items-center text-sm text-slate-500">
                                    <div className="w-8 flex justify-center"><Mail className="w-4 h-4 text-slate-400" /></div>
                                    <span className="truncate">{employee.work_email || 'No Email'}</span>
                                </div>
                                <div className="flex items-center text-sm text-slate-500">
                                    <div className="w-8 flex justify-center"><Phone className="w-4 h-4 text-slate-400" /></div>
                                    <span>{employee.mobile_phone || 'No Phone'}</span>
                                </div>
                            </div>

                            {/* Account Status Footer */}
                            <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                                {employee.user_id ? (
                                    <div className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                                        <UserCheck className="w-3 h-3 mr-1" />
                                        Access Granted
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setSelectedEmployee(employee)}
                                        className="flex items-center text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors border border-blue-100 ml-auto"
                                    >
                                        <Key className="w-3 h-3 mr-1.5" />
                                        Grant Access
                                    </button>
                                )}
                            </div>

                        </motion.div>
                    ))
                )}
            </div>

            {showAddForm && (
                <EmployeeForm
                    session={session}
                    onClose={() => setShowAddForm(false)}
                    onSuccess={fetchEmployees}
                />
            )}

            {selectedEmployee && (
                <CreateUserModal
                    session={session}
                    employeeId={selectedEmployee.id}
                    employeeName={selectedEmployee.name}
                    employeeEmail={selectedEmployee.work_email}
                    onClose={() => setSelectedEmployee(null)}
                    onSuccess={fetchEmployees}
                />
            )}
        </div>
    );
}
