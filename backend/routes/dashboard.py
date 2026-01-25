from flask import Blueprint, jsonify
from db import db
from models.user import User
from utils.jwt_utils import token_required
from sqlalchemy import text

# Create dashboard blueprint
dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api')

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
        # Get summary statistics from the database
        stats = get_dashboard_stats()
        
        return jsonify({
            'message': 'Dashboard data retrieved successfully',
            'user': current_user.to_dict(),
            'stats': stats
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to load dashboard: {str(e)}'}), 500


@dashboard_bp.route('/dashboard/customers', methods=['GET'])
@token_required
def get_customers(current_user):
    """
    Get all customers.
    
    Requires:
        Authorization header with Bearer token
    
    Returns:
        JSON with list of customers
    """
    try:
        result = db.session.execute(
            text("SELECT * FROM vehicle_service.customers ORDER BY created_at DESC")
        )
        customers = [dict(row._mapping) for row in result]
        
        return jsonify({
            'message': 'Customers retrieved successfully',
            'customers': customers
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get customers: {str(e)}'}), 500


@dashboard_bp.route('/dashboard/vehicles', methods=['GET'])
@token_required
def get_vehicles(current_user):
    """
    Get all vehicles with customer info.
    
    Requires:
        Authorization header with Bearer token
    
    Returns:
        JSON with list of vehicles
    """
    try:
        result = db.session.execute(
            text("""
                SELECT v.*, c.name as customer_name, c.phone as customer_phone
                FROM vehicle_service.vehicles v
                LEFT JOIN vehicle_service.customers c ON v.customer_id = c.customer_id
                ORDER BY v.vehicle_id DESC
            """)
        )
        vehicles = [dict(row._mapping) for row in result]
        
        return jsonify({
            'message': 'Vehicles retrieved successfully',
            'vehicles': vehicles
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get vehicles: {str(e)}'}), 500


@dashboard_bp.route('/dashboard/service-requests', methods=['GET'])
@token_required
def get_service_requests(current_user):
    """
    Get all service requests with vehicle info.
    
    Requires:
        Authorization header with Bearer token
    
    Returns:
        JSON with list of service requests
    """
    try:
        result = db.session.execute(
            text("""
                SELECT sr.*, v.plate_no, v.brand, v.model, c.name as customer_name
                FROM vehicle_service.service_requests sr
                LEFT JOIN vehicle_service.vehicles v ON sr.vehicle_id = v.vehicle_id
                LEFT JOIN vehicle_service.customers c ON v.customer_id = c.customer_id
                ORDER BY sr.request_date DESC
            """)
        )
        requests = [dict(row._mapping) for row in result]
        
        return jsonify({
            'message': 'Service requests retrieved successfully',
            'service_requests': requests
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get service requests: {str(e)}'}), 500


@dashboard_bp.route('/dashboard/service-jobs', methods=['GET'])
@token_required
def get_service_jobs(current_user):
    """
    Get all service jobs.
    
    Requires:
        Authorization header with Bearer token
    
    Returns:
        JSON with list of service jobs
    """
    try:
        result = db.session.execute(
            text("""
                SELECT sj.*, sr.service_type, sr.status as request_status,
                       v.plate_no, v.brand, v.model
                FROM vehicle_service.service_jobs sj
                LEFT JOIN vehicle_service.service_requests sr ON sj.request_id = sr.request_id
                LEFT JOIN vehicle_service.vehicles v ON sr.vehicle_id = v.vehicle_id
                ORDER BY sj.start_time DESC
            """)
        )
        jobs = [dict(row._mapping) for row in result]
        
        return jsonify({
            'message': 'Service jobs retrieved successfully',
            'service_jobs': jobs
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get service jobs: {str(e)}'}), 500


@dashboard_bp.route('/dashboard/inventory', methods=['GET'])
@token_required
def get_inventory(current_user):
    """
    Get all inventory items.
    
    Requires:
        Authorization header with Bearer token
    
    Returns:
        JSON with list of inventory items
    """
    try:
        result = db.session.execute(
            text("SELECT * FROM vehicle_service.inventory ORDER BY part_name")
        )
        inventory = [dict(row._mapping) for row in result]
        
        return jsonify({
            'message': 'Inventory retrieved successfully',
            'inventory': inventory
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get inventory: {str(e)}'}), 500


@dashboard_bp.route('/dashboard/billing', methods=['GET'])
@token_required
def get_billing(current_user):
    """
    Get all billing records.
    
    Requires:
        Authorization header with Bearer token
    
    Returns:
        JSON with list of billing records
    """
    try:
        result = db.session.execute(
            text("""
                SELECT b.*, sj.job_status, sr.service_type,
                       v.plate_no, c.name as customer_name
                FROM vehicle_service.billing b
                LEFT JOIN vehicle_service.service_jobs sj ON b.job_id = sj.job_id
                LEFT JOIN vehicle_service.service_requests sr ON sj.request_id = sr.request_id
                LEFT JOIN vehicle_service.vehicles v ON sr.vehicle_id = v.vehicle_id
                LEFT JOIN vehicle_service.customers c ON v.customer_id = c.customer_id
                ORDER BY b.bill_date DESC
            """)
        )
        bills = [dict(row._mapping) for row in result]
        
        return jsonify({
            'message': 'Billing records retrieved successfully',
            'billing': bills
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get billing: {str(e)}'}), 500


def get_dashboard_stats():
    """
    Get summary statistics for the dashboard.
    
    Returns:
        dict: Statistics including counts and totals
    """
    try:
        # Count customers
        customers_count = db.session.execute(
            text("SELECT COUNT(*) FROM vehicle_service.customers")
        ).scalar() or 0
        
        # Count vehicles
        vehicles_count = db.session.execute(
            text("SELECT COUNT(*) FROM vehicle_service.vehicles")
        ).scalar() or 0
        
        # Count pending service requests
        pending_requests = db.session.execute(
            text("SELECT COUNT(*) FROM vehicle_service.service_requests WHERE status = 'Pending'")
        ).scalar() or 0
        
        # Count active service jobs (In Progress)
        active_jobs = db.session.execute(
            text("SELECT COUNT(*) FROM vehicle_service.service_jobs WHERE job_status = 'In Progress'")
        ).scalar() or 0
        
        # Count low stock inventory items
        low_stock = db.session.execute(
            text("SELECT COUNT(*) FROM vehicle_service.inventory WHERE quantity_in_stock <= reorder_level")
        ).scalar() or 0
        
        # Total unpaid bills
        unpaid_total = db.session.execute(
            text("SELECT COALESCE(SUM(total_amount), 0) FROM vehicle_service.billing WHERE payment_status = 'Unpaid'")
        ).scalar() or 0
        
        # Total revenue (paid bills)
        total_revenue = db.session.execute(
            text("SELECT COALESCE(SUM(total_amount), 0) FROM vehicle_service.billing WHERE payment_status = 'Paid'")
        ).scalar() or 0
        
        return {
            'customers_count': customers_count,
            'vehicles_count': vehicles_count,
            'pending_requests': pending_requests,
            'active_jobs': active_jobs,
            'low_stock_items': low_stock,
            'unpaid_total': float(unpaid_total),
            'total_revenue': float(total_revenue)
        }
        
    except Exception as e:
        # Return zeros if there's an error (tables might not exist yet)
        return {
            'customers_count': 0,
            'vehicles_count': 0,
            'pending_requests': 0,
            'active_jobs': 0,
            'low_stock_items': 0,
            'unpaid_total': 0.0,
            'total_revenue': 0.0
        }
