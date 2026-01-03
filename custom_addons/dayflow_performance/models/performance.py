from odoo import models, fields, api

class PerformanceReview(models.Model):
    _name = 'hr.performance.review'
    _description = 'Performance Review'
    _inherit = ['mail.thread', 'mail.activity.mixin']

    name = fields.Char(string='Title', required=True, default='Quarterly Review')
    employee_id = fields.Many2one('hr.employee', string='Employee', required=True)
    
    start_date = fields.Date(string='Start Date')
    end_date = fields.Date(string='End Date')
    
    state = fields.Selection([
        ('draft', 'Draft'),
        ('ongoing', 'Ongoing'),
        ('finalized', 'Finalized'),
    ], string='Status', default='ongoing', tracking=True)

    manager_rating = fields.Selection([
        ('0', 'Not Rated'),
        ('1', 'Poor'),
        ('2', 'Fair'),
        ('3', 'Good'),
        ('4', 'Excellent'),
        ('5', 'Outstanding'),
    ], string='Rating', default='0', tracking=True)
    
    manager_feedback = fields.Text(string='Manager Feedback')
