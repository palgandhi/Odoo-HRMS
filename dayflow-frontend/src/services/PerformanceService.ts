import { executeKw } from './odoo';
import type { UserSession } from '../App';

export interface PerformanceReview {
    id: number;
    name: string;
    employee_id: [number, string]; // [id, name]
    start_date: string;
    end_date: string;
    state: 'draft' | 'ongoing' | 'finalized';
    manager_rating: string;
    manager_feedback: string | false;
}

export const PerformanceService = {

    searchReviews: async (session: UserSession, domain: any[] = []): Promise<PerformanceReview[]> => {
        return await executeKw(
            session.uid,
            session.password,
            'hr.performance.review',
            'search_read',
            [domain],
            {
                fields: ['name', 'employee_id', 'start_date', 'end_date', 'state', 'manager_rating', 'manager_feedback'],
                order: 'start_date desc',
                limit: 100
            }
        );
    },

    createReview: async (session: UserSession, data: any) => {
        return await executeKw(
            session.uid,
            session.password,
            'hr.performance.review',
            'create',
            [data]
        );
    },

    updateReview: async (session: UserSession, id: number, data: any) => {
        return await executeKw(
            session.uid,
            session.password,
            'hr.performance.review',
            'write',
            [[id], data]
        );
    }
};
