import os
from datetime import timedelta

# Read database password from file
def get_db_password():
    password_file = os.path.join(os.path.dirname(__file__), 'db_password.txt')
    try:
        with open(password_file, 'r') as f:
            return f.read().strip()
    except FileNotFoundError:
        return 'postgres'  # Default fallback

class Config:
    """Application configuration class."""
    
    # Database configuration
    # Using psycopg3 driver (postgresql+psycopg)
    DB_PASSWORD = get_db_password()
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        f'postgresql+psycopg://postgres:{DB_PASSWORD}@localhost:5432/vehicle_service_db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT configuration
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'your-super-secret-jwt-key-change-in-production'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=12)
    
    # Application secret key
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-secret-key-change-in-production'
