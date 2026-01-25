from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from db import db, init_db
from routes.auth import auth_bp
from routes.dashboard import dashboard_bp


def create_app(config_class=Config):
    """
    Application factory function.
    
    Args:
        config_class: Configuration class to use
        
    Returns:
        Flask application instance
    """
    app = Flask(__name__)
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
    
    # Initialize database
    init_db(app)
    
    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(dashboard_bp)
    
    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({'status': 'healthy', 'message': 'Backend is running'}), 200
    
    # Root endpoint - API info
    @app.route('/', methods=['GET'])
    def api_info():
        return jsonify({
            'name': 'AutoIMS Backend API',
            'version': '1.0.0',
            'message': 'Backend API is running. Frontend is served separately.',
            'endpoints': {
                'health': '/api/health',
                'auth': {
                    'signup': 'POST /api/signup',
                    'login': 'POST /api/login',
                    'me': 'GET /api/me'
                },
                'dashboard': 'GET /api/dashboard'
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
    print("AutoIMS - Backend REST API Server")
    print("=" * 60)
    print("Starting Flask server...")
    print("API Base URL: http://localhost:5000/api")
    print("")
    print("NOTE: This is an API-only backend.")
    print("      Frontend Dashboard is served separately via Vite.")
    print("      Run frontend with: cd frontend && npm run dev")
    print("")
    print("Auth Endpoints:")
    print("  POST /api/signup  - Register a new user (returns JWT token)")
    print("  POST /api/login   - Authenticate user (returns JWT token)")
    print("  GET  /api/me      - Get current user (requires token)")
    print("")
    print("Dashboard Data Endpoints (JWT protected):")
    print("  GET  /api/dashboard            - Dashboard stats")
    print("  GET  /api/dashboard/customers  - All customers")
    print("  GET  /api/dashboard/vehicles   - All vehicles")
    print("  GET  /api/dashboard/service-requests - Service requests")
    print("  GET  /api/dashboard/service-jobs     - Service jobs")
    print("  GET  /api/dashboard/inventory  - Inventory items")
    print("  GET  /api/dashboard/billing    - Billing records")
    print("")
    print("Utility:")
    print("  GET  /api/health  - Health check")
    print("=" * 60)
    
    app.run(debug=True, host='0.0.0.0', port=5000)
