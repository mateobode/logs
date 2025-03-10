from django.utils import timezone
from datetime import timedelta
import random
import os
import django

# Setup Django environment if script is run directly
if __name__ == "__main__" and not os.environ.get('DJANGO_SETTINGS_MODULE'):
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'zeroboard_logs.settings')
    django.setup()

from backend.models.log import Log  # Replace 'your_app' with your actual app name

# Assuming SEVERITY_CHOICES includes these common log levels
# If your choices are different, adjust accordingly
SEVERITIES = ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL']

# Common sources for logs
SOURCES = [
    'nginx', 'database', 'application', 'api', 'auth',
    'scheduler', 'worker', 'cache', 'system', 'backend'
]

# Sample log messages for each severity
LOG_MESSAGES = {
    'DEBUG': [
        'Initializing component with params: cache_size=512, timeout=30s',
        'User session data: last_active=2023-05-12T15:30:45Z',
        'API request received: GET /api/v1/users?page=2&limit=20',
        'Database query executed in 45ms: SELECT * FROM users WHERE active=true',
        'Cache hit ratio: 0.78 (156/200)',
        'Thread pool status: active=3, idle=7, queue=0',
        'Parsing request parameters: sort=name&order=asc',
        'Rendering template with context: {user: "john_doe", theme: "dark"}',
    ],
    'INFO': [
        'User logged in successfully: username=john_doe',
        'Payment processed: order_id=ORD-12345, amount=$59.99',
        'New user registered: email=user@example.com',
        'Scheduled task completed: backup_database (duration: 3m 45s)',
        'Email sent to user@example.com: "Password Reset Confirmation"',
        'API endpoint response time: GET /api/v1/products - 230ms',
        'Cache refreshed for key: product_categories (TTL: 1 hour)',
        'Worker process started with pid 12345',
    ],
    'WARNING': [
        'High CPU usage detected: 85% (threshold: 80%)',
        'Database connection pool nearing capacity: 45/50 connections used',
        'API rate limit approaching: 950/1000 requests (user_id: 5432)',
        'Slow query detected: SELECT * FROM orders (execution time: 2.3s)',
        'Session token nearing expiration for user_id: 1234',
        'Disk space running low: /var/log is 85% full',
        'Cache miss rate increased to 35% (threshold: 30%)',
        'Deprecated API endpoint accessed: /api/v1/legacy/users',
    ],
    'ERROR': [
        'Database query failed: ERROR 1213 (40001): Deadlock found when trying to get lock',
        'API authentication failed: Invalid credentials for user_id: 5432',
        'Email delivery failed to recipient: user@example.com (SMTP error: connection timeout)',
        'Payment gateway error: Transaction declined (code: INSUFFICIENT_FUNDS)',
        'Cache server connection failed: redis://cache-001:6379 (Network unreachable)',
        'Failed to process uploaded file: Invalid format (expected CSV, got XML)',
        'Scheduled task failed: daily_report_generation (Exception: Division by zero)',
        'Database connection failed: Could not connect to PostgreSQL server',
    ],
    'CRITICAL': [
        'Security breach detected: Multiple failed login attempts from IP 192.168.1.100',
        'Database server unreachable: All connection attempts failed',
        'Application crashed: Unhandled exception in main thread',
        'Data corruption detected in user table: Primary key integrity violation',
        'Out of memory error: Worker process terminated unexpectedly',
        'SSL certificate expired for domain: example.com',
        'Firewall breach detected: Unauthorized access to internal network',
        'Fatal error: Cannot write to log directory /var/log (Permission denied)',
    ]
}


def create_sample_logs():
    """Create 40 sample log entries with realistic data"""
    # Current time
    now = timezone.now()

    # Create 40 log entries
    logs_to_create = []
    for i in range(40):
        # Random timestamp within the last week
        random_minutes = random.randint(1, 7 * 24 * 60)  # Up to 1 week ago
        timestamp = now - timedelta(minutes=random_minutes)

        # Weighted severity (make critical and errors less common)
        severity_weights = [40, 30, 15, 10, 5]  # DEBUG, INFO, WARNING, ERROR, CRITICAL
        severity = random.choices(SEVERITIES, weights=severity_weights)[0]

        # Random source
        source = random.choice(SOURCES)

        # Random message based on severity
        message = random.choice(LOG_MESSAGES[severity])

        # Create log entry
        log = Log(
            timestamp=timestamp,
            message=message,
            severity=severity,
            source=source
        )
        logs_to_create.append(log)

    # Bulk create all logs
    Log.objects.bulk_create(logs_to_create)
    print(f"Created {len(logs_to_create)} sample log entries")


if __name__ == "__main__":
    create_sample_logs()

