"""Migration script to add username column to users table."""
import sys
sys.path.insert(0, '.')

from app import app
from db import db
from sqlalchemy import text

with app.app_context():
    try:
        # Add username column if it doesn't exist
        db.session.execute(text(
            "ALTER TABLE vehicle_service.users ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE"
        ))
        db.session.commit()
        print("✓ Username column added successfully!")
    except Exception as e:
        print(f"Error: {e}")
        db.session.rollback()
