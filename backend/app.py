from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from routes.auth import auth_bp
from routes.dashboard import dashboard_bp
from routes.employees import employees_bp
from routes.service_jobs import service_jobs_bp
from routes.inventory import inventory_bp
from routes.job_parts import job_parts_bp
from routes.billing import billing_bp
from routes.customers import customers_bp
from routes.vehicles import vehicles_bp
from routes.service_requests import service_requests_bp


def create_app(config_class=Config):
    """
    Application factory function.
    
    Args:
        config_class: Configuration class to use
        
    Returns:
        Flask application instance
    """
    app = Flask(__name__, static_folder='static', static_url_path='/static')
    app.config.from_object(config_class)
    
    # Enable CORS for frontend (React app running on Vite dev server)
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        }
    })
    
    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(employees_bp)
    app.register_blueprint(service_jobs_bp)
    app.register_blueprint(inventory_bp)
    app.register_blueprint(job_parts_bp)
    app.register_blueprint(billing_bp)
    app.register_blueprint(customers_bp)
    app.register_blueprint(vehicles_bp)
    app.register_blueprint(service_requests_bp)
    
    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({'status': 'healthy', 'message': 'Backend is running'}), 200
    
    # Root endpoint - API info
    @app.route('/', methods=['GET'])
    def api_info():
        return jsonify({
            'name': 'AutoIMS Backend API',
            'version': '2.0.0',
            'message': 'Backend API is running. Frontend is served separately.',
            'endpoints': {
                'health': '/api/health',
                'auth': {
                    'signup': 'POST /api/signup',
                    'login': 'POST /api/login',
                    'me': 'GET /api/me'
                },
                'dashboard': 'GET /api/dashboard',
                'customers': '/api/customers',
                'vehicles': '/api/vehicles',
                'service_requests': '/api/service-requests',
                'employees': '/api/employees',
                'jobs': '/api/jobs',
                'inventory': '/api/inventory',
                'job_parts': '/api/job-parts',
                'billing': '/api/billing'
            }
        }), 200
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Resource not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500
    
    return app

# Create the application instance
app = create_app()

if __name__ == '__main__':
    print("=" * 60)
    print("AutoIMS - Backend REST API Server (Raw SQL + psycopg2)")
    print("=" * 60)
    print("Starting Flask server...")
    print("API Base URL: http://localhost:5000/api")
    print("")
    print("NOTE: This is an API-only backend.")
    print("      Frontend Dashboard is served separately via Vite.")
    print("      Run frontend with: cd frontend && npm run dev")
    print("")
    print("Auth Endpoints:")
    print("  POST /api/signup  - Register a new user")
    print("  POST /api/login   - Authenticate user")
    print("  GET  /api/me      - Get current user")
    print("")
    print("Dashboard Endpoints (JWT protected):")
    print("  GET  /api/dashboard            - Dashboard stats")
    print("  GET  /api/dashboard/customers  - All customers")
    print("  GET  /api/dashboard/vehicles   - All vehicles")
    print("  GET  /api/dashboard/service-requests - Service requests")
    print("  GET  /api/dashboard/service-jobs     - Service jobs")
    print("  GET  /api/dashboard/inventory  - Inventory items")
    print("  GET  /api/dashboard/billing    - Billing records")
    print("")
    print("Employees API (JWT protected):")
    print("  GET    /api/employees      - List all employees")
    print("  GET    /api/employees/:id  - Get employee by ID")
    print("  POST   /api/employees      - Create employee")
    print("  PUT    /api/employees/:id  - Update employee")
    print("  DELETE /api/employees/:id  - Soft delete employee")
    print("")
    print("Service Jobs API (JWT protected):")
    print("  GET  /api/jobs             - List all jobs")
    print("  GET  /api/jobs/:id         - Get job details")
    print("  POST /api/jobs             - Create job")
    print("  PUT  /api/jobs/:id/assign  - Assign employee")
    print("  PUT  /api/jobs/:id/status  - Update status")
    print("  PUT  /api/jobs/:id/labor   - Update labor charge")
    print("")
    print("Inventory API (JWT protected):")
    print("  GET  /api/inventory           - List all items")
    print("  GET  /api/inventory/low-stock - Low stock items")
    print("  GET  /api/inventory/:id       - Get item")
    print("  POST /api/inventory           - Add item")
    print("  PUT  /api/inventory/:id       - Update item")
    print("  PUT  /api/inventory/:id/stock - Update stock")
    print("")
    print("Job Parts API (JWT protected):")
    print("  GET    /api/job-parts/job/:id       - Parts for job")
    print("  POST   /api/job-parts               - Add part to job")
    print("  DELETE /api/job-parts/:id           - Remove part")
    print("  GET    /api/job-parts/job/:id/total - Parts total")
    print("")
    print("Billing API (JWT protected):")
    print("  GET  /api/billing             - List all bills")
    print("  GET  /api/billing/:id         - Get bill")
    print("  GET  /api/billing/job/:id     - Bill by job ID")
    print("  POST /api/billing/generate    - Generate bill")
    print("  PUT  /api/billing/:id/pay     - Mark as paid")
    print("  PUT  /api/billing/:id         - Update bill")
    print("")
    print("Utility:")
    print("  GET  /api/health  - Health check")
    print("=" * 60)
    
    app.run(debug=True, host='0.0.0.0', port=5000)
