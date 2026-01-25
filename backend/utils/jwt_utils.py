import jwt
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify, current_app

def generate_token(user_id):
    """
    Generate a JWT token for the user.
    
    Args:
        user_id: The user's ID to include in the token
        
    Returns:
        str: The encoded JWT token
    """
    payload = {
        'user_id': user_id,
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
            user_id = payload['user_id']
            
            # Get the user from database
            from models.user import User
            current_user = User.query.get(user_id)
            
            if not current_user:
                return jsonify({'error': 'User not found'}), 401
                
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        except Exception as e:
            return jsonify({'error': 'Token validation failed'}), 401
        
        # Pass the current user to the route function
        return f(current_user, *args, **kwargs)
    
    return decorated
