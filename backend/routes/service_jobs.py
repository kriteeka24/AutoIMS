"""
Service Jobs API routes.
"""
from flask import Blueprint, request, jsonify
from controllers import service_jobs as job_ctrl
from controllers import employees as emp_ctrl
from utils.jwt_utils import token_required

service_jobs_bp = Blueprint('service_jobs', __name__, url_prefix='/api/jobs')


@service_jobs_bp.route('', methods=['GET'])
@token_required
def get_all_jobs(current_user):
    """Get all service jobs with employee and vehicle info."""
    try:
        status_filter = request.args.get('status')
        pending_billing = request.args.get('pending_billing')
        
        if pending_billing == 'true':
            jobs = job_ctrl.get_completed_jobs_without_bills()
        elif status_filter:
            jobs = job_ctrl.get_jobs_by_status(status_filter)
        else:
            jobs = job_ctrl.get_all_jobs()
        
        return jsonify({
            'message': 'Service jobs retrieved successfully',
            'jobs': jobs
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get jobs: {str(e)}'}), 500


@service_jobs_bp.route('/<int:job_id>', methods=['GET'])
@token_required
def get_job(current_user, job_id):
    """Get a single job with full details."""
    try:
        job = job_ctrl.get_job_by_id(job_id)
        
        if not job:
            return jsonify({'error': 'Job not found'}), 404
        
        return jsonify({
            'message': 'Job retrieved successfully',
            'job': job
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get job: {str(e)}'}), 500


@service_jobs_bp.route('', methods=['POST'])
@token_required
def create_job(current_user):
    """
    Create a new service job.
    
    Expected JSON:
    {
        "request_id": 1,
        "assigned_employee": 2,  (optional)
        "labor_charge": 500.00  (optional, default 0)
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        request_id = data.get('request_id')
        
        if not request_id:
            return jsonify({'error': 'request_id is required'}), 400
        
        # Validate service request exists
        if not job_ctrl.request_exists(request_id):
            return jsonify({'error': 'Service request not found'}), 404
        
        # Validate employee if provided
        assigned_employee = data.get('assigned_employee')
        if assigned_employee and not emp_ctrl.employee_exists(assigned_employee):
            return jsonify({'error': 'Assigned employee not found'}), 404
        
        job = job_ctrl.create_job(
            request_id=request_id,
            assigned_employee=assigned_employee,
            labor_charge=data.get('labor_charge', 0.00)
        )
        
        if not job:
            return jsonify({'error': 'Failed to create job'}), 500
        
        return jsonify({
            'message': 'Job created successfully',
            'job': job
        }), 201
        
    except Exception as e:
        return jsonify({'error': f'Failed to create job: {str(e)}'}), 500


@service_jobs_bp.route('/<int:job_id>/assign', methods=['PUT'])
@token_required
def assign_employee(current_user, job_id):
    """
    Assign an employee to a job.
    
    Expected JSON:
    {
        "employee_id": 2
    }
    """
    try:
        # Check if job exists
        if not job_ctrl.job_exists(job_id):
            return jsonify({'error': 'Job not found'}), 404
        
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        employee_id = data.get('employee_id')
        
        if not employee_id:
            return jsonify({'error': 'employee_id is required'}), 400
        
        # Validate employee exists
        if not emp_ctrl.employee_exists(employee_id):
            return jsonify({'error': 'Employee not found'}), 404
        
        job = job_ctrl.assign_employee(job_id, employee_id)
        
        return jsonify({
            'message': 'Employee assigned successfully',
            'job': job
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to assign employee: {str(e)}'}), 500


@service_jobs_bp.route('/<int:job_id>/status', methods=['PUT'])
@token_required
def update_status(current_user, job_id):
    """
    Update job status.
    
    Expected JSON:
    {
        "status": "Completed"  (In Progress, Completed)
    }
    """
    try:
        # Check if job exists
        if not job_ctrl.job_exists(job_id):
            return jsonify({'error': 'Job not found'}), 404
        
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        status = data.get('status')
        
        if not status:
            return jsonify({'error': 'status is required'}), 400
        
        valid_statuses = ['In Progress', 'Completed']
        if status not in valid_statuses:
            return jsonify({'error': f'Invalid status. Must be one of: {valid_statuses}'}), 400
        
        job = job_ctrl.update_job_status(job_id, status)
        
        return jsonify({
            'message': 'Job status updated successfully',
            'job': job
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to update status: {str(e)}'}), 500


@service_jobs_bp.route('/<int:job_id>/labor', methods=['PUT'])
@token_required
def update_labor(current_user, job_id):
    """
    Update labor charge for a job.
    
    Expected JSON:
    {
        "labor_charge": 750.00
    }
    """
    try:
        # Check if job exists
        if not job_ctrl.job_exists(job_id):
            return jsonify({'error': 'Job not found'}), 404
        
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        labor_charge = data.get('labor_charge')
        
        if labor_charge is None:
            return jsonify({'error': 'labor_charge is required'}), 400
        
        try:
            labor_charge = float(labor_charge)
        except ValueError:
            return jsonify({'error': 'labor_charge must be a number'}), 400
        
        if labor_charge < 0:
            return jsonify({'error': 'labor_charge cannot be negative'}), 400
        
        job = job_ctrl.update_labor_charge(job_id, labor_charge)
        
        return jsonify({
            'message': 'Labor charge updated successfully',
            'job': job
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to update labor charge: {str(e)}'}), 500
