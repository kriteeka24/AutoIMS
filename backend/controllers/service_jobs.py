"""
Service Jobs controller - Raw SQL operations for service job management.
"""
from db.connection import get_db_cursor, execute_returning
from datetime import datetime

SCHEMA = 'vehicle_service'


def get_all_jobs():
    """Get all service jobs with employee and vehicle info."""
    with get_db_cursor() as cur:
        cur.execute(f"""
            SELECT sj.*, 
                   e.name AS employee_name, e.role AS employee_role,
                   sr.service_type, sr.problem_note, sr.priority,
                   v.plate_no, v.brand, v.model, v.year,
                   c.name AS customer_name, c.phone AS customer_phone
            FROM {SCHEMA}.service_jobs sj
            LEFT JOIN {SCHEMA}.employees e ON sj.assigned_employee = e.employee_id
            LEFT JOIN {SCHEMA}.service_requests sr ON sj.request_id = sr.request_id
            LEFT JOIN {SCHEMA}.vehicles v ON sr.vehicle_id = v.vehicle_id
            LEFT JOIN {SCHEMA}.customers c ON v.customer_id = c.customer_id
            ORDER BY sj.start_time DESC NULLS LAST
        """)
        return [dict(row) for row in cur.fetchall()]


def get_job_by_id(job_id):
    """Get a single job with full details."""
    with get_db_cursor() as cur:
        cur.execute(f"""
            SELECT sj.*, 
                   e.name AS employee_name, e.role AS employee_role, e.phone AS employee_phone,
                   sr.service_type, sr.problem_note, sr.priority, sr.status AS request_status,
                   v.plate_no, v.brand, v.model, v.year, v.color,
                   c.name AS customer_name, c.phone AS customer_phone, c.email AS customer_email
            FROM {SCHEMA}.service_jobs sj
            LEFT JOIN {SCHEMA}.employees e ON sj.assigned_employee = e.employee_id
            LEFT JOIN {SCHEMA}.service_requests sr ON sj.request_id = sr.request_id
            LEFT JOIN {SCHEMA}.vehicles v ON sr.vehicle_id = v.vehicle_id
            LEFT JOIN {SCHEMA}.customers c ON v.customer_id = c.customer_id
            WHERE sj.job_id = %s
        """, (job_id,))
        row = cur.fetchone()
        return dict(row) if row else None


def create_job(request_id, assigned_employee=None, labor_charge=0.00):
    """Create a new service job."""
    query = f"""
        INSERT INTO {SCHEMA}.service_jobs 
            (request_id, assigned_employee, labor_charge, job_status, start_time)
        VALUES (%s, %s, %s, 'In Progress', %s)
        RETURNING *
    """
    result = execute_returning(query, (request_id, assigned_employee, labor_charge, datetime.now()))
    return dict(result) if result else None


def assign_employee(job_id, employee_id):
    """Assign an employee to a job."""
    query = f"""
        UPDATE {SCHEMA}.service_jobs
        SET assigned_employee = %s
        WHERE job_id = %s
        RETURNING *
    """
    result = execute_returning(query, (employee_id, job_id))
    return dict(result) if result else None


def update_job_status(job_id, status, end_time=None):
    """Update the status of a job."""
    if status == 'Completed' and end_time is None:
        end_time = datetime.now()
    
    query = f"""
        UPDATE {SCHEMA}.service_jobs
        SET job_status = %s, end_time = %s
        WHERE job_id = %s
        RETURNING *
    """
    result = execute_returning(query, (status, end_time, job_id))
    return dict(result) if result else None


def update_labor_charge(job_id, labor_charge):
    """Update labor charge for a job."""
    query = f"""
        UPDATE {SCHEMA}.service_jobs
        SET labor_charge = %s
        WHERE job_id = %s
        RETURNING *
    """
    result = execute_returning(query, (labor_charge, job_id))
    return dict(result) if result else None


def job_exists(job_id):
    """Check if a job exists."""
    with get_db_cursor() as cur:
        cur.execute(f"SELECT 1 FROM {SCHEMA}.service_jobs WHERE job_id = %s", (job_id,))
        return cur.fetchone() is not None


def request_exists(request_id):
    """Check if a service request exists."""
    with get_db_cursor() as cur:
        cur.execute(f"SELECT 1 FROM {SCHEMA}.service_requests WHERE request_id = %s", (request_id,))
        return cur.fetchone() is not None


def get_jobs_by_status(status):
    """Get all jobs with a specific status."""
    with get_db_cursor() as cur:
        cur.execute(f"""
            SELECT sj.*, e.name AS employee_name
            FROM {SCHEMA}.service_jobs sj
            LEFT JOIN {SCHEMA}.employees e ON sj.employee_id = e.id
            WHERE sj.job_status = %s
            ORDER BY sj.start_time DESC
        """, (status,))
        return [dict(row) for row in cur.fetchall()]


def get_completed_jobs_without_bills():
    """Get all completed jobs that don't have a billing record yet."""
    with get_db_cursor() as cur:
        cur.execute(f"""
            SELECT sj.*, 
                   e.name AS employee_name,
                   sr.service_type, sr.problem_note, sr.priority,
                   v.plate_no, v.brand, v.model, v.year,
                   c.name AS customer_name, c.phone AS customer_phone
            FROM {SCHEMA}.service_jobs sj
            LEFT JOIN {SCHEMA}.employees e ON sj.employee_id = e.id
            LEFT JOIN {SCHEMA}.service_requests sr ON sj.request_id = sr.request_id
            LEFT JOIN {SCHEMA}.vehicles v ON sr.vehicle_id = v.vehicle_id
            LEFT JOIN {SCHEMA}.customers c ON v.customer_id = c.customer_id
            WHERE sj.job_status = 'Completed'
            AND NOT EXISTS (
                SELECT 1 FROM {SCHEMA}.billing b WHERE b.job_id = sj.job_id
            )
            ORDER BY sj.end_time DESC NULLS LAST
        """)
        return [dict(row) for row in cur.fetchall()]
