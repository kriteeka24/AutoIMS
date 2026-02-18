from flask import Blueprint, jsonify
from db.connection import get_db_cursor
from utils.jwt_utils import token_required

SCHEMA = 'vehicle_service'

# Create dashboard blueprint
dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api')

def employee_to_dict(emp_row):
    """Convert employee row to safe dict for JSON response."""
    if not emp_row:
        return None
    return {
        'id': emp_row.get('id'),
        'name': emp_row.get('name'),
        'username': emp_row.get('username'),
        'email': emp_row.get('email'),
        'position': emp_row.get('position'),
        'working_status': emp_row.get('working_status'),
    }

@dashboard_bp.route('/dashboard', methods=['GET'])
@token_required
def get_dashboard(current_user):
    """
    Get dashboard data for the authenticated user.
    
    Requires:
        Authorization header with Bearer token
    
    Returns:
        JSON with dashboard statistics and user info
    """
    try:
        print(f"[DEBUG] Dashboard route called by user: {current_user}")
        stats = get_dashboard_stats()
        print(f"[DEBUG] Dashboard stats returned: {stats}")
        
        return jsonify({
            'message': 'Dashboard data retrieved successfully',
            'user': employee_to_dict(current_user),
            'stats': stats
        }), 200
        
    except Exception as e:
        print(f"[DEBUG] Dashboard error: {str(e)}")
        return jsonify({'error': f'Failed to load dashboard: {str(e)}'}), 500


