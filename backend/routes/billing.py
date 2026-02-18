"""
Billing API routes.
"""
from flask import Blueprint, request, jsonify
from controllers import billing as bill_ctrl
from utils.jwt_utils import token_required

billing_bp = Blueprint('billing', __name__, url_prefix='/api/billing')


@billing_bp.route('', methods=['GET'])
@token_required
def get_all_bills(current_user):
    """Get all billing records."""
    try:
        bills = bill_ctrl.get_all_bills()
        
        return jsonify({
            'message': 'Billing records retrieved successfully',
            'bills': bills
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get bills: {str(e)}'}), 500


@billing_bp.route('/<int:bill_id>', methods=['GET'])
@token_required
def get_bill(current_user, bill_id):
    """Get a single bill by ID."""
    try:
        bill = bill_ctrl.get_bill_by_id(bill_id)
        
        if not bill:
            return jsonify({'error': 'Bill not found'}), 404
        
        return jsonify({
            'message': 'Bill retrieved successfully',
            'bill': bill
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get bill: {str(e)}'}), 500


@billing_bp.route('/job/<int:job_id>', methods=['GET'])
@token_required
def get_bill_by_job(current_user, job_id):
    """Get billing details for a specific job (includes parts breakdown)."""
    try:
        if not bill_ctrl.job_exists(job_id):
            return jsonify({'error': 'Job not found'}), 404
        
        bill = bill_ctrl.get_bill_by_job_id(job_id)
        
        if not bill:
            return jsonify({'error': 'Bill not found for this job'}), 404
        
        return jsonify({
            'message': 'Bill retrieved successfully',
            'bill': bill
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get bill: {str(e)}'}), 500


@billing_bp.route('/generate', methods=['POST'])
@token_required
def generate_bill(current_user):
    """
    Generate a bill for a job.
    Calculates: labor_charge + parts_total + tax = total_amount
    
    Expected JSON:
    {
        "job_id": 1,
        "tax_rate": 0.18  (optional, default 18%)
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        job_id = data.get('job_id')
        
        if not job_id:
            return jsonify({'error': 'job_id is required'}), 400
        
        # Validate job exists
        if not bill_ctrl.job_exists(job_id):
            return jsonify({'error': 'Job not found'}), 404
        
        tax_rate = data.get('tax_rate')
        if tax_rate is not None:
            try:
                tax_rate = float(tax_rate)
            except ValueError:
                return jsonify({'error': 'tax_rate must be a number'}), 400
        
        bill, error = bill_ctrl.generate_bill(job_id, tax_rate)
        
        if error:
            return jsonify({'error': error}), 400
        
        if not bill:
            return jsonify({'error': 'Failed to generate bill'}), 500
        
        return jsonify({
            'message': 'Bill generated successfully',
            'bill': bill
        }), 201
        
    except Exception as e:
        return jsonify({'error': f'Failed to generate bill: {str(e)}'}), 500


@billing_bp.route('/<int:bill_id>/pay', methods=['PUT'])
@token_required
def mark_as_paid(current_user, bill_id):
    """Mark a bill as paid."""
    print(f"[DEBUG] /api/billing/{bill_id}/pay called by user {current_user.get('id')}")
    try:
        if not bill_ctrl.bill_exists(bill_id):
            return jsonify({'error': 'Bill not found'}), 404
        
        bill = bill_ctrl.mark_as_paid(bill_id)
        print(f"[DEBUG] Bill marked as paid, result: {bill}")
        
        return jsonify({
            'message': 'Bill marked as paid',
            'bill': bill
        }), 200
        
    except Exception as e:
        print(f"[DEBUG] Error marking bill as paid: {str(e)}")
        return jsonify({'error': f'Failed to update bill: {str(e)}'}), 500


@billing_bp.route('/<int:bill_id>', methods=['PUT'])
@token_required
def update_bill(current_user, bill_id):
    """
    Update bill amounts.
    
    Expected JSON (all optional):
    {
        "subtotal_labor": 500.00,
        "subtotal_parts": 1200.00,
        "tax": 306.00
    }
    
    Total will be recalculated automatically.
    """
    try:
        if not bill_ctrl.bill_exists(bill_id):
            return jsonify({'error': 'Bill not found'}), 404
        
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        bill = bill_ctrl.update_bill(
            bill_id=bill_id,
            subtotal_labor=data.get('subtotal_labor'),
            subtotal_parts=data.get('subtotal_parts'),
            tax=data.get('tax')
        )
        
        return jsonify({
            'message': 'Bill updated successfully',
            'bill': bill
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to update bill: {str(e)}'}), 500
