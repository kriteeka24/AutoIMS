"""
Inventory controller - Raw SQL operations for inventory management.
"""
from db.connection import get_db_cursor, execute_returning
from datetime import datetime
from decimal import Decimal

SCHEMA = 'vehicle_service'


def _serialize_item(row):
    """Convert inventory row to JSON-serializable dict."""
    if row is None:
        return None
    item = dict(row) if not isinstance(row, dict) else row
    # Convert Decimal to float for JSON serialization
    if 'unit_price' in item and isinstance(item['unit_price'], Decimal):
        item['unit_price'] = float(item['unit_price'])
    # Convert datetime to ISO string
    if 'last_updated' in item and isinstance(item['last_updated'], datetime):
        item['last_updated'] = item['last_updated'].isoformat()
    return item


def get_all_items():
    """Get all inventory items."""
    with get_db_cursor() as cur:
        cur.execute(f"SELECT * FROM {SCHEMA}.inventory ORDER BY part_name")
        return [_serialize_item(row) for row in cur.fetchall()]


def get_item_by_id(part_id):
    """Get a single inventory item by ID."""
    with get_db_cursor() as cur:
        cur.execute(f"SELECT * FROM {SCHEMA}.inventory WHERE part_id = %s", (part_id,))
        row = cur.fetchone()
        return _serialize_item(row) if row else None


def get_low_stock_items():
    """Get items where quantity is at or below reorder level."""
    with get_db_cursor() as cur:
        cur.execute(f"""
            SELECT * FROM {SCHEMA}.inventory 
            WHERE quantity_in_stock <= reorder_level
            ORDER BY (quantity_in_stock - reorder_level) ASC
        """)
        return [_serialize_item(row) for row in cur.fetchall()]


def add_item(part_name, part_code, unit_price, reorder_level, brand=None, quantity_in_stock=0, quantity_label='pcs', description=None, image_url=None):
    """Add a new inventory item."""
    query = f"""
        INSERT INTO {SCHEMA}.inventory 
            (part_name, part_code, brand, unit_price, quantity_in_stock, quantity_label, reorder_level, description, image_url, last_updated)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING *
    """
    result = execute_returning(query, (
        part_name, part_code, brand, unit_price, quantity_in_stock, quantity_label, reorder_level, description, image_url, datetime.now()
    ))
    return _serialize_item(result) if result else None


def update_stock(part_id, quantity_change):
    """
    Update stock quantity by adding/subtracting.
    Use positive values to add stock, negative to subtract.
    """
    query = f"""
        UPDATE {SCHEMA}.inventory
        SET quantity_in_stock = quantity_in_stock + %s, last_updated = %s
        WHERE part_id = %s
        RETURNING *
    """
    result = execute_returning(query, (quantity_change, datetime.now(), part_id))
    return _serialize_item(result) if result else None


def set_stock(part_id, new_quantity):
    """Set stock to a specific quantity."""
    query = f"""
        UPDATE {SCHEMA}.inventory
        SET quantity_in_stock = %s, last_updated = %s
        WHERE part_id = %s
        RETURNING *
    """
    result = execute_returning(query, (new_quantity, datetime.now(), part_id))
    return _serialize_item(result) if result else None


def update_item(part_id, part_name=None, part_code=None, brand=None, unit_price=None, 
                quantity_in_stock=None, quantity_label=None, reorder_level=None, description=None, image_url=None):
    """Update an inventory item."""
    updates = []
    params = []
    
    if part_name is not None:
        updates.append("part_name = %s")
        params.append(part_name)
    if part_code is not None:
        updates.append("part_code = %s")
        params.append(part_code)
    if brand is not None:
        updates.append("brand = %s")
        params.append(brand)
    if unit_price is not None:
        updates.append("unit_price = %s")
        params.append(unit_price)
    if quantity_in_stock is not None:
        updates.append("quantity_in_stock = %s")
        params.append(quantity_in_stock)
    if quantity_label is not None:
        updates.append("quantity_label = %s")
        params.append(quantity_label)
    if reorder_level is not None:
        updates.append("reorder_level = %s")
        params.append(reorder_level)
    if description is not None:
        updates.append("description = %s")
        params.append(description)
    if image_url is not None:
        updates.append("image_url = %s")
        params.append(image_url)
    
    if not updates:
        return get_item_by_id(part_id)
    
    updates.append("last_updated = %s")
    params.append(datetime.now())
    params.append(part_id)
    
    query = f"""
        UPDATE {SCHEMA}.inventory
        SET {', '.join(updates)}
        WHERE part_id = %s
        RETURNING *
    """
    
    result = execute_returning(query, tuple(params))
    return _serialize_item(result) if result else None


def part_exists(part_id):
    """Check if a part exists."""
    with get_db_cursor() as cur:
        cur.execute(f"SELECT 1 FROM {SCHEMA}.inventory WHERE part_id = %s", (part_id,))
        return cur.fetchone() is not None


def check_stock_available(part_id, quantity_needed):
    """Check if enough stock is available."""
    with get_db_cursor() as cur:
        cur.execute(f"SELECT quantity_in_stock FROM {SCHEMA}.inventory WHERE part_id = %s", (part_id,))
        row = cur.fetchone()
        if row:
            return row['quantity_in_stock'] >= quantity_needed
        return False
    

def delete_item(part_id):
    """Delete an inventory item by ID."""
    query = f"DELETE FROM {SCHEMA}.inventory WHERE part_id = %s RETURNING *"
    result = execute_returning(query, (part_id,))
    return result is not None
