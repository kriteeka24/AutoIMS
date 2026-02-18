"""
Inventory API routes.
"""
import os
import uuid
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from controllers import inventory as inv_ctrl
from utils.jwt_utils import token_required

inventory_bp = Blueprint('inventory', __name__, url_prefix='/api/inventory')

# Allowed image extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
UPLOAD_FOLDER = 'static/uploads/inventory'


def allowed_file(filename):
    """Check if file extension is allowed."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def save_image(file):
    """Save uploaded image and return the relative path."""
    if not file or not allowed_file(file.filename):
        return None
    
    # Ensure upload directory exists
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    
    # Generate unique filename
    ext = file.filename.rsplit('.', 1)[1].lower()
    filename = f"{uuid.uuid4().hex}.{ext}"
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)
    
    # Return relative URL path
    return f"/{UPLOAD_FOLDER}/{filename}"


@inventory_bp.route('', methods=['GET'])
@token_required
def get_all_items(current_user):
    """Get all inventory items."""
    try:
        items = inv_ctrl.get_all_items()
        
        return jsonify({
            'message': 'Inventory items retrieved successfully',
            'items': items
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get inventory: {str(e)}'}), 500


@inventory_bp.route('/low-stock', methods=['GET'])
@token_required
def get_low_stock(current_user):
    """Get items where stock is at or below reorder level."""
    try:
        items = inv_ctrl.get_low_stock_items()
        
        return jsonify({
            'message': 'Low stock items retrieved successfully',
            'items': items,
            'count': len(items)
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get low stock items: {str(e)}'}), 500


@inventory_bp.route('/<int:part_id>', methods=['GET'])
@token_required
def get_item(current_user, part_id):
    """Get a single inventory item."""
    try:
        item = inv_ctrl.get_item_by_id(part_id)
        
        if not item:
            return jsonify({'error': 'Item not found'}), 404
        
        return jsonify({
            'message': 'Item retrieved successfully',
            'item': item
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get item: {str(e)}'}), 500


@inventory_bp.route('', methods=['POST'])
@token_required
def add_item(current_user):
    """
    Add a new inventory item.
    
    Supports both JSON and multipart/form-data (for image uploads).
    
    Expected fields:
    {
        "part_name": "Brake Pad",
        "part_code": "BP-001",
        "unit_price": 250.00,
        "reorder_level": 10,
        "brand": "Bosch",  (optional)
        "quantity_in_stock": 50,  (optional, default 0)
        "quantity_label": "pcs",  (optional, default 'pcs')
        "description": "Front brake pad",  (optional)
        "image": <file>  (optional, for multipart/form-data)
    }
    """
    try:
        # Check if it's multipart/form-data (file upload) or JSON
        if request.content_type and 'multipart/form-data' in request.content_type:
            data = request.form.to_dict()
            image_file = request.files.get('image')
        else:
            data = request.get_json()
            image_file = None
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Required fields
        part_name = data.get('part_name')
        part_code = data.get('part_code')
        unit_price = data.get('unit_price')
        reorder_level = data.get('reorder_level', 10)  # Default to 10 if not provided
        
        if not part_name or not str(part_name).strip():
            return jsonify({'error': 'part_name is required'}), 400
        
        if not part_code or not str(part_code).strip():
            return jsonify({'error': 'part_code is required'}), 400
        
        if unit_price is None:
            return jsonify({'error': 'unit_price is required'}), 400
        
        try:
            unit_price = float(unit_price)
            reorder_level = int(reorder_level)
        except ValueError:
            return jsonify({'error': 'Invalid numeric values'}), 400
        
        # Handle image upload
        image_url = None
        if image_file:
            image_url = save_image(image_file)
        
        item = inv_ctrl.add_item(
            part_name=str(part_name).strip(),
            part_code=str(part_code).strip(),
            unit_price=unit_price,
            reorder_level=reorder_level,
            brand=data.get('brand'),
            quantity_in_stock=data.get('quantity_in_stock', 0),
            quantity_label=data.get('quantity_label', 'pcs'),
            description=data.get('description'),
            image_url=image_url
        )
        
        if not item:
            return jsonify({'error': 'Failed to add item'}), 500
        
        return jsonify({
            'message': 'Item added successfully',
            'item': item
        }), 201
        
    except Exception as e:
        error_msg = str(e)
        if 'unique' in error_msg.lower():
            return jsonify({'error': 'Part code already exists'}), 409
        return jsonify({'error': f'Failed to add item: {error_msg}'}), 500


@inventory_bp.route('/<int:part_id>', methods=['PUT'])
@token_required
def update_item(current_user, part_id):
    """
    Update an inventory item.
    
    Expected JSON (all fields optional):
    {
        "part_name": "Updated Name",
        "part_code": "BP-002",
        "brand": "NGK",
        "unit_price": 300.00,
        "quantity_in_stock": 75,
        "reorder_level": 15,
        "description": "Updated description"
    }
    """
    try:
        if not inv_ctrl.part_exists(part_id):
            return jsonify({'error': 'Item not found'}), 404
        
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        item = inv_ctrl.update_item(
            part_id=part_id,
            part_name=data.get('part_name'),
            part_code=data.get('part_code'),
            brand=data.get('brand'),
            unit_price=data.get('unit_price'),
            quantity_in_stock=data.get('quantity_in_stock'),
            quantity_label=data.get('quantity_label'),
            reorder_level=data.get('reorder_level'),
            description=data.get('description')
        )
        
        return jsonify({
            'message': 'Item updated successfully',
            'item': item
        }), 200
        
    except Exception as e:
        error_msg = str(e)
        if 'unique' in error_msg.lower():
            return jsonify({'error': 'Part code already exists'}), 409
        return jsonify({'error': f'Failed to update item: {error_msg}'}), 500


@inventory_bp.route('/<int:part_id>/stock', methods=['PUT'])
@token_required
def update_stock(current_user, part_id):
    """
    Update stock quantity.
    
    Expected JSON:
    {
        "quantity_change": 10  (positive to add, negative to subtract)
    }
    OR:
    {
        "quantity": 50  (set to specific value)
    }
    """
    try:
        if not inv_ctrl.part_exists(part_id):
            return jsonify({'error': 'Item not found'}), 404
        
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Check which mode
        if 'quantity_change' in data:
            try:
                quantity_change = int(data['quantity_change'])
            except ValueError:
                return jsonify({'error': 'quantity_change must be an integer'}), 400
            
            item = inv_ctrl.update_stock(part_id, quantity_change)
        elif 'quantity' in data:
            try:
                new_quantity = int(data['quantity'])
            except ValueError:
                return jsonify({'error': 'quantity must be an integer'}), 400
            
            if new_quantity < 0:
                return jsonify({'error': 'quantity cannot be negative'}), 400
            
            item = inv_ctrl.set_stock(part_id, new_quantity)
        else:
            return jsonify({'error': 'Either quantity_change or quantity is required'}), 400
        
        return jsonify({
            'message': 'Stock updated successfully',
            'item': item
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to update stock: {str(e)}'}), 500


@inventory_bp.route('/<int:part_id>', methods=['DELETE'])
@token_required
def delete_item(current_user, part_id):
    try:
        success = inv_ctrl.delete_item(part_id)
        if not success:
            return jsonify({'error': 'Item not found'}), 404
        return jsonify({'message': 'Item deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500