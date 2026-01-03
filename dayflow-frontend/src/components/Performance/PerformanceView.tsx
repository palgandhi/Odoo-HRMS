import { useState, useEffect } from 'react';
import { Plus, Star, Calendar, MessageSquare, BarChart2 } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import type { UserSession } from '../../App';
import { PerformanceService, type PerformanceReview } from '../../services/PerformanceService';
import { executeKw } from '../../services/odoo'; // Still needed for Employee fetch

interface PerformanceViewProps {
    session: UserSession;
}

export default function PerformanceView({ session }: PerformanceViewProps) {
    const isManager = session.isAdmin;
    const [reviews, setReviews] = useState<PerformanceReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Create/Edit State
    const [showForm, setShowForm] = useState(false);
    const [selectedReview, setSelectedReview] = useState<PerformanceReview | null>(null);
    const [employees, setEmployees] = useState<any[]>([]);

    // Form Data
    const [formData, setFormData] = useState({
        title: '',
        employeeId: '',
        startDate: '',
        endDate: '',
        rating: '0',
        feedback: ''
    });

    const fetchReviews = async () => {
        try {
            setLoading(true);
            setError('');

            let domain: any[] = [];
            if (!isManager) {
                // Employee: Filter by My User -> Employee
                // We need to find the Employee ID linked to this User first
                const empRes = await executeKw(session.uid, session.password, 'hr.employee', 'search_read', [[['user_id', '=', session.uid]]], { fields: ['id'] });
                if (empRes.length > 0) {
                    domain = [['employee_id', '=', empRes[0].id]];
                } else {
                    // No employee profile found means no reviews to show
                    setReviews([]);
                    setLoading(false);
                    return;
                }
            }

            const result = await PerformanceService.searchReviews(session, domain);
            setReviews(result);

            if (isManager && employees.length === 0) {
                // Fetch employees list for dropdown (Refactor to Service later)
                const empList = await executeKw(session.uid, session.password, 'hr.employee', 'search_read', [[]], { fields: ['id', 'name'] });
                setEmployees(empList);
            }

        } catch (err: any) {
            console.error(err);
            setError("Failed to load reviews. Ensure 'Dayflow Performance' module is installed in Odoo.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [session]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (selectedReview) {
                // Update
                await PerformanceService.updateReview(session, selectedReview.id, {
                    manager_rating: formData.rating,
                    manager_feedback: formData.feedback,
                    state: formData.rating !== '0' ? 'finalized' : 'ongoing'
                });
            } else {
                // Create
                await PerformanceService.createReview(session, {
                    name: formData.title,
                    employee_id: parseInt(formData.employeeId),
                    start_date: formData.startDate,
                    end_date: formData.endDate,
                    state: 'ongoing'
                });
            }
            setShowForm(false);
            setSelectedReview(null);
            fetchReviews();
        } catch (err) {
            console.error(err);
            alert("Failed to save.");
        }
    };

    const openEdit = (review: PerformanceReview) => {
        setSelectedReview(review);
        setFormData({
            title: review.name,
            employeeId: review.employee_id[0].toString(),
            startDate: review.start_date,
            endDate: review.end_date,
            rating: review.manager_rating || '0',
            feedback: typeof review.manager_feedback === 'string' ? review.manager_feedback : ''
        });
        setShowForm(true);
    };

    const openCreate = () => {
        setSelectedReview(null);
        setFormData({
            title: 'Q1 Performance Review',
            employeeId: '',
            startDate: '',
            endDate: '',
            rating: '0',
            feedback: ''
        });
        setShowForm(true);
    };

    const renderStars = (ratingStr: string) => {
        const rating = parseInt(ratingStr || '0');
        return (
            <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-slate-200'}`}
                    />
                ))}
            </div>
        );
    };

    if (loading && reviews.length === 0) return <div className="p-12 text-center text-slate-500">Loading reviews...</div>;
    if (error) return <div className="p-12 text-center text-red-500">{error}</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{isManager ? 'Team Performance' : 'My Reviews'}</h2>
                    <p className="text-slate-500 mt-1">Track goals, feedback, and professional growth</p>
                </div>
                {isManager && (
                    <button
                        onClick={openCreate}
                        className="flex items-center px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all transform hover:-translate-y-0.5"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        New Review
                    </button>
                )}
            </div>

            {reviews.length === 0 ? (
                <div className="bg-white rounded-[2rem] p-20 text-center border border-dashed border-slate-200 shadow-sm">
                    <div className="w-20 h-20 bg-slate-50 rounded-full mx-auto flex items-center justify-center mb-6">
                        <BarChart2 className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">No Reviews Found</h3>
                    <p className="text-slate-500 mt-2 max-w-sm mx-auto">{isManager ? 'Create the first performance review to get started.' : 'You have no scheduled performance reviews.'}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {reviews.map((review, i) => (
                        <div key={review.id} className="bg-white rounded-[2rem] p-6 shadow-lg shadow-indigo-900/5 border border-slate-100 flex flex-col h-full hover:shadow-xl hover:shadow-indigo-900/10 transition-all duration-300 transform hover:-translate-y-1 animate-in slide-in-from-bottom-4" style={{ animationDelay: `${i * 100}ms` }}>

                            <div className="flex justify-between items-start mb-6">
                                <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${review.state === 'finalized' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-indigo-100 text-indigo-700 border border-indigo-200'}`}>
                                    {review.state}
                                </span>
                                {review.state === 'finalized' && <div className="scale-90 origin-top-right">{renderStars(review.manager_rating)}</div>}
                            </div>

                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight">{review.name}</h3>
                                <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                                        {review.employee_id[1].charAt(0)}
                                    </div>
                                    {review.employee_id[1]}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl mb-6 w-fit">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                {review.start_date} <span className="text-slate-300">→</span> {review.end_date}
                            </div>

                            {review.manager_feedback && (
                                <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 mb-6 flex-1 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <MessageSquare className="w-16 h-16 text-amber-500" />
                                    </div>
                                    <p className="text-xs font-bold text-amber-800 mb-1 flex items-center gap-1 uppercase tracking-wide">
                                        Manager Feedback
                                    </p>
                                    <p className="text-sm text-amber-900/80 italic leading-relaxed relative z-10">"{review.manager_feedback}"</p>
                                </div>
                            )}

                            {isManager && (
                                <button
                                    onClick={() => openEdit(review)}
                                    className={`w-full mt-auto py-3 rounded-xl font-bold text-sm transition-all ${review.state === 'finalized'
                                        ? 'border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-500/20'
                                        }`}
                                >
                                    {review.state === 'finalized' ? 'Edit Rating' : 'Grade Review'}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Modal logic is same, leveraging formData bound to inputs */}
            {showForm && (
                <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100">
                        <div className="p-8 border-b border-slate-100 bg-slate-50/50 rounded-t-3xl">
                            <h3 className="text-xl font-bold text-slate-900">
                                {selectedReview ? 'Grade Review' : 'Schedule Review'}
                            </h3>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            {!selectedReview && (
                                <>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Title</label>
                                        <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-medium" placeholder="e.g. Q1 Performance Review" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Employee</label>
                                        <div className="relative">
                                            <select required value={formData.employeeId} onChange={e => setFormData({ ...formData, employeeId: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-medium appearance-none">
                                                <option value="">Select Employee...</option>
                                                {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                                            </select>
                                            <div className="absolute right-4 top-3.5 pointer-events-none text-slate-500">
                                                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Start Date</label>
                                            <input type="date" required value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-medium" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">End Date</label>
                                            <input type="date" required value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-medium" />
                                        </div>
                                    </div>
                                </>
                            )}

                            {selectedReview && (
                                <>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Rating (0-5)</label>
                                        <div className="flex gap-3">
                                            {[1, 2, 3, 4, 5].map(num => (
                                                <button
                                                    key={num}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, rating: num.toString() })}
                                                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${parseInt(formData.rating) >= num
                                                        ? 'bg-amber-400 text-white shadow-lg shadow-amber-400/30 transform scale-105'
                                                        : 'bg-slate-50 text-slate-300 hover:bg-slate-100'
                                                        }`}
                                                >
                                                    <Star className="w-6 h-6 fill-current" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex gap-6 items-start">
                                        <div className="flex-1">
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Manager Feedback</label>
                                            <textarea
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none h-40 resize-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500"
                                                value={formData.feedback}
                                                onChange={e => setFormData({ ...formData, feedback: e.target.value })}
                                                placeholder="Enter your detailed feedback here..."
                                            />
                                        </div>
                                        {/* Dynamic Radar Chart Preview */}
                                        <div className="w-40 hidden md:flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Skill Matrix</span>
                                            <div className="w-32 h-32">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <RadarChart cx="50%" cy="50%" outerRadius="65%" data={[
                                                        { subject: 'Impact', A: parseInt(formData.rating) || 0, fullMark: 5 },
                                                        { subject: 'Growth', A: parseInt(formData.rating) || 0, fullMark: 5 },
                                                        { subject: 'Tech', A: parseInt(formData.rating) || 0, fullMark: 5 },
                                                        { subject: 'Collab', A: parseInt(formData.rating) || 0, fullMark: 5 },
                                                        { subject: 'Lead', A: parseInt(formData.rating) || 0, fullMark: 5 },
                                                    ]}>
                                                        <PolarGrid stroke="#e2e8f0" />
                                                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 8, fill: '#64748b', fontWeight: 'bold' }} />
                                                        <Radar name="Skills" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                                                    </RadarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 text-slate-600 hover:bg-slate-50 font-bold rounded-xl transition-colors">Cancel</button>
                                <button type="submit" className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all transform active:scale-95">
                                    {selectedReview ? 'Submit Grade' : 'Schedule Review'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
