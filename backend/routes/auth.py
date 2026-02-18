from flask import Blueprint, request, jsonify
from db.connection import get_db_cursor, execute_returning
from werkzeug.security import generate_password_hash, check_password_hash
from utils.jwt_utils import generate_token, token_required

# Create authentication blueprint
auth_bp = Blueprint('auth', __name__, url_prefix='/api')

SCHEMA = 'vehicle_service'


def get_employee_by_email(email):
    """Find an employee by email address."""
    with get_db_cursor() as cur:
        cur.execute(f"""
            SELECT id, name, username, email, password_hash, position, working_status, created_at
            FROM {SCHEMA}.employees
            WHERE LOWER(email) = LOWER(%s)
        """, (email.strip(),))
        return cur.fetchone()


def get_employee_by_username(username):
    """Find an employee by username."""
    with get_db_cursor() as cur:
        cur.execute(f"""
            SELECT id, name, username, email, password_hash, position, working_status, created_at
            FROM {SCHEMA}.employees
            WHERE LOWER(username) = LOWER(%s)
        """, (username.strip(),))
        return cur.fetchone()


def get_employee_by_id(employee_id):
    """Find an employee by ID."""
    with get_db_cursor() as cur:
        cur.execute(f"""
            SELECT id, name, username, email, position, working_status, created_at
            FROM {SCHEMA}.employees
            WHERE id = %s
        """, (employee_id,))
        return cur.fetchone()


def employee_to_dict(emp):
    """Convert employee row to safe dict (no password_hash)."""
    if not emp:
        return None
    return {
        'id': emp['id'],
        'name': emp['name'],
        'username': emp.get('username'),
        'email': emp.get('email'),
        'position': emp.get('position'),
        'working_status': emp.get('working_status'),
    }


@auth_bp.route('/signup', methods=['POST'])
def signup():
    """
    Register a new employee account.
    
    Expected JSON payload:
        {
            "name": "Employee Name",
            "username": "emp_user",
            "email": "emp@example.com",
            "password": "securepassword",
            "position": "Mechanic"
        }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        name = data.get('name')
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        position = data.get('position', 'Staff')
        
        if not name or not name.strip():
            return jsonify({'error': 'Name is required'}), 400
        
        if not username or not username.strip():
            return jsonify({'error': 'Username is required'}), 400
        
        if not password or len(password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters'}), 400
        
        # Check if username already exists
        existing = get_employee_by_username(username.strip())
        if existing:
            return jsonify({'error': 'Username already taken'}), 409
        
        # Check if email already exists (if provided)
        if email and email.strip():
            existing_email = get_employee_by_email(email.strip())
            if existing_email:
                return jsonify({'error': 'Email already registered'}), 409
        
        # Create new employee with credentials
        password_hash = generate_password_hash(password)
        
        query = f"""
            INSERT INTO {SCHEMA}.employees (name, username, email, password_hash, position)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id, name, username, email, position, working_status, created_at
        """
        new_employee = execute_returning(query, (
            name.strip(),
            username.strip(),
            email.strip() if email else None,
            password_hash,
            position.strip()
        ))
        
        if not new_employee:
            return jsonify({'error': 'Failed to create employee account'}), 500
        
        # Generate JWT token using employee id
        token = generate_token(new_employee['id'])
        
        return jsonify({
            'message': 'Employee account created successfully',
            'token': token,
            'user': employee_to_dict(new_employee)
        }), 201
        
    except Exception as e:
        error_msg = str(e)
        if 'unique' in error_msg.lower():
            return jsonify({'error': 'Username or email already exists'}), 409
        return jsonify({'error': f'Registration failed: {error_msg}'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Authenticate an employee and return a JWT token.
    
    Expected JSON payload:
        {
            "username": "emp_user",
            "password": "securepassword"
        }
    OR
        {
            "email": "emp@example.com",
            "password": "securepassword"
        }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        
        if not username and not email:
            return jsonify({'error': 'Username or email is required'}), 400
        
        if not password:
            return jsonify({'error': 'Password is required'}), 400
        
        # Find employee by username or email
        employee = None
        if username:
            employee = get_employee_by_username(username.strip())
        elif email:
            employee = get_employee_by_email(email.strip())
        
        if not employee:
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Check if employee has a password set
        if not employee.get('password_hash'):
            return jsonify({'error': 'Account not set up for login. Contact admin.'}), 401
        
        # Verify password
        if not check_password_hash(employee['password_hash'], password):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Check if employee is active
        if employee.get('working_status') == 'Resigned':
            return jsonify({'error': 'Account is inactive'}), 401
        
        # Generate JWT token using employee id
        token = generate_token(employee['id'])
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': employee_to_dict(employee)
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Login failed: {str(e)}'}), 500


@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    """
    Get the currently authenticated employee's information.
    
    Requires:
        Authorization header with Bearer token
    """
    try:
        # current_user is now an employee
        return jsonify({
            'message': 'Employee retrieved successfully',
            'user': employee_to_dict(current_user) if current_user else None
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get user: {str(e)}'}), 500
