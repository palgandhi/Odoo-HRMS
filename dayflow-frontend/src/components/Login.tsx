import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader, AlertCircle, ArrowRight, CheckCircle } from 'lucide-react';
import { login, checkUserGroup } from '../services/odoo';
import type { UserSession } from '../App';

interface LoginProps {
    onLogin: (session: UserSession) => void;
}

const Tagline = ({ text, delay }: { text: string; delay: number }) => {
    // Split text into words for staggered animation
    const words = text.split(" ");

    const container = {
        hidden: { opacity: 0 },
        visible: (i = 1) => ({
            opacity: 1,
            transition: { staggerChildren: 0.12, delayChildren: delay * i }
        })
    };

    const child = {
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring" as const,
                damping: 12,
                stiffness: 100
            }
        },
        hidden: {
            opacity: 0,
            y: 20,
            transition: {
                type: "spring" as const,
                damping: 12,
                stiffness: 100
            }
        }
    };

    return (
        <motion.div
            style={{ overflow: "hidden", display: "flex", flexWrap: "wrap" }}
            variants={container}
            initial="hidden"
            animate="visible"
        >
            {words.map((word, index) => (
                <motion.span variants={child} style={{ marginRight: "0.25em" }} key={index}>
                    {word}
                </motion.span>
            ))}
        </motion.div>
    );
};

export default function Login({ onLogin }: LoginProps) {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('admin');
    const [password, setPassword] = useState('admin');
    const [error, setError] = useState('');
    const [activeField, setActiveField] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Hardcoded DB name for hackathon simplicity
            const dbName = 'dayflow_db';

            const uid = await login(dbName, email, password);

            if (typeof uid === 'number') {
                // Successful login
                const isSystemAdmin = await checkUserGroup(uid, password, 'base.group_system');

                // Artificial delay for effect if it's too fast
                setTimeout(() => {
                    onLogin({
                        uid,
                        username: email,
                        password: password,
                        db: dbName,
                        isAdmin: isSystemAdmin
                    });
                }, 800);
            } else {
                setError('Invalid credentials.');
                setLoading(false);
            }
        } catch (err: any) {
            console.error(err);
            setError('Connection failed. Server offline?');
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#050505] text-white relative">

            {/* BACKGROUND LAYER - Cinematic Image with Ken Burns Effect */}
            <div className="absolute inset-0 z-0">
                <motion.div
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
                    className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center"
                />
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/40 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50" />
            </div>

            {/* CONTENT LAYER */}
            <div className="relative z-10 flex w-full h-full">

                {/* Left Side - Typography & Brand (Hidden on Mobile) */}
                <div className="hidden lg:flex w-1/2 flex-col justify-center px-24">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                <span className="font-bold text-xl text-white">D</span>
                            </div>
                            <span className="text-xl font-bold tracking-wide text-white/80">DAYFLOW</span>
                        </div>

                        <h1 className="text-7xl font-bold leading-[1.1] mb-8 tracking-tight">
                            <Tagline text="The Future of Work is Here." delay={0.2} />
                        </h1>

                        <p className="text-xl text-slate-400 font-light max-w-lg leading-relaxed mb-12">
                            Manage attendance, payroll, and performance with an AI-driven HRMS engine designed for high-scale enterprises.
                        </p>

                        <div className="flex items-center gap-8">
                            <div className="flex items-center gap-3 group">
                                <div className="p-2 rounded-full bg-white/10 group-hover:bg-indigo-500 transition-colors">
                                    <CheckCircle className="w-5 h-5 text-indigo-400 group-hover:text-white transition-colors" />
                                </div>
                                <span className="text-sm font-medium text-slate-300">Odoo 17 Core</span>
                            </div>
                            <div className="flex items-center gap-3 group">
                                <div className="p-2 rounded-full bg-white/10 group-hover:bg-purple-500 transition-colors">
                                    <CheckCircle className="w-5 h-5 text-purple-400 group-hover:text-white transition-colors" />
                                </div>
                                <span className="text-sm font-medium text-slate-300">Real-time Sync</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Right Side - Floating Glass Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-20">
                    <motion.div
                        initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="w-full max-w-[420px] backdrop-blur-xl bg-black/40 p-10 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden"
                    >
                        {/* Subtle Form Glow */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>

                        <div className="relative z-10">
                            <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
                            <p className="text-slate-400 text-sm mb-10">Enter your workspace credentials to continue.</p>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="bg-red-500/20 border border-red-500/30 text-red-200 p-4 rounded-xl text-sm flex items-center gap-3"
                                        >
                                            <AlertCircle className="w-5 h-5 shrink-0" />
                                            {error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Modern Input Field 1 */}
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-wider">Username</label>
                                    <div className={`relative group transition-all duration-300 ${activeField === 'email' ? 'scale-[1.02]' : ''}`}>
                                        <input
                                            type="text"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            onFocus={() => setActiveField('email')}
                                            onBlur={() => setActiveField(null)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-slate-500 focus:bg-white/10 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium"
                                            placeholder="admin"
                                        />
                                    </div>
                                </div>

                                {/* Modern Input Field 2 */}
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-wider">Password</label>
                                    <div className={`relative group transition-all duration-300 ${activeField === 'password' ? 'scale-[1.02]' : ''}`}>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            onFocus={() => setActiveField('password')}
                                            onBlur={() => setActiveField(null)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-slate-500 focus:bg-white/10 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-white text-black font-bold h-14 rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center group relative overflow-hidden mt-4"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <Loader className="w-5 h-5 animate-spin text-slate-600" />
                                            <span>Verifying...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 group-hover:gap-4 transition-all duration-300">
                                            <span>Sign In to Workspace</span>
                                            <ArrowRight className="w-5 h-5" />
                                        </div>
                                    )}
                                </button>

                                <div className="text-center mt-6">
                                    <p className="text-xs text-slate-500">System protected by Odoo Security Layer &bull; v1.2</p>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
