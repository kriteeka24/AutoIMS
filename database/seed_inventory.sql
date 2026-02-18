-- Seed data for vehicle_service.inventory table
-- Insert the 5 existing items from the frontend

INSERT INTO vehicle_service.inventory 
    (part_name, part_code, brand, unit_price, quantity_in_stock, quantity_label, reorder_level, description, image_url, last_updated)
VALUES
    ('Engine Cylinder', 'EC2022', 'EnginePro', 15000.00, 30, 'pcs', 10, 'High-quality engine cylinder for 2022 models', '/static/uploads/inventory/image1.png', CURRENT_TIMESTAMP),
    ('Brake Pads', 'BP1999', 'BrakeMaster', 3500.00, 3, 'sets', 5, 'Durable brake pads for various vehicles', '/static/uploads/inventory/image2.png', CURRENT_TIMESTAMP),
    ('Alloy Wheels', 'AW2020', 'WheelX', 25000.00, 20, 'wheels', 8, 'Stylish alloy wheels for luxury vehicles', '/static/uploads/inventory/image3.png', CURRENT_TIMESTAMP),
    ('Headlights', 'HL2021', 'LightTech', 12000.00, 40, 'pcs', 15, 'LED headlights for improved visibility', '/static/uploads/inventory/image4.png', CURRENT_TIMESTAMP),
    ('Tires Set', 'TS2022', 'TireCo', 5000.00, 9, 'sets', 5, 'All-weather tire set for 2022 models', '/static/uploads/inventory/image5.png', CURRENT_TIMESTAMP)
ON CONFLICT (part_code) DO NOTHING;
