# -*- coding: utf-8 -*-
{
    'name': 'Dayflow HRMS',
    'version': '17.0.1.0.0',
    'category': 'Human Resources',
    'summary': 'Complete Human Resource Management System',
    'description': """
        Dayflow - Human Resource Management System
        ===========================================
        
        A comprehensive HRMS solution with the following modules:
        
        * Employee Management - Complete employee lifecycle management
        * Attendance Tracking - Real-time attendance monitoring
        * Leave Management - Streamlined leave application and approval
        * Payroll Management - Automated salary calculation and payslips
        * Performance Tracking - Goal setting and performance reviews
        
        Built for Odoo Hackathon 2026
    """,
    'author': 'Dayflow Team',
    'website': 'https://github.com/palgandhi/Odoo-HRMS',
    'license': 'LGPL-3',
    'depends': [
        'base',
        'hr',
        'hr_attendance',
        'hr_holidays',
    ],
    'data': [
        # Security
        'security/ir.model.access.csv',
        
        # Views
        'views/employee_views.xml',
        'views/attendance_views.xml',
        'views/leave_views.xml',
        # 'views/payroll_views.xml',  # Requires hr_payroll module (Enterprise)
        'views/performance_views.xml',
        'views/menu_views.xml',
        
        # Data
        'data/performance_data.xml',
    ],
    'demo': [
        'data/demo_data.xml',
    ],
    'images': ['static/description/banner.png'],
    'installable': True,
    'application': True,
    'auto_install': False,
}
