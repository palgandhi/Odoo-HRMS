{
    'name': 'Dayflow Performance',
    'version': '1.0',
    'summary': 'Performance Review Module for Dayflow HRMS',
    'description': 'Handles employee performance reviews, ratings, and feedback.',
    'category': 'Human Resources',
    'author': 'Dayflow Team',
    'depends': ['hr'],
    'data': [
        'security/ir.model.access.csv',
        'views/performance_views.xml',
    ],
    'installable': True,
    'application': True,
}
