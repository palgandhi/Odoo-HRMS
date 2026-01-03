import { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, Clock, AlertCircle, Calendar, Star, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Notification } from '../../services/NotificationService';

interface NotificationDropdownProps {
    notifications: Notification[];
    onMarkAsRead: (id: string) => void;
    onMarkAllAsRead: () => void;
    onNotificationClick?: (notification: Notification) => void;
}

export default function NotificationDropdown({
    notifications,
    onMarkAsRead,
    onMarkAllAsRead,
    onNotificationClick
}: NotificationDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const getNotificationIcon = (type: Notification['type']) => {
        switch (type) {
            case 'leave_request':
                return <Calendar className="w-5 h-5 text-indigo-500" />;
            case 'leave_approved':
                return <Check className="w-5 h-5 text-emerald-500" />;
            case 'leave_rejected':
                return <X className="w-5 h-5 text-red-500" />;
            case 'review_due':
                return <Star className="w-5 h-5 text-orange-500" />;
            case 'attendance_alert':
                return <Clock className="w-5 h-5 text-amber-500" />;
            default:
                return <AlertCircle className="w-5 h-5 text-slate-500" />;
        }
    };

    const getPriorityColor = (priority: Notification['priority']) => {
        switch (priority) {
            case 'high':
                return 'border-l-red-500 bg-red-50/30';
            case 'medium':
                return 'border-l-indigo-500 bg-indigo-50/30';
            default:
                return 'border-l-slate-300 bg-slate-50/30';
        }
    };

    const formatTimestamp = (date: Date) => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    const handleNotificationClick = (notification: Notification, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent dropdown from closing

        // Mark as read first
        if (!notification.read) {
            onMarkAsRead(notification.id);
        }

        // Then navigate
        if (onNotificationClick) {
            onNotificationClick(notification);
        }

        // Close dropdown after navigation
        setTimeout(() => setIsOpen(false), 100);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 hover:bg-slate-100 rounded-xl transition-colors group"
            >
                <Bell className={`w-6 h-6 transition-colors ${unreadCount > 0 ? 'text-indigo-600' : 'text-slate-600'} ${isOpen ? 'animate-pulse' : ''}`} />

                {/* Unread Badge */}
                {unreadCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white shadow-lg"
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                )}
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-[9999]"
                        style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
                    >
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg">Notifications</h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                                </p>
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={onMarkAllAsRead}
                                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 px-3 py-1.5 hover:bg-indigo-50 rounded-lg transition-colors"
                                >
                                    <CheckCheck className="w-3.5 h-3.5" />
                                    Mark all read
                                </button>
                            )}
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-[32rem] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full mx-auto flex items-center justify-center mb-4">
                                        <Bell className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <p className="text-slate-500 font-medium">No notifications yet</p>
                                    <p className="text-slate-400 text-sm mt-1">We'll notify you when something happens</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {notifications.map((notification, index) => (
                                        <motion.div
                                            key={notification.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            onClick={(e) => handleNotificationClick(notification, e)}
                                            className={`px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer border-l-4 ${getPriorityColor(notification.priority)} ${!notification.read ? 'bg-indigo-50/20' : ''}`}
                                        >
                                            <div className="flex items-start gap-4">
                                                {/* Icon */}
                                                <div className={`p-2 rounded-xl ${!notification.read ? 'bg-white shadow-sm' : 'bg-slate-100'}`}>
                                                    {getNotificationIcon(notification.type)}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h4 className={`font-bold text-sm ${!notification.read ? 'text-slate-900' : 'text-slate-600'}`}>
                                                            {notification.title}
                                                        </h4>
                                                        {!notification.read && (
                                                            <span className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 mt-1.5"></span>
                                                        )}
                                                    </div>
                                                    <p className={`text-sm mt-1 ${!notification.read ? 'text-slate-600' : 'text-slate-500'}`}>
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {formatTimestamp(notification.timestamp)}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 text-center">
                                <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                                    View All Notifications
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
