# -*- coding: utf-8 -*-

from odoo import models, fields, api, _
from odoo.exceptions import ValidationError
from datetime import datetime


class HrPerformanceReview(models.Model):
    _name = 'hr.performance.review'
    _description = 'Performance Review'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'review_date desc'

    name = fields.Char(string='Review Name', required=True, tracking=True)
    employee_id = fields.Many2one('hr.employee', string='Employee', required=True, tracking=True)
    reviewer_id = fields.Many2one('res.users', string='Reviewer', required=True, 
                                   default=lambda self: self.env.user, tracking=True)
    review_period = fields.Selection([
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('half_yearly', 'Half Yearly'),
        ('annual', 'Annual'),
    ], string='Review Period', required=True, default='quarterly')
    
    review_date = fields.Date(string='Review Date', required=True, default=fields.Date.today)
    date_from = fields.Date(string='Period From', required=True)
    date_to = fields.Date(string='Period To', required=True)
    
    # Performance Ratings
    quality_of_work = fields.Selection([
        ('1', 'Poor'), ('2', 'Below Average'), ('3', 'Average'), 
        ('4', 'Good'), ('5', 'Excellent')
    ], string='Quality of Work', required=True)
    
    productivity = fields.Selection([
        ('1', 'Poor'), ('2', 'Below Average'), ('3', 'Average'), 
        ('4', 'Good'), ('5', 'Excellent')
    ], string='Productivity', required=True)
    
    communication = fields.Selection([
        ('1', 'Poor'), ('2', 'Below Average'), ('3', 'Average'), 
        ('4', 'Good'), ('5', 'Excellent')
    ], string='Communication Skills', required=True)
    
    teamwork = fields.Selection([
        ('1', 'Poor'), ('2', 'Below Average'), ('3', 'Average'), 
        ('4', 'Good'), ('5', 'Excellent')
    ], string='Teamwork', required=True)
    
    initiative = fields.Selection([
        ('1', 'Poor'), ('2', 'Below Average'), ('3', 'Average'), 
        ('4', 'Good'), ('5', 'Excellent')
    ], string='Initiative', required=True)
    
    punctuality = fields.Selection([
        ('1', 'Poor'), ('2', 'Below Average'), ('3', 'Average'), 
        ('4', 'Good'), ('5', 'Excellent')
    ], string='Punctuality', required=True)
    
    # Overall Rating
    overall_rating = fields.Float(string='Overall Rating', compute='_compute_overall_rating', 
                                   store=True, digits=(3, 2))
    rating_category = fields.Selection([
        ('poor', 'Needs Improvement'),
        ('average', 'Meets Expectations'),
        ('good', 'Exceeds Expectations'),
        ('excellent', 'Outstanding'),
    ], string='Rating Category', compute='_compute_rating_category', store=True)
    
    # Goals and Feedback
    goals_ids = fields.One2many('hr.performance.goal', 'review_id', string='Goals')
    achievements = fields.Text(string='Key Achievements')
    areas_of_improvement = fields.Text(string='Areas of Improvement')
    reviewer_comments = fields.Text(string='Reviewer Comments')
    employee_comments = fields.Text(string='Employee Comments')
    
    # Action Items
    training_needs = fields.Text(string='Training Needs')
    next_review_date = fields.Date(string='Next Review Date')
    
    # Status
    state = fields.Selection([
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('reviewed', 'Reviewed'),
        ('acknowledged', 'Acknowledged'),
        ('cancelled', 'Cancelled'),
    ], string='Status', default='draft', tracking=True)

    @api.depends('quality_of_work', 'productivity', 'communication', 'teamwork', 'initiative', 'punctuality')
    def _compute_overall_rating(self):
        for review in self:
            ratings = [
                int(review.quality_of_work or 0),
                int(review.productivity or 0),
                int(review.communication or 0),
                int(review.teamwork or 0),
                int(review.initiative or 0),
                int(review.punctuality or 0),
            ]
            review.overall_rating = sum(ratings) / len(ratings) if ratings else 0

    @api.depends('overall_rating')
    def _compute_rating_category(self):
        for review in self:
            if review.overall_rating < 2.5:
                review.rating_category = 'poor'
            elif review.overall_rating < 3.5:
                review.rating_category = 'average'
            elif review.overall_rating < 4.5:
                review.rating_category = 'good'
            else:
                review.rating_category = 'excellent'

    def action_submit(self):
        self.write({'state': 'submitted'})

    def action_review(self):
        self.write({'state': 'reviewed'})

    def action_acknowledge(self):
        self.write({'state': 'acknowledged'})

    def action_cancel(self):
        self.write({'state': 'cancelled'})

    def action_reset_to_draft(self):
        self.write({'state': 'draft'})


