import jwt
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify, current_app

def generate_token(employee_id):
    """
    Generate a JWT token for the employee.
    
    Args:
        employee_id: The employee's ID to include in the token
        
    Returns:
        str: The encoded JWT token
    """
    payload = {
        'employee_id': employee_id,
        'exp': datetime.utcnow() + current_app.config['JWT_ACCESS_TOKEN_EXPIRES'],
        'iat': datetime.utcnow()
    }
    
    token = jwt.encode(
        payload,
        current_app.config['JWT_SECRET_KEY'],
        algorithm='HS256'
    )
    
    return token

def decode_token(token):
    """
    Decode and validate a JWT token.
    
    Args:
        token: The JWT token to decode
        
    Returns:
        dict: The decoded payload if valid
        
    Raises:
        jwt.ExpiredSignatureError: If the token has expired
        jwt.InvalidTokenError: If the token is invalid
    """
    payload = jwt.decode(
        token,
        current_app.config['JWT_SECRET_KEY'],
        algorithms=['HS256']
    )
    
    return payload

def token_required(f):
    """
    Decorator to protect routes that require authentication.
    
    Usage:
        @app.route('/protected')
        @token_required
        def protected_route(current_user):
            return jsonify({'message': 'Protected data'})
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Check for Authorization header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            
            # Expected format: "Bearer <token>"
            parts = auth_header.split()
            
            if len(parts) == 2 and parts[0].lower() == 'bearer':
                token = parts[1]
        
        if not token:
            return jsonify({'error': 'Authentication token is missing'}), 401
        
        try:
            # Decode the token
            payload = decode_token(token)
            # Support both old user_id tokens and new employee_id tokens
            employee_id = payload.get('employee_id') or payload.get('user_id')
            
            # Get the employee from database
            from db.connection import get_db_cursor
            with get_db_cursor() as cur:
                cur.execute("""
                    SELECT id, name, username, email, position, working_status, created_at
                    FROM vehicle_service.employees
                    WHERE id = %s
                """, (employee_id,))
                current_user = cur.fetchone()
            
            if not current_user:
                return jsonify({'error': 'Employee not found'}), 401
                
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        except Exception as e:
            return jsonify({'error': 'Token validation failed'}), 401
        
        # Pass the current employee to the route function
        return f(current_user, *args, **kwargs)
    
    return decorated
