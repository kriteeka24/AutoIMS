"""
Billing controller - Raw SQL operations for billing management.
"""
from db.connection import get_db_cursor, execute_returning
from datetime import datetime

SCHEMA = 'vehicle_service'

# Default tax rate (18% GST for example)
DEFAULT_TAX_RATE = 0.18


def get_all_bills():
    """Get all billing records with job and customer details."""
    with get_db_cursor() as cur:
        cur.execute(f"""
            SELECT b.*, sj.job_status, sj.labor_charge,
                   sr.service_type, v.plate_no, v.brand, v.model,
                   c.name AS customer_name, c.phone AS customer_phone
            FROM {SCHEMA}.billing b
            LEFT JOIN {SCHEMA}.service_jobs sj ON b.job_id = sj.job_id
            LEFT JOIN {SCHEMA}.service_requests sr ON sj.request_id = sr.request_id
            LEFT JOIN {SCHEMA}.vehicles v ON sr.vehicle_id = v.vehicle_id
            LEFT JOIN {SCHEMA}.customers c ON v.customer_id = c.customer_id
            ORDER BY b.bill_date DESC
        """)
        return [dict(row) for row in cur.fetchall()]


def get_bill_by_id(bill_id):
    """Get a single bill by ID with full details."""
    with get_db_cursor() as cur:
        cur.execute(f"""
            SELECT b.*, sj.job_status, sj.labor_charge, sj.start_time, sj.end_time,
                   sr.service_type, sr.problem_note,
                   v.plate_no, v.brand, v.model, v.year,
                   c.name AS customer_name, c.phone AS customer_phone, c.email AS customer_email
            FROM {SCHEMA}.billing b
            LEFT JOIN {SCHEMA}.service_jobs sj ON b.job_id = sj.job_id
            LEFT JOIN {SCHEMA}.service_requests sr ON sj.request_id = sr.request_id
            LEFT JOIN {SCHEMA}.vehicles v ON sr.vehicle_id = v.vehicle_id
            LEFT JOIN {SCHEMA}.customers c ON v.customer_id = c.customer_id
            WHERE b.bill_id = %s
        """, (bill_id,))
        row = cur.fetchone()
        return dict(row) if row else None


def get_bill_by_job_id(job_id):
    """Get billing details for a specific job."""
    with get_db_cursor() as cur:
        cur.execute(f"""
            SELECT b.*, sj.job_status, sj.labor_charge, sj.start_time, sj.end_time,
                   sr.service_type, sr.problem_note,
                   v.plate_no, v.brand, v.model, v.year,
                   c.name AS customer_name, c.phone AS customer_phone, c.email AS customer_email
            FROM {SCHEMA}.billing b
            LEFT JOIN {SCHEMA}.service_jobs sj ON b.job_id = sj.job_id
            LEFT JOIN {SCHEMA}.service_requests sr ON sj.request_id = sr.request_id
            LEFT JOIN {SCHEMA}.vehicles v ON sr.vehicle_id = v.vehicle_id
            LEFT JOIN {SCHEMA}.customers c ON v.customer_id = c.customer_id
            WHERE b.job_id = %s
        """, (job_id,))
        row = cur.fetchone()
        
        if not row:
            return None
        
        bill = dict(row)
        
        # Get parts used in this job
        cur.execute(f"""
            SELECT jpu.*, i.part_name, i.part_code, i.brand
            FROM {SCHEMA}.job_parts_used jpu
            JOIN {SCHEMA}.inventory i ON jpu.part_id = i.part_id
            WHERE jpu.job_id = %s
        """, (job_id,))
        bill['parts_used'] = [dict(r) for r in cur.fetchall()]
        
        return bill


def generate_bill(job_id, tax_rate=None):
    """
    Generate a bill for a completed job.
    Calculates labor + parts + tax.
    """
    if tax_rate is None:
        tax_rate = DEFAULT_TAX_RATE
    
    with get_db_cursor() as cur:
        # Check if bill already exists for this job
        cur.execute(f"SELECT bill_id FROM {SCHEMA}.billing WHERE job_id = %s", (job_id,))
        if cur.fetchone():
            return None, "Bill already exists for this job"
        
        # Get labor charge from job
        cur.execute(f"SELECT labor_charge FROM {SCHEMA}.service_jobs WHERE job_id = %s", (job_id,))
        job = cur.fetchone()
        if not job:
            return None, "Job not found"
        
        subtotal_labor = float(job['labor_charge'] or 0)
        
        # Calculate parts total
        cur.execute(f"""
            SELECT COALESCE(SUM(quantity_used * unit_price_at_time), 0) as total
            FROM {SCHEMA}.job_parts_used WHERE job_id = %s
        """, (job_id,))
        subtotal_parts = float(cur.fetchone()['total'])
        
        # Calculate tax and total
        subtotal = subtotal_labor + subtotal_parts
        tax = round(subtotal * tax_rate, 2)
        total_amount = round(subtotal + tax, 2)
    
    # Insert the bill
    query = f"""
        INSERT INTO {SCHEMA}.billing 
            (job_id, subtotal_labor, subtotal_parts, tax, total_amount, payment_status, bill_date)
        VALUES (%s, %s, %s, %s, %s, 'Unpaid', %s)
        RETURNING *
    """
    result = execute_returning(query, (
        job_id, subtotal_labor, subtotal_parts, tax, total_amount, datetime.now()
    ))
    
    return dict(result) if result else None, None


def mark_as_paid(bill_id):
    """Mark a bill as paid using raw SQL."""
    query = f"""
        UPDATE {SCHEMA}.billing
        SET payment_status = 'Paid', payment_date = CURRENT_TIMESTAMP
        WHERE bill_id = %s
        RETURNING *
    """
    print(f"[DEBUG] Marking bill {bill_id} as paid")
    result = execute_returning(query, (bill_id,))
    print(f"[DEBUG] mark_as_paid result: {result}")
    return dict(result) if result else None


def update_bill(bill_id, subtotal_labor=None, subtotal_parts=None, tax=None):
    """Update bill amounts and recalculate total."""
    # First get current values
    current_bill = get_bill_by_id(bill_id)
    if not current_bill:
        return None
    
    labor = subtotal_labor if subtotal_labor is not None else current_bill['subtotal_labor']
    parts = subtotal_parts if subtotal_parts is not None else current_bill['subtotal_parts']
    tax_amount = tax if tax is not None else current_bill['tax']
    total_amount = float(labor) + float(parts) + float(tax_amount)
    
    query = f"""
        UPDATE {SCHEMA}.billing
        SET subtotal_labor = %s, subtotal_parts = %s, tax = %s, total_amount = %s
        WHERE bill_id = %s
        RETURNING *
    """
    result = execute_returning(query, (labor, parts, tax_amount, total_amount, bill_id))
    return dict(result) if result else None


def job_exists(job_id):
    """Check if a job exists."""
    with get_db_cursor() as cur:
        cur.execute(f"SELECT 1 FROM {SCHEMA}.service_jobs WHERE job_id = %s", (job_id,))
        return cur.fetchone() is not None


def bill_exists(bill_id):
    """Check if a bill exists."""
    with get_db_cursor() as cur:
        cur.execute(f"SELECT 1 FROM {SCHEMA}.billing WHERE bill_id = %s", (bill_id,))
        return cur.fetchone() is not None
