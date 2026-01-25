from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text

# Initialize SQLAlchemy instance
db = SQLAlchemy()

def init_db(app):
    """Initialize the database with the Flask app."""
    db.init_app(app)
    
    with app.app_context():
        # Ensure the vehicle_service schema exists
        db.session.execute(text("CREATE SCHEMA IF NOT EXISTS vehicle_service"))
        db.session.commit()
        
        # Import models to register them with SQLAlchemy
        from models.user import User
        
        # Create all tables
        db.create_all()
