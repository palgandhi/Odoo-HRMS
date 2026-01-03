import { useState, useEffect } from 'react';
import { Plus, Star, Calendar, MessageSquare, User, BarChart2 } from 'lucide-react';
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
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">{isManager ? 'Team Performance' : 'My Reviews'}</h2>
                    <p className="text-slate-500">Track goals, feedback, and growth</p>
                </div>
                {isManager && (
                    <button
                        onClick={openCreate}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-lg shadow-blue-500/20"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        New Review
                    </button>
                )}
            </div>

            {reviews.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-200">
                    <BarChart2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-700">No Reviews Found</h3>
                    <p className="text-slate-500">{isManager ? 'Create a review to get started.' : 'You have no scheduled reviews.'}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reviews.map(review => (
                        <div key={review.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col h-full hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase ${review.state === 'finalized' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {review.state}
                                </span>
                                {review.state === 'finalized' && renderStars(review.manager_rating)}
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 mb-1">{review.name}</h3>
                            <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
                                <User className="w-4 h-4" />
                                {review.employee_id[1]}
                            </div>

                            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 p-2 rounded-lg mb-4">
                                <Calendar className="w-3 h-3" />
                                {review.start_date} — {review.end_date}
                            </div>

                            {review.manager_feedback && (
                                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 mb-4 flex-1">
                                    <p className="text-xs font-bold text-yellow-800 mb-1 flex items-center gap-1">
                                        <MessageSquare className="w-3 h-3" /> Manager Feedback
                                    </p>
                                    <p className="text-sm text-yellow-900 italic">"{review.manager_feedback}"</p>
                                </div>
                            )}

                            {isManager && (
                                <button
                                    onClick={() => openEdit(review)}
                                    className="w-full mt-auto py-2 border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-slate-50 transition-colors"
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
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100">
                            <h3 className="text-xl font-bold text-slate-900">
                                {selectedReview ? 'Grade Review' : 'Schedule Review'}
                            </h3>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {!selectedReview && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                                        <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Employee</label>
                                        <select required value={formData.employeeId} onChange={e => setFormData({ ...formData, employeeId: e.target.value })} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg outline-none">
                                            <option value="">Select Employee...</option>
                                            {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                                            <input type="date" required value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                                            <input type="date" required value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none" />
                                        </div>
                                    </div>
                                </>
                            )}

                            {selectedReview && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Rating (0-5)</label>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map(num => (
                                                <button
                                                    key={num}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, rating: num.toString() })}
                                                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${parseInt(formData.rating) >= num
                                                        ? 'bg-yellow-400 text-white shadow-md'
                                                        : 'bg-slate-100 text-slate-400'
                                                        }`}
                                                >
                                                    <Star className="w-5 h-5 fill-current" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Feedback</label>
                                        <textarea
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none h-32 resize-none"
                                            value={formData.feedback}
                                            onChange={e => setFormData({ ...formData, feedback: e.target.value })}
                                            placeholder="Enter your feedback here..."
                                        />
                                    </div>
                                </>
                            )}

                            <div className="pt-4 flex justify-end gap-2">
                                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-50 font-medium">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20">
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
