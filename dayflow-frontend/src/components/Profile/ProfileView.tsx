import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Mail, Phone, MapPin, Building, Shield,
    Award, Clock, CheckCircle, Hash, Briefcase, User, Edit3
} from 'lucide-react';
import { executeKw } from '../../services/odoo';
import type { UserSession } from '../../App';
import { useToast } from '../ui/Toast';

interface ProfileViewProps {
    session: UserSession;
    employeeId?: number; // Optional: To view others
}

interface EmployeeProfile {
    id: number;
    name: string;
    job_title: string;
    department_id: [number, string] | false;
    work_email: string;
    mobile_phone: string;
    work_location_id: [number, string] | false;
    parent_id: [number, string] | false; // Manager
    image_1920?: string;
    create_date: string; // Joined date
    active?: boolean;
}

export default function ProfileView({ session, employeeId }: ProfileViewProps) {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<EmployeeProfile | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'settings'>('overview');
    const { toast } = useToast();

    useEffect(() => {
        fetchProfile();
    }, [session, employeeId]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const domain = employeeId
                ? [['id', '=', employeeId]]
                : [['user_id', '=', session.uid]];

            const fields = [
                'name', 'job_title', 'department_id', 'work_email',
                'mobile_phone', 'work_location_id', 'parent_id',
                'image_1920', 'create_date', 'active'
            ];

            const result = await executeKw(
                session.uid,
                session.password,
                'hr.employee',
                'search_read',
                [domain],
                { fields, limit: 1 }
            );

            if (result && result.length > 0) {
                setProfile(result[0]);
            } else {
                toast({ title: 'Profile Not Found', description: 'Could not load employee data.', variant: 'error' });
            }
        } catch (err) {
            console.error(err);
            toast({ title: 'Error', description: 'Connection failed.', variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-96">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
        </div>
    );

    if (!profile) return null;

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-700">

            {/* HERO SECTION */}
            <div className="relative rounded-[2.5rem] overflow-hidden bg-white shadow-xl shadow-slate-200/50 border border-slate-100 group">
                {/* Dynamic Cover */}
                <div className="h-64 w-full bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-30 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
                    <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-[80px]"></div>
                    <div className="absolute top-10 left-10 w-40 h-40 bg-pink-500/20 rounded-full blur-[60px]"></div>
                </div>

                <div className="px-10 pb-10 relative flex flex-col md:flex-row items-end gap-8 -mt-20">
                    {/* Avatar Card */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative group"
                    >
                        <div className="w-40 h-40 rounded-[2rem] bg-white p-2 shadow-2xl skew-y-0 group-hover:skew-y-1 transition-transform duration-500 ease-out">
                            {profile.image_1920 ? (
                                <img src={`data:image/png;base64,${profile.image_1920}`} className="w-full h-full object-cover rounded-[1.5rem]" alt="Profile" />
                            ) : (
                                <div className="w-full h-full rounded-[1.5rem] bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-5xl font-bold text-slate-400">
                                    {profile.name.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-xl border-[4px] border-white shadow-lg" title="Verified Employee">
                            <Shield className="w-5 h-5 fill-current" />
                        </div>
                    </motion.div>

                    {/* Identity Info */}
                    <div className="flex-1 mb-2">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                            <div>
                                <h1 className="text-4xl font-bold text-slate-900 tracking-tight">{profile.name}</h1>
                                <div className="flex flex-wrap items-center gap-3 mt-2 text-slate-600 font-medium">
                                    <span className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm border border-indigo-100">
                                        <Briefcase className="w-3.5 h-3.5" />
                                        {profile.job_title || 'Team Member'}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4 text-slate-400" />
                                        {Array.isArray(profile.work_location_id) ? profile.work_location_id[1] : 'Remote / HQ'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center gap-2">
                                    <Edit3 className="w-4 h-4" />
                                    Edit Profile
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navbar */}
                <div className="px-10 py-2 border-t border-slate-100 bg-slate-50/50 flex gap-8">
                    {['overview', 'activity', 'settings'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`pb-4 px-2 text-sm font-bold border-b-2 transition-all capitalize ${activeTab === tab ? 'text-indigo-600 border-indigo-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* CONTENT GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT: Info Cards */}
                <div className="lg:col-span-2 space-y-6">
                    {activeTab === 'overview' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

                            {/* Key Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Tenure</p>
                                    <h4 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                        <Clock className="w-6 h-6 text-indigo-500" />
                                        {new Date().getFullYear() - new Date(profile.create_date).getFullYear()} Years
                                    </h4>
                                </div>
                                <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Role Level</p>
                                    <h4 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                        <Award className="w-6 h-6 text-purple-500" />
                                        {(new Date().getFullYear() - new Date(profile.create_date).getFullYear()) > 3 ? 'Senior' : (new Date().getFullYear() - new Date(profile.create_date).getFullYear()) > 1 ? 'Mid-Level' : 'Junior'}
                                    </h4>
                                </div>
                                <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Status</p>
                                    <h4 className={`text-2xl font-bold flex items-center gap-2 ${profile.active !== false ? 'text-emerald-600' : 'text-slate-400'}`}>
                                        <CheckCircle className="w-6 h-6" />
                                        {profile.active !== false ? 'Active' : 'Inactive'}
                                    </h4>
                                </div>
                            </div>

                            {/* Contact Details */}
                            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    Contact Information
                                    <div className="h-px bg-slate-100 flex-1 ml-4"></div>
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Mail className="w-5 h-5" /></div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-1">Email Address</p>
                                            <p className="text-slate-900 font-medium text-lg breaking-all">{profile.work_email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><Phone className="w-5 h-5" /></div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-1">Mobile Phone</p>
                                            <p className="text-slate-900 font-medium text-lg">{profile.mobile_phone || 'Not Listed'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl"><Building className="w-5 h-5" /></div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-1">Department</p>
                                            <p className="text-slate-900 font-medium text-lg">{Array.isArray(profile.department_id) ? profile.department_id[1] : '-'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><User className="w-5 h-5" /></div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-1">Reports To</p>
                                            <p className="text-slate-900 font-medium text-lg">{Array.isArray(profile.parent_id) ? profile.parent_id[1] : 'Direct to Board'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </motion.div>
                    )}

                    {activeTab === 'activity' && (
                        <div className="bg-white p-12 rounded-[2rem] border border-dashed border-slate-200 text-center">
                            <Clock className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                            <h3 className="font-bold text-slate-900 text-xl">Activity Log</h3>
                            <p className="text-slate-500 mt-2">Recent system interactions will appear here.</p>
                        </div>
                    )}
                </div>

                {/* RIGHT: Digital Badge Preview */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[4rem] pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/20 blur-2xl rounded-full"></div>

                        <div className="flex justify-between items-start mb-12 relative z-10">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold font-display">D</div>
                                <span className="font-bold tracking-tight">Dayflow</span>
                            </div>
                            <Hash className="w-6 h-6 text-slate-500" />
                        </div>

                        <div className="relative z-10">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 overflow-hidden">Employee ID</p>
                            <h2 className="text-3xl font-mono tracking-widest text-shadow-sm">DF-{profile.id.toString().padStart(4, '0')}</h2>
                        </div>

                        <div className="mt-8 flex justify-between items-end relative z-10">
                            <div>
                                <p className="text-slate-400 text-[10px] font-bold uppercase mb-1">Joined</p>
                                <p className="font-medium">{new Date(profile.create_date).toLocaleDateString()}</p>
                            </div>
                            <div className="w-12 h-12 qr-code bg-white p-1 rounded-lg">
                                {/* Mock QR */}
                                <div className="w-full h-full bg-slate-900 pattern-grid-lg"></div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
