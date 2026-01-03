# -*- coding: utf-8 -*-

from odoo import models, fields, api, _
from odoo.exceptions import ValidationError
from datetime import datetime, timedelta


class HrLeaveExtended(models.Model):
    _inherit = 'hr.leave'

    # Additional leave fields
    leave_reason = fields.Text(string='Reason for Leave', required=True)
    attachment_ids = fields.Many2many('ir.attachment', string='Attachments')
    approved_by = fields.Many2one('res.users', string='Approved By', readonly=True)
    approved_date = fields.Datetime(string='Approved Date', readonly=True)
    rejected_by = fields.Many2one('res.users', string='Rejected By', readonly=True)
    rejected_date = fields.Datetime(string='Rejected Date', readonly=True)
    rejection_reason = fields.Text(string='Rejection Reason')
    
    # Emergency leave flag
    is_emergency = fields.Boolean(string='Emergency Leave')
    
    # Half day options
    is_half_day = fields.Boolean(string='Half Day Leave')
    half_day_period = fields.Selection([
        ('morning', 'Morning (First Half)'),
        ('afternoon', 'Afternoon (Second Half)'),
    ], string='Half Day Period')

    @api.constrains('date_from', 'date_to', 'employee_id')
    def _check_leave_overlap(self):
        for leave in self:
            if leave.state not in ['draft', 'cancel', 'refuse']:
                overlapping = self.search([
                    ('employee_id', '=', leave.employee_id.id),
                    ('state', 'in', ['confirm', 'validate1', 'validate']),
                    ('id', '!=', leave.id),
                    ('date_from', '<=', leave.date_to),
                    ('date_to', '>=', leave.date_from),
                ])
                if overlapping:
                    raise ValidationError(_('You have overlapping leave requests!'))

    def action_approve(self):
        res = super(HrLeaveExtended, self).action_approve()
        for leave in self:
            leave.write({
                'approved_by': self.env.user.id,
                'approved_date': fields.Datetime.now(),
            })
        return res

    def action_refuse(self):
        res = super(HrLeaveExtended, self).action_refuse()
        for leave in self:
            leave.write({
                'rejected_by': self.env.user.id,
                'rejected_date': fields.Datetime.now(),
            })
        return res


class HrLeaveType(models.Model):
    _inherit = 'hr.leave.type'

    # Additional leave type configurations
    requires_attachment = fields.Boolean(string='Requires Attachment')
    max_consecutive_days = fields.Integer(string='Max Consecutive Days', default=0,
                                          help='Maximum consecutive days allowed. 0 means no limit.')
    min_days_notice = fields.Integer(string='Minimum Days Notice', default=0,
                                     help='Minimum days notice required before leave. 0 means no restriction.')
    allow_half_day = fields.Boolean(string='Allow Half Day', default=True)
    carry_forward = fields.Boolean(string='Carry Forward to Next Year', default=False)
    max_carry_forward = fields.Float(string='Max Carry Forward Days', default=0.0)


class HrLeaveAllocation(models.Model):
    _inherit = 'hr.leave.allocation'

    # Track carry forward
    is_carry_forward = fields.Boolean(string='Carry Forward Allocation')
    previous_year = fields.Integer(string='Previous Year')


class HrLeaveAnalysis(models.Model):
    _name = 'hr.leave.analysis'
    _description = 'Leave Analysis'
    _order = 'date desc'

    name = fields.Char(string='Report Name', required=True)
    date_from = fields.Date(string='From Date', required=True)
    date_to = fields.Date(string='To Date', required=True)
    employee_id = fields.Many2one('hr.employee', string='Employee')
    department_id = fields.Many2one('hr.department', string='Department')
    leave_type_id = fields.Many2one('hr.leave.type', string='Leave Type')
    
    total_leaves = fields.Integer(string='Total Leaves', compute='_compute_report_data', store=True)
    approved_leaves = fields.Integer(string='Approved Leaves', compute='_compute_report_data', store=True)
    pending_leaves = fields.Integer(string='Pending Leaves', compute='_compute_report_data', store=True)
    rejected_leaves = fields.Integer(string='Rejected Leaves', compute='_compute_report_data', store=True)
    total_days = fields.Float(string='Total Days', compute='_compute_report_data', store=True)
    
    date = fields.Date(string='Report Date', default=fields.Date.today)

    @api.depends('date_from', 'date_to', 'employee_id', 'department_id', 'leave_type_id')
    def _compute_report_data(self):
        for report in self:
            if not report.date_from or not report.date_to:
                continue
            
            domain = [
                ('date_from', '>=', report.date_from),
                ('date_to', '<=', report.date_to),
            ]
            
            if report.employee_id:
                domain.append(('employee_id', '=', report.employee_id.id))
            elif report.department_id:
                domain.append(('employee_id.department_id', '=', report.department_id.id))
            
            if report.leave_type_id:
                domain.append(('holiday_status_id', '=', report.leave_type_id.id))
            
            leaves = self.env['hr.leave'].search(domain)
            
            report.total_leaves = len(leaves)
            report.approved_leaves = len(leaves.filtered(lambda l: l.state == 'validate'))
            report.pending_leaves = len(leaves.filtered(lambda l: l.state in ['confirm', 'validate1']))
            report.rejected_leaves = len(leaves.filtered(lambda l: l.state == 'refuse'))
            report.total_days = sum(leaves.filtered(lambda l: l.state == 'validate').mapped('number_of_days'))
