"""
Job Parts Used controller - Raw SQL operations for tracking parts used in jobs.
"""
from db.connection import get_db_cursor, get_db_connection

SCHEMA = 'vehicle_service'


def get_parts_for_job(job_id):
    """Get all parts used in a specific job."""
    with get_db_cursor() as cur:
        cur.execute(f"""
            SELECT jpu.*, i.part_name, i.part_code, i.brand
            FROM {SCHEMA}.job_parts_used jpu
            JOIN {SCHEMA}.inventory i ON jpu.part_id = i.part_id
            WHERE jpu.job_id = %s
            ORDER BY jpu.job_part_id
        """, (job_id,))
        return [dict(row) for row in cur.fetchall()]


def get_active_job_for_vehicle(vehicle_id):
    """Get the active (In Progress) job for a vehicle."""
    with get_db_cursor() as cur:
        cur.execute(f"""
            SELECT sj.job_id, sj.job_status, sj.labor_charge,
                   sr.request_id, sr.service_type,
                   c.name AS customer_name
            FROM {SCHEMA}.service_jobs sj
            JOIN {SCHEMA}.service_requests sr ON sj.request_id = sr.request_id
            JOIN {SCHEMA}.vehicles v ON sr.vehicle_id = v.vehicle_id
            JOIN {SCHEMA}.customers c ON v.customer_id = c.customer_id
            WHERE v.vehicle_id = %s AND sj.job_status = 'In Progress'
            ORDER BY sj.start_time DESC
            LIMIT 1
        """, (vehicle_id,))
        row = cur.fetchone()
        return dict(row) if row else None


def get_active_job_by_plate_no(plate_no, customer_id=None):
    """
    Get the active (In Progress) job for a vehicle by its plate number.
    Optionally verify that the vehicle belongs to the specified customer.
    """
    with get_db_cursor() as cur:
        # Build query with optional customer verification
        if customer_id:
            cur.execute(f"""
                SELECT sj.job_id, sj.job_status, sj.labor_charge,
                       sr.request_id, sr.service_type,
                       c.customer_id, c.name AS customer_name,
                       v.vehicle_id, v.plate_no
                FROM {SCHEMA}.service_jobs sj
                JOIN {SCHEMA}.service_requests sr ON sj.request_id = sr.request_id
                JOIN {SCHEMA}.vehicles v ON sr.vehicle_id = v.vehicle_id
                JOIN {SCHEMA}.customers c ON v.customer_id = c.customer_id
                WHERE LOWER(v.plate_no) = LOWER(%s) 
                  AND c.customer_id = %s
                  AND sj.job_status = 'In Progress'
                ORDER BY sj.start_time DESC
                LIMIT 1
            """, (plate_no, customer_id))
        else:
            cur.execute(f"""
                SELECT sj.job_id, sj.job_status, sj.labor_charge,
                       sr.request_id, sr.service_type,
                       c.customer_id, c.name AS customer_name,
                       v.vehicle_id, v.plate_no
                FROM {SCHEMA}.service_jobs sj
                JOIN {SCHEMA}.service_requests sr ON sj.request_id = sr.request_id
                JOIN {SCHEMA}.vehicles v ON sr.vehicle_id = v.vehicle_id
                JOIN {SCHEMA}.customers c ON v.customer_id = c.customer_id
                WHERE LOWER(v.plate_no) = LOWER(%s) AND sj.job_status = 'In Progress'
                ORDER BY sj.start_time DESC
                LIMIT 1
            """, (plate_no,))
        row = cur.fetchone()
        return dict(row) if row else None


def verify_vehicle_ownership(plate_no, customer_id):
    """Verify that a vehicle with the given plate_no belongs to the customer."""
    with get_db_cursor() as cur:
        cur.execute(f"""
            SELECT v.vehicle_id, v.plate_no, c.customer_id, c.name AS customer_name
            FROM {SCHEMA}.vehicles v
            JOIN {SCHEMA}.customers c ON v.customer_id = c.customer_id
            WHERE LOWER(v.plate_no) = LOWER(%s) AND c.customer_id = %s
        """, (plate_no, customer_id))
        row = cur.fetchone()
        return dict(row) if row else None


