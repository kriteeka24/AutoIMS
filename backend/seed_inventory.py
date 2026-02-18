"""
Seed script to populate the inventory table with initial data.
Run from the backend folder: python seed_inventory.py
"""
import sys
import os

# Add the backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from db.connection import get_db_connection

SEED_DATA = [
    ('Engine Cylinder', 'EC2022', 'EnginePro', 15000.00, 30, 'pcs', 10, 'High-quality engine cylinder for 2022 models', '/static/uploads/inventory/image1.png'),
    ('Brake Pads', 'BP1999', 'BrakeMaster', 3500.00, 3, 'sets', 5, 'Durable brake pads for various vehicles', '/static/uploads/inventory/image2.png'),
    ('Alloy Wheels', 'AW2020', 'WheelX', 25000.00, 20, 'wheels', 8, 'Stylish alloy wheels for luxury vehicles', '/static/uploads/inventory/image3.png'),
    ('Headlights', 'HL2021', 'LightTech', 12000.00, 40, 'pcs', 15, 'LED headlights for improved visibility', '/static/uploads/inventory/image4.png'),
    ('Tires Set', 'TS2022', 'TireCo', 5000.00, 9, 'sets', 5, 'All-weather tire set for 2022 models', '/static/uploads/inventory/image5.png'),
]


def seed_inventory():
    """Insert seed data into the inventory table."""
    print("Seeding inventory table...")
    
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            for item in SEED_DATA:
                # Check if part_code already exists
                cur.execute(
                    "SELECT part_id FROM vehicle_service.inventory WHERE part_code = %s",
                    (item[1],)
                )
                if cur.fetchone():
                    print(f"  Skipping '{item[0]}' (part_code '{item[1]}' already exists)")
                    continue
                
                cur.execute("""
                    INSERT INTO vehicle_service.inventory 
                        (part_name, part_code, brand, unit_price, quantity_in_stock, 
                         quantity_label, reorder_level, description, image_url, last_updated)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
                """, item)
                print(f"  Inserted: {item[0]} ({item[1]})")
    
    print("Inventory seeding completed!")


if __name__ == "__main__":
    seed_inventory()
