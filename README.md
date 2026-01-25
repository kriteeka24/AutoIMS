# AutoIMS - Vehicle Inventory Management System

AutoIMS is a comprehensive web-based application designed for managing vehicle service operations. It provides an integrated system for handling customer information, vehicle details, service requests, inventory management, job tracking, and billing.

## Features

- **Customer Management**: Store and manage customer details including contact information and service history
- **Vehicle Tracking**: Maintain detailed records of customer vehicles with specifications
- **Service Requests**: Create and track service requests with priority levels and status updates
- **Job Management**: Monitor service jobs with labor charges and completion tracking
- **Inventory Control**: Manage parts inventory with automatic reorder alerts and stock levels
- **Billing System**: Generate invoices with labor and parts costs, including tax calculations
- **User Authentication**: Secure JWT-based login and signup functionality
- **Responsive UI**: Modern, mobile-friendly interface built with React

## Tech Stack

### Frontend

- **React 19** - UI framework
- **Vite 7** - Build tool and development server
- **Tailwind CSS 4** - Utility-first CSS framework
- **React Router 7** - Client-side routing
- **Lucide React** - Icon library

### Backend

- **Python 3.8+** - Programming language
- **Flask 3.0** - Web framework
- **Flask-SQLAlchemy** - ORM integration
- **psycopg3** - PostgreSQL adapter
- **PyJWT** - JSON Web Token authentication
- **Flask-CORS** - Cross-Origin Resource Sharing

### Database

- **PostgreSQL** - Relational database
- **Schema**: Vehicle service management with customers, vehicles, services, inventory, and billing

## Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **Python** (v3.8 or higher)
- **PostgreSQL** (v13 or higher)
- **Git** - version control

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd AutoIMS
```

### 2. Database Setup

1. Install PostgreSQL on your system
2. Create a new database:
   ```bash
   psql -U postgres
   CREATE DATABASE vehicle_service_db;
   \q
   ```
3. Run the schema file to set up tables:
   ```bash
   psql -U postgres -d vehicle_service_db -f database/schema.sql
   ```

### 3. Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:

   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # Linux/macOS
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install Python dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Configure database password:
   - Edit `db_password.txt` with your PostgreSQL password
   - Or set environment variable: `DATABASE_URL`

5. Start the backend server:
   ```bash
   python app.py
   ```

The backend API will be available at `http://localhost:5000`

### 4. Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

## Usage

1. **Access the Application**: Open your browser and navigate to `http://localhost:5173`
2. **Sign Up/Login**: Create an account or log in with existing credentials
3. **Dashboard**: View overview of service requests, inventory status, and recent activities
4. **Manage Customers**: Add, view, and update customer information
5. **Vehicle Management**: Register and track customer vehicles
6. **Service Operations**: Create service requests, assign jobs, and track progress
7. **Inventory**: Monitor parts stock and manage reorder levels
8. **Billing**: Generate and manage invoices for completed services

## Project Structure

```
AutoIMS/
├── frontend/                  # React frontend application
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── Dashboard.jsx  # Main dashboard
│   │   │   ├── Login.jsx      # Login page
│   │   │   ├── Signup.jsx     # Registration page
│   │   │   ├── Navbar.jsx     # Navigation bar
│   │   │   ├── Sidebar.jsx    # Sidebar navigation
│   │   │   └── ...
│   │   ├── App.jsx            # Main application component
│   │   ├── main.jsx           # Application entry point
│   │   └── index.css          # Global styles
│   ├── public/                # Static assets
│   ├── package.json           # Frontend dependencies
│   └── vite.config.js         # Vite configuration
├── backend/                   # Python Flask backend
│   ├── app.py                 # Application entry point
│   ├── config.py              # Configuration settings
│   ├── db.py                  # Database initialization
│   ├── requirements.txt       # Python dependencies
│   ├── models/                # SQLAlchemy models
│   │   └── user.py            # User model
│   ├── routes/                # API route handlers
│   │   ├── auth.py            # Authentication routes
│   │   └── dashboard.py       # Dashboard data routes
│   └── utils/                 # Utility functions
│       └── jwt_utils.py       # JWT token utilities
├── database/                  # Database schema and migrations
│   └── schema.sql             # PostgreSQL database schema
└── README.md                  # Project documentation
```

## API Endpoints

### Authentication

| Method | Endpoint      | Description           | Auth Required |
| ------ | ------------- | --------------------- | ------------- |
| POST   | `/api/signup` | Register a new user   | No            |
| POST   | `/api/login`  | Authenticate user     | No            |
| GET    | `/api/me`     | Get current user info | Yes (JWT)     |

### Dashboard Data (JWT Protected)

| Method | Endpoint                          | Description          |
| ------ | --------------------------------- | -------------------- |
| GET    | `/api/dashboard`                  | Dashboard statistics |
| GET    | `/api/dashboard/customers`        | All customers        |
| GET    | `/api/dashboard/vehicles`         | All vehicles         |
| GET    | `/api/dashboard/service-requests` | Service requests     |
| GET    | `/api/dashboard/service-jobs`     | Service jobs         |
| GET    | `/api/dashboard/inventory`        | Inventory items      |
| GET    | `/api/dashboard/billing`          | Billing records      |

### Health Check

| Method | Endpoint      | Description       |
| ------ | ------------- | ----------------- |
| GET    | `/api/health` | API health status |

## Environment Variables

| Variable         | Description                  | Default                    |
| ---------------- | ---------------------------- | -------------------------- |
| `DATABASE_URL`   | PostgreSQL connection string | `postgresql+psycopg://...` |
| `JWT_SECRET_KEY` | Secret key for JWT tokens    | (set in config.py)         |
| `SECRET_KEY`     | Flask application secret key | (set in config.py)         |

## Development

### Running Both Servers

For development, you need to run both the frontend and backend servers:

**Terminal 1 - Backend:**

```bash
cd backend
python app.py
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

### Building for Production

**Frontend:**

```bash
cd frontend
npm run build
```

The production build will be in the `frontend/dist` directory.

## License

This project is for educational purposes.
