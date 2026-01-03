from odoo import models, fields, api

class Payslip(models.Model):
    _name = 'hr.payroll.slip'
    _description = 'Payslip Record'
    _order = 'date desc'

    name = fields.Char(string='Reference', required=True, default='New Payslip')
    employee_id = fields.Many2one('hr.employee', string='Employee', required=True)
    date = fields.Date(string='Payment Date', required=True, default=fields.Date.context_today)
    
    # Financials
    basic_wage = fields.Float(string='Basic Wage')
    allowances = fields.Float(string='Allowances')
    deductions = fields.Float(string='Deductions')
    net_wage = fields.Float(string='Net Wage', compute='_compute_net_wage', store=True)
    
    state = fields.Selection([
        ('draft', 'Draft'),
        ('paid', 'Paid'),
    ], string='Status', default='draft')

    @api.depends('basic_wage', 'allowances', 'deductions')
    def _compute_net_wage(self):
        for record in self:
            record.net_wage = record.basic_wage + record.allowances - record.deductions