class HrPerformanceGoal(models.Model):
    _name = 'hr.performance.goal'
    _description = 'Performance Goal'
    _order = 'target_date'

    review_id = fields.Many2one('hr.performance.review', string='Performance Review', ondelete='cascade')
    employee_id = fields.Many2one('hr.employee', string='Employee', required=True)
    name = fields.Char(string='Goal', required=True)
    description = fields.Text(string='Description')
    
    target_date = fields.Date(string='Target Date', required=True)
    priority = fields.Selection([
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ], string='Priority', default='medium')
    
    progress = fields.Integer(string='Progress (%)', default=0)
    status = fields.Selection([
        ('not_started', 'Not Started'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ], string='Status', default='not_started')
    
    achievement_notes = fields.Text(string='Achievement Notes')
    completion_date = fields.Date(string='Completion Date')

    @api.constrains('progress')
    def _check_progress(self):
        for goal in self:
            if goal.progress < 0 or goal.progress > 100:
                raise ValidationError(_('Progress must be between 0 and 100.'))

    def action_mark_completed(self):
        self.write({
            'status': 'completed',
            'progress': 100,
            'completion_date': fields.Date.today(),
        })


class HrPerformanceReport(models.Model):
    _name = 'hr.performance.report'
    _description = 'Performance Report'
    _order = 'date desc'

    name = fields.Char(string='Report Name', required=True)
    date_from = fields.Date(string='From Date', required=True)
    date_to = fields.Date(string='To Date', required=True)
    department_id = fields.Many2one('hr.department', string='Department')
    
    total_reviews = fields.Integer(string='Total Reviews', compute='_compute_report_data', store=True)
    average_rating = fields.Float(string='Average Rating', compute='_compute_report_data', 
                                   store=True, digits=(3, 2))
    excellent_count = fields.Integer(string='Outstanding', compute='_compute_report_data', store=True)
    good_count = fields.Integer(string='Exceeds Expectations', compute='_compute_report_data', store=True)
    average_count = fields.Integer(string='Meets Expectations', compute='_compute_report_data', store=True)
    poor_count = fields.Integer(string='Needs Improvement', compute='_compute_report_data', store=True)
    
    date = fields.Date(string='Report Date', default=fields.Date.today)

    @api.depends('date_from', 'date_to', 'department_id')
    def _compute_report_data(self):
        for report in self:
            if not report.date_from or not report.date_to:
                continue
            
            domain = [
                ('review_date', '>=', report.date_from),
                ('review_date', '<=', report.date_to),
                ('state', '=', 'acknowledged'),
            ]
            
            if report.department_id:
                domain.append(('employee_id.department_id', '=', report.department_id.id))
            
            reviews = self.env['hr.performance.review'].search(domain)
            
            report.total_reviews = len(reviews)
            report.average_rating = sum(reviews.mapped('overall_rating')) / len(reviews) if reviews else 0
            report.excellent_count = len(reviews.filtered(lambda r: r.rating_category == 'excellent'))
            report.good_count = len(reviews.filtered(lambda r: r.rating_category == 'good'))
            report.average_count = len(reviews.filtered(lambda r: r.rating_category == 'average'))
            report.poor_count = len(reviews.filtered(lambda r: r.rating_category == 'poor'))
