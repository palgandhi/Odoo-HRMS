import { executeKw } from './odoo';
import type { UserSession } from '../App';

export interface Notification {
    id: string;
    type: 'leave_request' | 'leave_approved' | 'leave_rejected' | 'review_due' | 'attendance_alert' | 'system';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    actionUrl?: string;
    relatedId?: number;
    priority: 'low' | 'medium' | 'high';
}

export class NotificationService {
    private static STORAGE_KEY = 'dayflow_read_notifications';

    /**
     * Get read notification IDs from localStorage
     */
    private static getReadNotificationIds(): Set<string> {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            return stored ? new Set(JSON.parse(stored)) : new Set();
        } catch {
            return new Set();
        }
    }

    /**
     * Save read notification IDs to localStorage
     */
    private static saveReadNotificationIds(ids: Set<string>) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(Array.from(ids)));
        } catch (error) {
            console.error('Failed to save read notifications:', error);
        }
    }

    /**
     * Fetch notifications for the current user
     */
    static async fetchNotifications(session: UserSession): Promise<Notification[]> {
        const notifications: Notification[] = [];
        const readIds = this.getReadNotificationIds();

        console.log('[NotificationService] Fetching notifications. Read IDs from localStorage:', Array.from(readIds));

        try {
            // Get employee ID
            const employees = await executeKw(
                session.uid,
                session.password,
                'hr.employee',
                'search_read',
                [[['user_id', '=', session.uid]]],
                { fields: ['id', 'name'], limit: 1 }
            );

            if (!employees || employees.length === 0) {
                return notifications;
            }

            const employeeId = employees[0].id;

            // For Managers: Fetch pending leave requests
            if (session.isAdmin) {
                const pendingLeaves = await executeKw(
                    session.uid,
                    session.password,
                    'hr.leave',
                    'search_read',
                    [[['state', '=', 'confirm']]],
                    {
                        fields: ['id', 'employee_id', 'holiday_status_id', 'date_from', 'date_to', 'create_date'],
                        order: 'create_date desc',
                        limit: 10
                    }
                );

                pendingLeaves.forEach((leave: any) => {
                    const notifId = `leave-${leave.id}`;
                    const createdDate = new Date(leave.create_date.replace(' ', 'T') + 'Z');
                    const isRecent = (Date.now() - createdDate.getTime()) < 24 * 60 * 60 * 1000; // Last 24 hours

                    notifications.push({
                        id: notifId,
                        type: 'leave_request',
                        title: 'New Leave Request',
                        message: `${leave.employee_id[1]} requested ${leave.holiday_status_id[1]} from ${new Date(leave.date_from).toLocaleDateString()}`,
                        timestamp: createdDate,
                        read: readIds.has(notifId), // Check if already read
                        relatedId: leave.id,
                        priority: isRecent ? 'high' : 'medium'
                    });
                });

                // Fetch overdue performance reviews
                const overdueReviews = await executeKw(
                    session.uid,
                    session.password,
                    'hr.performance.review',
                    'search_read',
                    [[['state', '=', 'ongoing'], ['end_date', '<', new Date().toISOString().split('T')[0]]]],
                    {
                        fields: ['id', 'employee_id', 'end_date'],
                        limit: 5
                    }
                ).catch(() => []); // Ignore if module doesn't exist

                overdueReviews.forEach((review: any) => {
                    const notifId = `review-${review.id}`;
                    notifications.push({
                        id: notifId,
                        type: 'review_due',
                        title: 'Performance Review Overdue',
                        message: `Review for ${review.employee_id[1]} was due on ${new Date(review.end_date).toLocaleDateString()}`,
                        timestamp: new Date(review.end_date),
                        read: readIds.has(notifId),
                        relatedId: review.id,
                        priority: 'high'
                    });
                });
            }

            // For Employees: Fetch their leave request status changes
            const myLeaves = await executeKw(
                session.uid,
                session.password,
                'hr.leave',
                'search_read',
                [[['employee_id', '=', employeeId], ['state', 'in', ['validate', 'refuse']]]],
                {
                    fields: ['id', 'holiday_status_id', 'state', 'write_date', 'date_from', 'date_to'],
                    order: 'write_date desc',
                    limit: 5
                }
            );

            myLeaves.forEach((leave: any) => {
                const notifId = `leave-status-${leave.id}`;
                const updatedDate = new Date(leave.write_date.replace(' ', 'T') + 'Z');
                const isRecent = (Date.now() - updatedDate.getTime()) < 48 * 60 * 60 * 1000; // Last 48 hours

                if (isRecent) {
                    notifications.push({
                        id: notifId,
                        type: leave.state === 'validate' ? 'leave_approved' : 'leave_rejected',
                        title: leave.state === 'validate' ? 'Leave Approved ✓' : 'Leave Rejected ✗',
                        message: `Your ${leave.holiday_status_id[1]} request for ${new Date(leave.date_from).toLocaleDateString()} was ${leave.state === 'validate' ? 'approved' : 'rejected'}`,
                        timestamp: updatedDate,
                        read: readIds.has(notifId),
                        relatedId: leave.id,
                        priority: leave.state === 'validate' ? 'medium' : 'high'
                    });
                }
            });

            // Check for attendance anomalies (for employees)
            const today = new Date().toISOString().split('T')[0];
            const todayAttendance = await executeKw(
                session.uid,
                session.password,
                'hr.attendance',
                'search_read',
                [[['employee_id', '=', employeeId], ['check_in', '>=', `${today} 00:00:00`], ['check_in', '<=', `${today} 23:59:59`]]],
                { fields: ['id', 'check_in', 'check_out'], limit: 1 }
            );

            if (todayAttendance.length === 0) {
                const now = new Date();
                const hour = now.getHours();
                const notifId = `attendance-missing-${today}`;
                // Alert if not checked in by 10 AM
                if (hour >= 10 && hour < 18) {
                    notifications.push({
                        id: notifId,
                        type: 'attendance_alert',
                        title: 'Attendance Reminder',
                        message: 'You haven\'t checked in today. Don\'t forget to mark your attendance!',
                        timestamp: now,
                        read: readIds.has(notifId),
                        priority: 'medium'
                    });
                }
            }

        } catch (error) {
            console.error('Error fetching notifications:', error);
        }

        // Sort by timestamp (newest first) and priority
        return notifications.sort((a, b) => {
            if (a.priority !== b.priority) {
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            return b.timestamp.getTime() - a.timestamp.getTime();
        });
    }

    /**
     * Get unread notification count
     */
    static getUnreadCount(notifications: Notification[]): number {
        return notifications.filter(n => !n.read).length;
    }

    /**
     * Mark notification as read
     */
    static markAsRead(notificationId: string, notifications: Notification[]): Notification[] {
        const readIds = this.getReadNotificationIds();
        readIds.add(notificationId);
        this.saveReadNotificationIds(readIds);

        console.log('[NotificationService] Marked as read:', notificationId);
        console.log('[NotificationService] All read IDs:', Array.from(readIds));

        return notifications.map(n =>
            n.id === notificationId ? { ...n, read: true } : n
        );
    }

    /**
     * Mark all as read
     */
    static markAllAsRead(notifications: Notification[]): Notification[] {
        const readIds = this.getReadNotificationIds();
        notifications.forEach(n => readIds.add(n.id));
        this.saveReadNotificationIds(readIds);

        return notifications.map(n => ({ ...n, read: true }));
    }

    /**
     * Clear old read notifications (older than 7 days)
     */
    static clearOldReadNotifications() {
        // This can be called periodically to clean up localStorage
        // For now, we'll keep all read notifications
    }
}
