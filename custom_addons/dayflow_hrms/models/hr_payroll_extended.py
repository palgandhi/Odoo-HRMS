# -*- coding: utf-8 -*-

from odoo import models, fields, api, _
from odoo.exceptions import ValidationError
from datetime import datetime
from dateutil.relativedelta import relativedelta


class HrPayslip(models.Model):
    _inherit = 'hr.payslip'

    # Additional payroll fields
    attendance_days = fields.Float(string='Attendance Days', compute='_compute_attendance_days', store=True)
    overtime_hours = fields.Float(string='Overtime Hours', compute='_compute_overtime_hours', store=True)
    late_deduction = fields.Monetary(string='Late Deduction', currency_field='currency_id')
    bonus_amount = fields.Monetary(string='Bonus', currency_field='currency_id')
    other_allowances = fields.Monetary(string='Other Allowances', currency_field='currency_id')
    other_deductions = fields.Monetary(string='Other Deductions', currency_field='currency_id')
    
    # Performance bonus
    performance_bonus = fields.Monetary(string='Performance Bonus', currency_field='currency_id')
    
    # Net calculations
    gross_salary = fields.Monetary(string='Gross Salary', compute='_compute_gross_salary', store=True)
    total_deductions = fields.Monetary(string='Total Deductions', compute='_compute_total_deductions', store=True)
    net_salary = fields.Monetary(string='Net Salary', compute='_compute_net_salary', store=True)
    
    currency_id = fields.Many2one('res.currency', string='Currency', 
                                   default=lambda self: self.env.company.currency_id)
    
    # Payment status
    payment_status = fields.Selection([
        ('draft', 'Draft'),
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('cancelled', 'Cancelled'),
    ], string='Payment Status', default='draft')
    payment_date = fields.Date(string='Payment Date')
    payment_reference = fields.Char(string='Payment Reference')

    @api.depends('date_from', 'date_to', 'employee_id')
    def _compute_attendance_days(self):
        for payslip in self:
            if not payslip.date_from or not payslip.date_to or not payslip.employee_id:
                payslip.attendance_days = 0
                continue
            
            attendances = self.env['hr.attendance'].search([
                ('employee_id', '=', payslip.employee_id.id),
                ('check_in', '>=', payslip.date_from),
                ('check_in', '<=', payslip.date_to),
                ('attendance_status', 'in', ['present', 'late']),
            ])
            
            # Count full days and half days
            full_days = len(attendances.filtered(lambda a: a.attendance_status != 'half_day'))
            half_days = len(attendances.filtered(lambda a: a.attendance_status == 'half_day')) * 0.5
            
            payslip.attendance_days = full_days + half_days

    @api.depends('date_from', 'date_to', 'employee_id')
    def _compute_overtime_hours(self):
        for payslip in self:
            if not payslip.date_from or not payslip.date_to or not payslip.employee_id:
                payslip.overtime_hours = 0
                continue
            
            attendances = self.env['hr.attendance'].search([
                ('employee_id', '=', payslip.employee_id.id),
                ('check_in', '>=', payslip.date_from),
                ('check_in', '<=', payslip.date_to),
            ])
            
            payslip.overtime_hours = sum(attendances.mapped('overtime_hours'))

    @api.depends('employee_id', 'attendance_days', 'overtime_hours', 'bonus_amount', 'other_allowances')
    def _compute_gross_salary(self):
        for payslip in self:
            if not payslip.employee_id:
                payslip.gross_salary = 0
                continue
            
            # Get basic salary from employee
            basic_salary = payslip.employee_id.basic_salary or 0
            
            # Calculate based on attendance
            working_days = 26  # Standard working days per month
            per_day_salary = basic_salary / working_days if working_days else 0
            attendance_salary = per_day_salary * payslip.attendance_days
            
            # Overtime calculation (1.5x hourly rate)
            hourly_rate = basic_salary / (working_days * 8) if working_days else 0
            overtime_pay = hourly_rate * payslip.overtime_hours * 1.5
            
            payslip.gross_salary = attendance_salary + overtime_pay + payslip.bonus_amount + \
                                   payslip.performance_bonus + payslip.other_allowances

    @api.depends('late_deduction', 'other_deductions')
    def _compute_total_deductions(self):
        for payslip in self:
            # Basic deductions
            deductions = payslip.late_deduction + payslip.other_deductions
            
            # Tax deduction (simplified - 10% for demo)
            tax = payslip.gross_salary * 0.10
            
            payslip.total_deductions = deductions + tax

    @api.depends('gross_salary', 'total_deductions')
    def _compute_net_salary(self):
        for payslip in self:
            payslip.net_salary = payslip.gross_salary - payslip.total_deductions

    def action_mark_paid(self):
        self.ensure_one()
        self.write({
            'payment_status': 'paid',
            'payment_date': fields.Date.today(),
        })

    def action_generate_payslip(self):
        self.ensure_one()
        return self.env.ref('dayflow_hrms.action_payslip_report').report_action(self)


class HrPayrollReport(models.Model):
    _name = 'hr.payroll.report'
    _description = 'Payroll Report'
    _order = 'date desc'

    name = fields.Char(string='Report Name', required=True)
    date_from = fields.Date(string='From Date', required=True)
    date_to = fields.Date(string='To Date', required=True)
    department_id = fields.Many2one('hr.department', string='Department')
    
    total_employees = fields.Integer(string='Total Employees', compute='_compute_report_data', store=True)
    total_gross = fields.Monetary(string='Total Gross Salary', compute='_compute_report_data', 
                                   store=True, currency_field='currency_id')
    total_deductions = fields.Monetary(string='Total Deductions', compute='_compute_report_data', 
                                        store=True, currency_field='currency_id')
    total_net = fields.Monetary(string='Total Net Salary', compute='_compute_report_data', 
                                 store=True, currency_field='currency_id')
    
    currency_id = fields.Many2one('res.currency', string='Currency', 
                                   default=lambda self: self.env.company.currency_id)
    date = fields.Date(string='Report Date', default=fields.Date.today)

    @api.depends('date_from', 'date_to', 'department_id')
    def _compute_report_data(self):
        for report in self:
            if not report.date_from or not report.date_to:
                continue
            
            domain = [
                ('date_from', '>=', report.date_from),
                ('date_to', '<=', report.date_to),
                ('state', '=', 'done'),
            ]
            
            if report.department_id:
                domain.append(('employee_id.department_id', '=', report.department_id.id))
            
            payslips = self.env['hr.payslip'].search(domain)
            
            report.total_employees = len(payslips.mapped('employee_id'))
            report.total_gross = sum(payslips.mapped('gross_salary'))
            report.total_deductions = sum(payslips.mapped('total_deductions'))
            report.total_net = sum(payslips.mapped('net_salary'))
