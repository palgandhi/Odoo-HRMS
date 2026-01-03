# -*- coding: utf-8 -*-

from odoo import models, fields, api


class HrEmployeeExtended(models.Model):
    _inherit = 'hr.employee'

    # Additional employee fields
    employee_code = fields.Char(string='Employee Code', required=True, copy=False, readonly=True, 
                                 default=lambda self: 'New')
    date_of_joining = fields.Date(string='Date of Joining', required=True, 
                                   default=fields.Date.today)
    emergency_contact = fields.Char(string='Emergency Contact')
    emergency_contact_phone = fields.Char(string='Emergency Contact Phone')
    blood_group = fields.Selection([
        ('a+', 'A+'), ('a-', 'A-'),
        ('b+', 'B+'), ('b-', 'B-'),
        ('ab+', 'AB+'), ('ab-', 'AB-'),
        ('o+', 'O+'), ('o-', 'O-'),
    ], string='Blood Group')
    
    # Education & Skills
    qualification = fields.Char(string='Highest Qualification')
    skills = fields.Text(string='Skills')
    certifications = fields.Text(string='Certifications')
    
    # Work Information
    probation_period = fields.Integer(string='Probation Period (months)', default=3)
    confirmation_date = fields.Date(string='Confirmation Date')
    notice_period = fields.Integer(string='Notice Period (days)', default=30)
    
    # Salary Information (Basic - detailed in payroll)
    basic_salary = fields.Monetary(string='Basic Salary', currency_field='currency_id')
    currency_id = fields.Many2one('res.currency', string='Currency', 
                                   default=lambda self: self.env.company.currency_id)
    
    # Performance tracking
    performance_review_ids = fields.One2many('hr.performance.review', 'employee_id', 
                                             string='Performance Reviews')
    performance_count = fields.Integer(string='Performance Reviews', 
                                        compute='_compute_performance_count')
    
    # Status
    employment_status = fields.Selection([
        ('probation', 'Probation'),
        ('confirmed', 'Confirmed'),
        ('notice', 'Notice Period'),
        ('resigned', 'Resigned'),
    ], string='Employment Status', default='probation')

    @api.model
    def create(self, vals):
        if vals.get('employee_code', 'New') == 'New':
            vals['employee_code'] = self.env['ir.sequence'].next_by_code('hr.employee.code') or 'New'
        return super(HrEmployeeExtended, self).create(vals)

    def _compute_performance_count(self):
        for employee in self:
            employee.performance_count = len(employee.performance_review_ids)

    def action_view_performance_reviews(self):
        self.ensure_one()
        return {
            'name': 'Performance Reviews',
            'type': 'ir.actions.act_window',
            'view_mode': 'tree,form',
            'res_model': 'hr.performance.review',
            'domain': [('employee_id', '=', self.id)],
            'context': {'default_employee_id': self.id},
        }
