import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, ArrowRight, Loader } from 'lucide-react';

export default function Login({ onLogin }: { onLogin: () => void }) {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate network request for UI demo
        setTimeout(() => {
            setLoading(false);
            onLogin(); // Proceed to dashboard
        }, 1500);
    };

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Left Side - Visuals */}
            <div className="hidden lg:flex w-1/2 bg-blue-600 relative overflow-hidden items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700" />
                <div className="relative z-10 text-center text-white px-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-5xl font-bold mb-6">Dayflow HRMS</h1>
                        <p className="text-xl text-blue-100 max-w-md mx-auto leading-relaxed">
                            Experience the future of human resource management.
                            Modern, efficient, and designed for people.
                        </p>
                    </motion.div>
                </div>

                {/* Animated Background Elements */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                    transition={{ duration: 20, repeat: Infinity }}
                    className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{ scale: [1, 1.5, 1], rotate: [0, -45, 0] }}
                    transition={{ duration: 15, repeat: Infinity }}
                    className="absolute -bottom-24 -right-24 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl"
                />
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    <div className="text-center lg:text-left mb-10">
                        <h2 className="text-3xl font-bold text-slate-900">Welcome Back</h2>
                        <p className="text-slate-500 mt-2">Please sign in to your dashboard</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                    placeholder="admin@dayflow.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center text-slate-600 cursor-pointer hover:text-slate-900">
                                <input type="checkbox" className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                Remember me
                            </label>
                            <a href="#" className="font-medium text-blue-600 hover:text-blue-700">Forgot password?</a>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader className="w-5 h-5 animate-spin" />
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-slate-500">
                        Don't have an account? <a href="#" className="font-medium text-blue-600 hover:text-blue-700">Contact HR</a>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