@dashboard_bp.route('/dashboard/customers', methods=['GET'])
@token_required
def get_customers(current_user):
    """Get all customers."""
    try:
        with get_db_cursor() as cur:
            cur.execute(f"SELECT * FROM {SCHEMA}.customers ORDER BY created_at DESC")
            customers = [dict(row) for row in cur.fetchall()]
        
        return jsonify({
            'message': 'Customers retrieved successfully',
            'customers': customers
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get customers: {str(e)}'}), 500


@dashboard_bp.route('/dashboard/vehicles', methods=['GET'])
@token_required
def get_vehicles(current_user):
    """Get all vehicles with customer info."""
    try:
        with get_db_cursor() as cur:
            cur.execute(f"""
                SELECT v.*, c.name as customer_name, c.phone as customer_phone
                FROM {SCHEMA}.vehicles v
                LEFT JOIN {SCHEMA}.customers c ON v.customer_id = c.customer_id
                ORDER BY v.vehicle_id DESC
            """)
            vehicles = [dict(row) for row in cur.fetchall()]
        
        return jsonify({
            'message': 'Vehicles retrieved successfully',
            'vehicles': vehicles
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get vehicles: {str(e)}'}), 500


@dashboard_bp.route('/dashboard/service-requests', methods=['GET'])
@token_required
def get_service_requests(current_user):
    """Get all service requests with vehicle info."""
    try:
        with get_db_cursor() as cur:
            cur.execute(f"""
                SELECT sr.*, v.plate_no, v.brand, v.model, c.name as customer_name
                FROM {SCHEMA}.service_requests sr
                LEFT JOIN {SCHEMA}.vehicles v ON sr.vehicle_id = v.vehicle_id
                LEFT JOIN {SCHEMA}.customers c ON v.customer_id = c.customer_id
                ORDER BY sr.request_date DESC
            """)
            requests = [dict(row) for row in cur.fetchall()]
        
        return jsonify({
            'message': 'Service requests retrieved successfully',
            'service_requests': requests
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get service requests: {str(e)}'}), 500


@dashboard_bp.route('/dashboard/service-jobs', methods=['GET'])
@token_required
def get_service_jobs(current_user):
    """Get all service jobs."""
    try:
        with get_db_cursor() as cur:
            cur.execute(f"""
                SELECT sj.*, sr.service_type, sr.status as request_status,
                       v.plate_no, v.brand, v.model
                FROM {SCHEMA}.service_jobs sj
                LEFT JOIN {SCHEMA}.service_requests sr ON sj.request_id = sr.request_id
                LEFT JOIN {SCHEMA}.vehicles v ON sr.vehicle_id = v.vehicle_id
                ORDER BY sj.start_time DESC
            """)
            jobs = [dict(row) for row in cur.fetchall()]
        
        return jsonify({
            'message': 'Service jobs retrieved successfully',
            'service_jobs': jobs
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get service jobs: {str(e)}'}), 500


@dashboard_bp.route('/dashboard/inventory', methods=['GET'])
@token_required
def get_inventory(current_user):
    """Get all inventory items."""
    try:
        with get_db_cursor() as cur:
            cur.execute(f"SELECT * FROM {SCHEMA}.inventory ORDER BY part_name")
            inventory = [dict(row) for row in cur.fetchall()]
        
        return jsonify({
            'message': 'Inventory retrieved successfully',
            'inventory': inventory
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get inventory: {str(e)}'}), 500


@dashboard_bp.route('/dashboard/billing', methods=['GET'])
@token_required
def get_billing(current_user):
    """Get all billing records."""
    try:
        with get_db_cursor() as cur:
            cur.execute(f"""
                SELECT b.*, sj.job_status, sr.service_type,
                       v.plate_no, c.name as customer_name
                FROM {SCHEMA}.billing b
                LEFT JOIN {SCHEMA}.service_jobs sj ON b.job_id = sj.job_id
                LEFT JOIN {SCHEMA}.service_requests sr ON sj.request_id = sr.request_id
                LEFT JOIN {SCHEMA}.vehicles v ON sr.vehicle_id = v.vehicle_id
                LEFT JOIN {SCHEMA}.customers c ON v.customer_id = c.customer_id
                ORDER BY b.bill_date DESC
            """)
            bills = [dict(row) for row in cur.fetchall()]
        
        return jsonify({
            'message': 'Billing records retrieved successfully',
            'billing': bills
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get billing: {str(e)}'}), 500


def get_dashboard_stats():
    """Get summary statistics for the dashboard."""
    print("[DEBUG] get_dashboard_stats() called")
    try:
        with get_db_cursor() as cur:
            # Count customers
            cur.execute("SELECT COUNT(*) as count FROM vehicle_service.customers")
            customers_count = cur.fetchone()['count'] or 0
            print(f"[DEBUG] customers_count = {customers_count}")
            
            # Count vehicles
            cur.execute("SELECT COUNT(*) as count FROM vehicle_service.vehicles")
            vehicles_count = cur.fetchone()['count'] or 0
            print(f"[DEBUG] vehicles_count = {vehicles_count}")
            
            # Count pending service requests
            cur.execute("SELECT COUNT(*) as count FROM vehicle_service.service_requests WHERE status = 'Pending'")
            pending_requests = cur.fetchone()['count'] or 0
            print(f"[DEBUG] pending_requests = {pending_requests}")
            
            # Count active service jobs (Pending OR In Progress)
            cur.execute("SELECT COUNT(*) as count FROM vehicle_service.service_jobs WHERE job_status IN ('Pending', 'In Progress')")
            active_jobs = cur.fetchone()['count'] or 0
            print(f"[DEBUG] active_jobs = {active_jobs}")
            
            # Count low stock inventory items
            cur.execute("SELECT COUNT(*) as count FROM vehicle_service.inventory WHERE quantity_in_stock <= reorder_level")
            low_stock = cur.fetchone()['count'] or 0
            print(f"[DEBUG] low_stock = {low_stock}")
            
            # Total unpaid bills
            cur.execute("SELECT COALESCE(SUM(total_amount), 0) as total FROM vehicle_service.billing WHERE payment_status = 'Unpaid'")
            unpaid_total = cur.fetchone()['total'] or 0
            print(f"[DEBUG] unpaid_total = {unpaid_total}")
            
            # Total revenue (paid bills)
            cur.execute("SELECT COALESCE(SUM(total_amount), 0) as total FROM vehicle_service.billing WHERE payment_status = 'Paid'")
            revenue_row = cur.fetchone()
            total_revenue = revenue_row['total'] or 0
            print(f"[DEBUG] total_revenue = {total_revenue}")
            
            # Top employees by rating (limit 3)
            cur.execute("""
                SELECT id, name, position, CAST(rating AS FLOAT) as rating, jobs_done 
                FROM vehicle_service.employees 
                WHERE working_status = 'Working'
                ORDER BY rating DESC, jobs_done DESC 
                LIMIT 3
            """)
            top_employees = [dict(row) for row in cur.fetchall()]
            print(f"[DEBUG] top_employees = {top_employees}")
        
        stats = {
            'customers_count': int(customers_count),
            'vehicles_count': int(vehicles_count),
            'pending_requests': int(pending_requests),
            'active_jobs': int(active_jobs),
            'low_stock_items': int(low_stock),
            'unpaid_total': float(unpaid_total),
            'total_revenue': float(total_revenue),
            'top_employees': top_employees
        }
        print(f"[DEBUG] Final stats dict: {stats}")
        return stats
        
    except Exception as e:
        print(f"[DEBUG] ERROR in get_dashboard_stats: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            'customers_count': 0,
            'vehicles_count': 0,
            'pending_requests': 0,
            'active_jobs': 0,
            'low_stock_items': 0,
            'unpaid_total': 0.0,
            'total_revenue': 0.0,
            'top_employees': []
        }
