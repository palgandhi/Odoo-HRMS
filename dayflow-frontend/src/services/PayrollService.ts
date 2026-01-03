import { executeKw } from './odoo';
import type { UserSession } from '../App';

export interface Payslip {
    id: number;
    name: string;
    employee_id: [number, string];
    date: string;
    basic_wage: number;
    allowances: number;
    deductions: number;
    net_wage: number;
    state: 'draft' | 'paid';
}

export const PayrollService = {
    searchPayslips: async (session: UserSession, domain: any[] = []): Promise<Payslip[]> => {
        return executeKw(
            session.uid,
            session.password,
            'hr.payroll.slip',
            'search_read',
            [domain],
            {
                fields: ['name', 'employee_id', 'date', 'basic_wage', 'allowances', 'deductions', 'net_wage', 'state'],
                order: 'date desc',
                limit: 100
            }
        );
    },

    createPayslip: async (session: UserSession, data: any) => {
        return executeKw(
            session.uid,
            session.password,
            'hr.payroll.slip',
            'create',
            [data]
        );
    },

    markPaid: async (session: UserSession, id: number) => {
        return executeKw(
            session.uid,
            session.password,
            'hr.payroll.slip',
            'write',
            [[id], { state: 'paid' }]
        );
    }
};
