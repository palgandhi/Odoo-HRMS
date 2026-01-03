# -*- coding: utf-8 -*-

from odoo import models, fields, api, _
from odoo.exceptions import ValidationError
from datetime import datetime, timedelta


class HrAttendanceExtended(models.Model):
    _inherit = 'hr.attendance'

    # Additional attendance fields
    attendance_status = fields.Selection([
        ('present', 'Present'),
        ('late', 'Late'),
        ('half_day', 'Half Day'),
        ('absent', 'Absent'),
    ], string='Status', compute='_compute_attendance_status', store=True)
    
    late_minutes = fields.Integer(string='Late (Minutes)', compute='_compute_late_minutes', store=True)
    overtime_hours = fields.Float(string='Overtime Hours', compute='_compute_overtime_hours', store=True)
    work_location = fields.Char(string='Work Location')
    remarks = fields.Text(string='Remarks')
    
    # Geolocation (for future geo-fencing feature)
    check_in_latitude = fields.Float(string='Check-in Latitude', digits=(10, 7))
    check_in_longitude = fields.Float(string='Check-in Longitude', digits=(10, 7))
    check_out_latitude = fields.Float(string='Check-out Latitude', digits=(10, 7))
    check_out_longitude = fields.Float(string='Check-out Longitude', digits=(10, 7))

    @api.depends('check_in', 'check_out')
    def _compute_attendance_status(self):
        for attendance in self:
            if not attendance.check_in:
                attendance.attendance_status = 'absent'
                continue
            
            # Check if late (assuming 9:00 AM is standard time)
            check_in_time = fields.Datetime.context_timestamp(attendance, attendance.check_in)
            standard_time = check_in_time.replace(hour=9, minute=0, second=0)
            
            if check_in_time > standard_time + timedelta(minutes=15):
                attendance.attendance_status = 'late'
            elif attendance.worked_hours < 4:
                attendance.attendance_status = 'half_day'
            else:
                attendance.attendance_status = 'present'

    @api.depends('check_in')
    def _compute_late_minutes(self):
        for attendance in self:
            if not attendance.check_in:
                attendance.late_minutes = 0
                continue
            
            check_in_time = fields.Datetime.context_timestamp(attendance, attendance.check_in)
            standard_time = check_in_time.replace(hour=9, minute=0, second=0)
            
            if check_in_time > standard_time:
                late_delta = check_in_time - standard_time
                attendance.late_minutes = int(late_delta.total_seconds() / 60)
            else:
                attendance.late_minutes = 0

    @api.depends('worked_hours')
    def _compute_overtime_hours(self):
        for attendance in self:
            # Standard work hours is 8
            if attendance.worked_hours > 8:
                attendance.overtime_hours = attendance.worked_hours - 8
            else:
                attendance.overtime_hours = 0.0


class HrAttendanceReport(models.Model):
    _name = 'hr.attendance.report'
    _description = 'Attendance Report'
    _order = 'date desc'

    name = fields.Char(string='Report Name', required=True)
    date_from = fields.Date(string='From Date', required=True)
    date_to = fields.Date(string='To Date', required=True)
    employee_id = fields.Many2one('hr.employee', string='Employee')
    department_id = fields.Many2one('hr.department', string='Department')
    
    total_days = fields.Integer(string='Total Days', compute='_compute_report_data', store=True)
    present_days = fields.Integer(string='Present Days', compute='_compute_report_data', store=True)
    absent_days = fields.Integer(string='Absent Days', compute='_compute_report_data', store=True)
    late_days = fields.Integer(string='Late Days', compute='_compute_report_data', store=True)
    total_hours = fields.Float(string='Total Hours', compute='_compute_report_data', store=True)
    overtime_hours = fields.Float(string='Overtime Hours', compute='_compute_report_data', store=True)
    
    date = fields.Date(string='Report Date', default=fields.Date.today)

    @api.depends('date_from', 'date_to', 'employee_id', 'department_id')
    def _compute_report_data(self):
        for report in self:
            if not report.date_from or not report.date_to:
                continue
            
            domain = [
                ('check_in', '>=', report.date_from),
                ('check_in', '<=', report.date_to),
            ]
            
            if report.employee_id:
                domain.append(('employee_id', '=', report.employee_id.id))
            elif report.department_id:
                domain.append(('employee_id.department_id', '=', report.department_id.id))
            
            attendances = self.env['hr.attendance'].search(domain)
            
            report.total_days = (report.date_to - report.date_from).days + 1
            report.present_days = len(attendances.filtered(lambda a: a.attendance_status in ['present', 'late']))
            report.absent_days = report.total_days - report.present_days
            report.late_days = len(attendances.filtered(lambda a: a.attendance_status == 'late'))
            report.total_hours = sum(attendances.mapped('worked_hours'))
            report.overtime_hours = sum(attendances.mapped('overtime_hours'))

    def action_generate_report(self):
        self.ensure_one()
        return self.env.ref('dayflow_hrms.action_attendance_report').report_action(self)
