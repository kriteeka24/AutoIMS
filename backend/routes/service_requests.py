"""
Service Requests API routes.
"""
from flask import Blueprint, request, jsonify
from controllers import service_requests as sr_ctrl
from controllers import vehicles as veh_ctrl
from controllers import customers as cust_ctrl
from utils.jwt_utils import token_required

service_requests_bp = Blueprint('service_requests', __name__, url_prefix='/api/service-requests')


@service_requests_bp.route('', methods=['GET'])
@token_required
def get_all_requests(current_user):
    """
    Get all service requests with full details.
    Query params: status=<status>, search=<term>, customer_id=<id>, vehicle_id=<id>
    """
    try:
        status_filter = request.args.get('status')
        search_term = request.args.get('search')
        customer_id = request.args.get('customer_id')
        vehicle_id = request.args.get('vehicle_id')
        include_employees = request.args.get('include_employees', 'false').lower() == 'true'
        
        if status_filter:
            requests_list = sr_ctrl.get_requests_by_status(status_filter)
        elif search_term:
            requests_list = sr_ctrl.search_requests(search_term)
        elif customer_id:
            requests_list = sr_ctrl.get_requests_by_customer(int(customer_id))
        elif vehicle_id:
            requests_list = sr_ctrl.get_requests_by_vehicle(int(vehicle_id))
        elif include_employees:
            requests_list = sr_ctrl.get_all_requests_with_employees()
        else:
            requests_list = sr_ctrl.get_all_requests()
        
        return jsonify({
            'message': 'Service requests retrieved successfully',
            'requests': requests_list
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get service requests: {str(e)}'}), 500


@service_requests_bp.route('/<int:request_id>', methods=['GET'])
@token_required
def get_request(current_user, request_id):
    """Get a single service request by ID."""
    try:
        include_employees = request.args.get('include_employees', 'false').lower() == 'true'
        
        if include_employees:
            service_request = sr_ctrl.get_request_with_employees(request_id)
        else:
            service_request = sr_ctrl.get_request_by_id(request_id)
        
        if not service_request:
            return jsonify({'error': 'Service request not found'}), 404
        
        return jsonify({
            'message': 'Service request retrieved successfully',
            'request': service_request
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get service request: {str(e)}'}), 500


@service_requests_bp.route('', methods=['POST'])
@token_required
def create_request(current_user):
    """
    Create a new service request.
    
    Expected JSON:
    {
        "vehicle_id": 1,
        "service_type": "Engine Repair",
        "problem_note": "Engine making noise",  (optional)
        "priority": "High",  (optional, default: "Normal")
        "status": "Pending"  (optional, default: "Pending")
    }
    
    OR for creating with new customer and vehicle:
    {
        "customer": {
            "name": "John Doe",
            "phone": "1234567890",
            "email": "john@example.com",
            "address": "123 Main St"
        },
        "vehicle": {
            "plate_no": "ABC-1234",
            "brand": "Toyota",
            "model": "Corolla",
            "year": 2022,
            "color": "White"
        },
        "service_type": "Engine Repair",
        "problem_note": "Engine making noise",
        "priority": "High"
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        vehicle_id = data.get('vehicle_id')
        
        # Check if creating with nested customer/vehicle data
        if not vehicle_id and 'customer' in data and 'vehicle' in data:
            # Create customer first
            cust_data = data.get('customer')
            if not cust_data.get('name') or not cust_data.get('phone') or not cust_data.get('email') or not cust_data.get('address'):
                return jsonify({'error': 'Customer name, phone, email, and address are required'}), 400
            
            customer = cust_ctrl.create_customer(
                name=cust_data['name'].strip(),
                phone=cust_data['phone'].strip(),
                email=cust_data['email'].strip(),
                address=cust_data['address'].strip()
            )
            if not customer:
                return jsonify({'error': 'Failed to create customer'}), 500
            
            # Create vehicle
            veh_data = data.get('vehicle')
            if not veh_data.get('plate_no') or not veh_data.get('brand') or not veh_data.get('model') or not veh_data.get('year') or not veh_data.get('color'):
                return jsonify({'error': 'Vehicle plate_no, brand, model, year, and color are required'}), 400
            
            vehicle = veh_ctrl.create_vehicle(
                plate_no=veh_data['plate_no'].strip(),
                brand=veh_data['brand'].strip(),
                model=veh_data['model'].strip(),
                year=int(veh_data['year']),
                color=veh_data['color'].strip(),
                customer_id=customer['customer_id']
            )
            if not vehicle:
                return jsonify({'error': 'Failed to create vehicle'}), 500
            
            vehicle_id = vehicle['vehicle_id']
        
        if not vehicle_id:
            return jsonify({'error': 'vehicle_id is required'}), 400
        
        # Validate vehicle exists
        if not veh_ctrl.vehicle_exists(vehicle_id):
            return jsonify({'error': 'Vehicle not found'}), 404
        
        service_type = data.get('service_type')
        if not service_type or not service_type.strip():
            return jsonify({'error': 'service_type is required'}), 400
        
        # Get assigned employee ID (optional but recommended)
        assigned_employee_id = data.get('assigned_employee_id')
        if assigned_employee_id:
            assigned_employee_id = int(assigned_employee_id)
        
        service_request = sr_ctrl.create_request(
            vehicle_id=vehicle_id,
            service_type=service_type.strip(),
            problem_note=data.get('problem_note'),
            priority=data.get('priority', 'Normal'),
            status=data.get('status', 'Pending'),
            assigned_employee_id=assigned_employee_id
        )
        
        if not service_request:
            return jsonify({'error': 'Failed to create service request'}), 500
        
        # Return full request details
        full_request = sr_ctrl.get_request_by_id(service_request['request_id'])
        
        return jsonify({
            'message': 'Service request created successfully',
            'request': full_request
        }), 201
        
    except Exception as e:
        error_msg = str(e)
        if 'unique' in error_msg.lower():
            return jsonify({'error': 'Phone, email, or plate number already exists'}), 409
        return jsonify({'error': f'Failed to create service request: {error_msg}'}), 500


@service_requests_bp.route('/<int:request_id>', methods=['PUT'])
@token_required
def update_request(current_user, request_id):
    """
    Update a service request.
    If status is changed to 'Completed', triggers auto-billing.
    
    Expected JSON (all fields optional):
    {
        "service_type": "Brake Repair",
        "problem_note": "Brakes squeaking",
        "priority": "Normal",
        "status": "Completed",
        "vehicle_id": 2,
        "labor_charge": 500.00  // used when status is Completed
    }
    """
    try:
        if not sr_ctrl.request_exists(request_id):
            return jsonify({'error': 'Service request not found'}), 404
        
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate vehicle if provided
        vehicle_id = data.get('vehicle_id')
        if vehicle_id and not veh_ctrl.vehicle_exists(vehicle_id):
            return jsonify({'error': 'Vehicle not found'}), 404
        
        # Get the old status to detect if status is changing to Completed
        old_request = sr_ctrl.get_request_by_id(request_id)
        old_status = old_request.get('status') if old_request else None
        new_status = data.get('status')
        
        service_request = sr_ctrl.update_request(
            request_id=request_id,
            service_type=data.get('service_type'),
            problem_note=data.get('problem_note'),
            priority=data.get('priority'),
            status=new_status,
            vehicle_id=vehicle_id
        )
        
        # TRIGGER 3: If status changed to Completed, trigger auto-billing
        bill = None
        job = None
        if new_status == 'Completed' and old_status != 'Completed':
            from controllers import service_jobs as job_ctrl
            from controllers import billing as billing_ctrl
            from datetime import datetime
            
            labor_charge = data.get('labor_charge', 0.00)
            try:
                labor_charge = float(labor_charge)
            except (ValueError, TypeError):
                labor_charge = 0.00
            
            # Find the job for this request
            job = sr_ctrl.get_job_for_request(request_id)
            
            if job:
                job_id = job['job_id']
                
                # Update labor_charge on the job
                job_ctrl.update_labor_charge(job_id, labor_charge)
                
                # Update job status to Completed with end_time
                job_ctrl.update_job_status(job_id, 'Completed', datetime.now())
                
                # Generate the bill automatically
                bill_result, bill_error = billing_ctrl.generate_bill(job_id)
                if bill_result:
                    bill = billing_ctrl.get_bill_by_id(bill_result['bill_id'])
        
        # Return full request details
        full_request = sr_ctrl.get_request_by_id(request_id)
        
        response = {
            'message': 'Service request updated successfully',
            'request': full_request
        }
        
        if job:
            response['job'] = job
        
        if bill:
            response['bill'] = bill
            response['message'] = 'Service request completed and bill generated successfully'
        
        return jsonify(response), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to update service request: {str(e)}'}), 500


@service_requests_bp.route('/<int:request_id>/status', methods=['PUT'])
@token_required
def update_request_status(current_user, request_id):
    """
    TRIGGER 3: Update service request status.
    When status is 'Completed', automatically completes the job and generates a bill.
    
    Expected JSON:
    {
        "status": "Completed",
        "labor_charge": 500.00  // optional, defaults to 0.00
    }
    """
    try:
        if not sr_ctrl.request_exists(request_id):
            return jsonify({'error': 'Service request not found'}), 404
        
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        status = data.get('status')
        labor_charge = data.get('labor_charge', 0.00)  # Default to 0.00
        
        if not status:
            return jsonify({'error': 'Status is required'}), 400
        
        valid_statuses = ['Pending', 'In Progress', 'Completed', 'Cancelled']
        if status not in valid_statuses:
            return jsonify({'error': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'}), 400
        
        # Validate labor_charge
        try:
            labor_charge = float(labor_charge)
        except (ValueError, TypeError):
            labor_charge = 0.00
        
        # Update the service request status
        service_request = sr_ctrl.update_request_status(request_id, status)
        
        # TRIGGER 3: If status is Completed, complete job and generate bill
        bill = None
        job = None
        if status == 'Completed':
            from controllers import service_jobs as job_ctrl
            from controllers import billing as billing_ctrl
            from datetime import datetime
            
            # Find the job for this request
            job = sr_ctrl.get_job_for_request(request_id)
            
            if job:
                job_id = job['job_id']
                
                # TRIGGER 3 STEP 1: Update labor_charge on the job
                job_ctrl.update_labor_charge(job_id, labor_charge)
                
                # TRIGGER 3 STEP 2: Update job status to Completed with end_time
                updated_job = job_ctrl.update_job_status(job_id, 'Completed', datetime.now())
                
                # TRIGGER 3 STEP 3: Generate the bill automatically
                # This calculates: subtotal_parts = SUM(quantity_used * unit_price_at_time)
                # tax = 18% of (labor + parts)
                bill_result, bill_error = billing_ctrl.generate_bill(job_id)
                if bill_result:
                    bill = bill_result
                    # Fetch full bill details for response
                    bill = billing_ctrl.get_bill_by_id(bill['bill_id'])
        
        response = {
            'message': 'Status updated successfully',
            'request': service_request
        }
        
        if job:
            response['job'] = job
        
        if bill:
            response['bill'] = bill
            response['message'] = 'Status updated and bill generated successfully'
        
        return jsonify(response), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to update status: {str(e)}'}), 500


@service_requests_bp.route('/<int:request_id>', methods=['DELETE'])
@token_required
def delete_request(current_user, request_id):
    """Delete a service request."""
    try:
        if not sr_ctrl.request_exists(request_id):
            return jsonify({'error': 'Service request not found'}), 404
        
        deleted = sr_ctrl.delete_request(request_id)
        
        if not deleted:
            return jsonify({'error': 'Failed to delete service request'}), 500
        
        return jsonify({
            'message': 'Service request deleted successfully'
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 409
    except Exception as e:
        return jsonify({'error': f'Failed to delete service request: {str(e)}'}), 500