def add_part_to_job(job_id, part_id, quantity_used):
    """
    Add a part to a job and update inventory.
    Uses a transaction to ensure both operations succeed or fail together.
    """
    from psycopg.rows import dict_row
    
    with get_db_connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            # Get current unit price from inventory
            cur.execute(f"""
                SELECT unit_price, quantity_in_stock 
                FROM {SCHEMA}.inventory WHERE part_id = %s
            """, (part_id,))
            part = cur.fetchone()
            
            if not part:
                return None, "Part not found"
            
            unit_price = part['unit_price']
            current_stock = part['quantity_in_stock']
            
            # Check if enough stock
            if current_stock < quantity_used:
                return None, f"Insufficient stock. Available: {current_stock}, Requested: {quantity_used}"
            
            # Insert into job_parts_used
            cur.execute(f"""
                INSERT INTO {SCHEMA}.job_parts_used (job_id, part_id, quantity_used, unit_price_at_time)
                VALUES (%s, %s, %s, %s)
                RETURNING job_part_id
            """, (job_id, part_id, quantity_used, unit_price))
            job_part_id = cur.fetchone()['job_part_id']
            
            # Update inventory quantity
            cur.execute(f"""
                UPDATE {SCHEMA}.inventory
                SET quantity_in_stock = quantity_in_stock - %s, last_updated = CURRENT_TIMESTAMP
                WHERE part_id = %s
            """, (quantity_used, part_id))
            
            conn.commit()
            
            # Fetch the created record with part details
            cur.execute(f"""
                SELECT jpu.*, i.part_name, i.part_code, i.brand
                FROM {SCHEMA}.job_parts_used jpu
                JOIN {SCHEMA}.inventory i ON jpu.part_id = i.part_id
                WHERE jpu.job_part_id = %s
            """, (job_part_id,))
            
            row = cur.fetchone()
            if row:
                return dict(row), None
            
            return None, "Failed to retrieve created record"


def remove_part_from_job(job_part_id):
    """
    Remove a part from a job and restore inventory.
    """
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            # Get the part usage details first
            cur.execute(f"""
                SELECT part_id, quantity_used 
                FROM {SCHEMA}.job_parts_used WHERE job_part_id = %s
            """, (job_part_id,))
            usage = cur.fetchone()
            
            if not usage:
                return False, "Part usage record not found"
            
            part_id, quantity_used = usage
            
            # Delete the usage record
            cur.execute(f"""
                DELETE FROM {SCHEMA}.job_parts_used WHERE job_part_id = %s
            """, (job_part_id,))
            
            # Restore inventory
            cur.execute(f"""
                UPDATE {SCHEMA}.inventory
                SET quantity_in_stock = quantity_in_stock + %s, last_updated = CURRENT_TIMESTAMP
                WHERE part_id = %s
            """, (quantity_used, part_id))
            
            conn.commit()
            return True, None


def get_total_parts_cost(job_id):
    """Calculate total cost of parts used in a job."""
    with get_db_cursor() as cur:
        cur.execute(f"""
            SELECT COALESCE(SUM(quantity_used * unit_price_at_time), 0) as total
            FROM {SCHEMA}.job_parts_used
            WHERE job_id = %s
        """, (job_id,))
        row = cur.fetchone()
        return float(row['total']) if row else 0.0


def job_exists(job_id):
    """Check if a job exists."""
    with get_db_cursor() as cur:
        cur.execute(f"SELECT 1 FROM {SCHEMA}.service_jobs WHERE job_id = %s", (job_id,))
        return cur.fetchone() is not None


def part_exists(part_id):
    """Check if a part exists."""
    with get_db_cursor() as cur:
        cur.execute(f"SELECT 1 FROM {SCHEMA}.inventory WHERE part_id = %s", (part_id,))
        return cur.fetchone() is not None
