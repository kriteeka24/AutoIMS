from flask import Blueprint, request, jsonify
from db import db
from models.user import User
from utils.jwt_utils import generate_token, token_required

# Create authentication blueprint
auth_bp = Blueprint('auth', __name__, url_prefix='/api')

@auth_bp.route('/signup', methods=['POST'])
def signup():
    """
    Register a new user.
    
    Expected JSON payload:
        {
            "name": "User Name",
            "username": "johndoe",
            "email": "user@example.com",
            "password": "securepassword"
        }
    
    Returns:
        JSON with message, token, and user info on success
        JSON with error message on failure
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        name = data.get('name')
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        
        if not name or not name.strip():
            return jsonify({'error': 'Name is required'}), 400
        
        if not email or not email.strip():
            return jsonify({'error': 'Email is required'}), 400
        
        if not password or len(password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters'}), 400
        
        # Check if user already exists by email
        existing_user = User.query.filter_by(email=email.lower().strip()).first()
        if existing_user:
            return jsonify({'error': 'Email already registered'}), 409
        
        # Check if username already exists (if provided)
        if username and username.strip():
            existing_username = User.query.filter_by(username=username.strip()).first()
            if existing_username:
                return jsonify({'error': 'Username already taken'}), 409
        
        # Create new user
        new_user = User(
            name=name.strip(),
            email=email.lower().strip(),
            password=password,
            username=username.strip() if username else None
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        # Generate JWT token
        token = generate_token(new_user.user_id)
        
        return jsonify({
            'message': 'User registered successfully',
            'token': token,
            'user': new_user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Authenticate a user and return a JWT token.
    
    Expected JSON payload:
        {
            "email": "user@example.com",
            "password": "securepassword"
        }
    
    Returns:
        JSON with message, token, and user info on success
        JSON with error message on failure
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        email = data.get('email')
        password = data.get('password')
        
        if not email or not email.strip():
            return jsonify({'error': 'Email is required'}), 400
        
        if not password:
            return jsonify({'error': 'Password is required'}), 400
        
        # Find user by email
        user = User.query.filter_by(email=email.lower().strip()).first()
        
        if not user:
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Verify password
        if not user.check_password(password):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Generate JWT token
        token = generate_token(user.user_id)
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Login failed: {str(e)}'}), 500

@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    """
    Get the currently authenticated user's information.
    
    Requires:
        Authorization header with Bearer token
    
    Returns:
        JSON with user info on success
        JSON with error message on failure
    """
    try:
        return jsonify({
            'message': 'User retrieved successfully',
            'user': current_user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get user: {str(e)}'}), 500
