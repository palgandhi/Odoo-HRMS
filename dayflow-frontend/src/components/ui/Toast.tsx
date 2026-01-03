import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

type ToastVariant = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    title: string;
    description?: string;
    variant: ToastVariant;
}

interface ToastContextType {
    toast: (props: Omit<Toast, 'id'>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const toast = useCallback(({ title, description, variant }: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).substring(7);
        setToasts(prev => [...prev, { id, title, description, variant }]);
        setTimeout(() => removeToast(id), 50000); // reduced dur in dev? No keeps 5s
        setTimeout(() => removeToast(id), 5000);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
                <AnimatePresence>
                    {toasts.map(t => (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20 }}
                            layout
                            className="bg-white rounded-xl shadow-2xl border border-slate-100 p-4 w-80 pointer-events-auto flex items-start gap-4 relative overflow-hidden"
                        >
                            <div className={`p-2 rounded-full shrink-0 ${t.variant === 'success' ? 'bg-emerald-100 text-emerald-600' :
                                    t.variant === 'error' ? 'bg-red-100 text-red-600' :
                                        'bg-blue-100 text-blue-600'
                                }`}>
                                {t.variant === 'success' ? <CheckCircle className="w-5 h-5" /> :
                                    t.variant === 'error' ? <AlertCircle className="w-5 h-5" /> :
                                        <Info className="w-5 h-5" />}
                            </div>
                            <div className="flex-1 pt-0.5">
                                <h4 className="font-bold text-slate-900 text-sm">{t.title}</h4>
                                {t.description && <p className="text-slate-500 text-sm mt-1 leading-relaxed">{t.description}</p>}
                            </div>
                            <button onClick={() => removeToast(t.id)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-4 h-4" />
                            </button>
                            {/* Progress Line */}
                            <motion.div
                                initial={{ width: '100%' }}
                                animate={{ width: '0%' }}
                                transition={{ duration: 5, ease: 'linear' }}
                                className={`absolute bottom-0 left-0 h-1 ${t.variant === 'success' ? 'bg-emerald-500' :
                                        t.variant === 'error' ? 'bg-red-500' :
                                            'bg-blue-500'
                                    }`}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within a ToastProvider');
    return context;
}
