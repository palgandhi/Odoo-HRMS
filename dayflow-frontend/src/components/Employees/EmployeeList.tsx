import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Mail, Phone, RefreshCw, Key, User } from 'lucide-react';
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
    const [filterDept, setFilterDept] = useState('All');

    // Derived Departments
    const departments = ['All', ...Array.from(new Set(employees.map(e => Array.isArray(e.department_id) ? e.department_id[1] : 'Unassigned')))].sort();

    const filteredEmployees = employees.filter(e => {
        if (filterDept === 'All') return true;
        const dept = Array.isArray(e.department_id) ? e.department_id[1] : 'Unassigned';
        return dept === filterDept;
    });

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
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm animate-in fade-in duration-500">
                <User className="w-16 h-16 text-slate-300 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-slate-900">No Profile Found</h3>
                <p className="text-slate-500 max-w-sm mx-auto mt-2">Your user account is not linked to an employee profile. Please contact HR.</p>
            </div>
        );

        const profile = employees[0];
        return (
            <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
                    {/* Cover Photo */}
                    <div className="h-48 bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
                    </div>

                    <div className="px-10 pb-10 relative">
                        {/* Avatar */}
                        <div className="relative -mt-20 mb-6 flex justify-between items-end">
                            <div className="w-40 h-40 rounded-3xl bg-white p-2 shadow-2xl skew-y-0 hover:skew-y-1 transition-transform duration-500">
                                <div className="w-full h-full rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-5xl font-bold text-indigo-600 shadow-inner">
                                    {profile.name.charAt(0)}
                                </div>
                            </div>
                            <span className="mb-4 bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-bold border border-emerald-200 shadow-sm flex items-center gap-2">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                Active Status
                            </span>
                        </div>

                        <div className="mb-10">
                            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">{profile.name}</h1>
                            <p className="text-xl text-indigo-600 font-medium mt-1">{profile.job_title || 'Employee'}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-slate-50/50 p-8 rounded-3xl border border-slate-100/50 hover:bg-slate-50 transition-colors">
                                <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-3 text-lg">
                                    <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-500"><Mail className="w-5 h-5" /></div>
                                    Contact Information
                                </h4>
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Work Email</p>
                                        <p className="text-slate-900 font-medium text-lg">{profile.work_email || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Mobile Phone</p>
                                        <p className="text-slate-900 font-medium text-lg">{profile.mobile_phone || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50/50 p-8 rounded-3xl border border-slate-100/50 hover:bg-slate-50 transition-colors">
                                <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-3 text-lg">
                                    <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-500"><User className="w-5 h-5" /></div>
                                    Role Details
                                </h4>
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Department</p>
                                        <p className="text-slate-900 font-medium text-lg">{Array.isArray(profile.department_id) ? profile.department_id[1] : '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Manager</p>
                                        <p className="text-slate-900 font-medium text-lg text-slate-400 italic">Not Assigned</p>
                                    </div>
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
        <div className="animate-in fade-in duration-500">
            {/* Action Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-center">
                <div className="relative flex-1 max-w-lg w-full group">
                    <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search employees by name, role..."
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none shadow-sm transition-all text-sm font-medium"
                    />
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button onClick={fetchEmployees} className="p-3 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 hover:text-indigo-600 shadow-sm transition-all">
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="flex-1 md:flex-none flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all transform hover:-translate-y-0.5"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Add New Employee
                    </button>
                </div>
            </div>

            {/* Department Filter Tabs */}
            <div className="flex items-center gap-3 overflow-x-auto pb-6 custom-scrollbar">
                {departments.map(dept => (
                    <button
                        key={dept}
                        onClick={() => setFilterDept(dept)}
                        className={`whitespace-nowrap px-5 py-2.5 rounded-2xl text-sm font-bold transition-all border ${filterDept === dept
                                ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20 transform scale-105'
                                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                            }`}
                    >
                        {dept}
                        {dept !== 'All' && (
                            <span className={`ml-2 text-xs opacity-60 ${filterDept === dept ? 'text-white' : 'text-slate-400'}`}>
                                {employees.filter(e => (Array.isArray(e.department_id) ? e.department_id[1] : 'Unassigned') === dept).length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredEmployees.length === 0 ? (
                    <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                        <User className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-900">No employees found in {filterDept}</h3>
                        <p className="text-slate-500">Try adjusting your search criteria.</p>
                    </div>
                ) : (
                    filteredEmployees.map((employee, i) => (
                        <motion.div
                            key={employee.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white rounded-[2rem] p-2 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group flex flex-col h-full relative overflow-hidden"
                        >
                            {/* Initials Gradient Background (Top HalF) */}
                            <div className={`h-32 rounded-[1.5rem] bg-gradient-to-br opacity-100 transition-opacity ${['from-blue-500 to-indigo-600', 'from-emerald-400 to-teal-600', 'from-orange-400 to-pink-600', 'from-purple-500 to-violet-600'][employee.id % 4]
                                } relative overflow-hidden`}>
                                <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                                {/* Edit Button (Absolute Top Right) */}
                                <button className="absolute top-4 right-4 p-2 bg-black/10 hover:bg-black/20 text-white rounded-xl backdrop-blur-md transition-colors opacity-0 group-hover:opacity-100">
                                    <User className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="px-6 pb-6 flex-1 flex flex-col">
                                {/* Avatar Floating */}
                                <div className="relative -mt-12 mb-4">
                                    <div className="w-24 h-24 rounded-2xl bg-white p-1.5 shadow-lg mx-auto transform group-hover:-translate-y-1 transition-transform duration-300">
                                        <div className="w-full h-full rounded-xl bg-slate-100 flex items-center justify-center text-3xl font-bold text-slate-700">
                                            {employee.image_1920 ? (
                                                <img src={`data:image/png;base64,${employee.image_1920}`} alt="Avatar" className="w-full h-full object-cover rounded-xl" />
                                            ) : employee.name.charAt(0)}
                                        </div>
                                    </div>
                                </div>

                                {/* Text Content */}
                                <div className="text-center mb-6">
                                    <h3 className="font-bold text-slate-900 text-xl leading-tight mb-1">{employee.name}</h3>
                                    <p className="text-indigo-600 font-medium text-sm mb-2">{employee.job_title || 'Employee'}</p>
                                    <span className="inline-block px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-bold uppercase tracking-wide">
                                        {Array.isArray(employee.department_id) ? employee.department_id[1] : 'No Dept'}
                                    </span>
                                </div>

                                <div className="space-y-3 pt-6 border-t border-slate-50 mt-auto">
                                    <div className="flex items-center text-sm text-slate-600 group-hover:text-indigo-600 transition-colors">
                                        <div className="w-8 flex justify-center"><Mail className="w-4 h-4 opacity-50" /></div>
                                        <span className="truncate font-medium">{employee.work_email || '-'}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-slate-600">
                                        <div className="w-8 flex justify-center"><Phone className="w-4 h-4 opacity-50" /></div>
                                        <span className="truncate font-medium">{employee.mobile_phone || '-'}</span>
                                    </div>
                                </div>

                                {/* Account Status Footer */}
                                <div className="mt-6">
                                    {employee.user_id ? (
                                        <div className="w-full py-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                            Active Account
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setSelectedEmployee(employee)}
                                            className="w-full py-2.5 border border-indigo-100 text-indigo-600 hover:bg-indigo-50 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Key className="w-3 h-3" />
                                            Create Login
                                        </button>
                                    )}
                                </div>
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
