# AutoIMS - Vehicle Inventory Management System

AutoIMS is a comprehensive web-based application designed for managing vehicle service operations. It provides an integrated system for handling customer information, vehicle details, service requests, inventory management, job tracking, and billing.

## Features

- **Customer Management**: Store and manage customer details including contact information and service history
- **Vehicle Tracking**: Maintain detailed records of customer vehicles with specifications
- **Service Requests**: Create and track service requests with priority levels and status updates
- **Job Management**: Monitor service jobs with labor charges and completion tracking
- **Inventory Control**: Manage parts inventory with automatic reorder alerts and stock levels
- **Billing System**: Generate invoices with labor and parts costs, including tax calculations
- **User Authentication**: Secure login and signup functionality
- **Responsive UI**: Modern, mobile-friendly interface built with React

## Tech Stack

### Frontend
- **React** - UI framework
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing

### Backend (Planned)
- **Python** - Programming language
- **Flask** - Web framework
- **psycopg2** - PostgreSQL adapter

### Database
- **PostgreSQL** - Relational database
- **Schema**: Vehicle service management with customers, vehicles, services, inventory, and billing

## Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Python** (v3.8 or higher) - for backend
- **PostgreSQL** - database server
- **Git** - version control

## Installation

### Frontend Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd AutoIMS-main
   ```

2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

### Database Setup

1. Install PostgreSQL on your system
2. Create a new database named `autoims`
3. Run the schema file to set up tables:
   ```bash
   psql -d autoims -f database/schema.sql
   ```

### Backend Setup (Coming Soon)

The backend implementation with Python, Flask, and psycopg2 is currently in development. It will provide RESTful APIs for the frontend to interact with the database.

## Usage

1. **Access the Application**: Open your browser and navigate to the development server URL
2. **Sign Up/Login**: Create an account or log in with existing credentials
3. **Dashboard**: View overview of service requests, inventory status, and recent activities
4. **Manage Customers**: Add, view, and update customer information
5. **Vehicle Management**: Register and track customer vehicles
6. **Service Operations**: Create service requests, assign jobs, and track progress
7. **Inventory**: Monitor parts stock and manage reorder levels
8. **Billing**: Generate and manage invoices for completed services

## Project Structure

```
AutoIMS-main/
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── App.jsx        # Main application component
│   │   └── main.jsx       # Application entry point
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
├── database/              # Database schema and migrations
│   └── schema.sql         # PostgreSQL database schema
├── backend/               # Python Flask backend (planned)
└── README.md              # Project documentation
```

## API Endpoints (Planned)

The backend will expose the following RESTful API endpoints:

- `GET/POST /api/customers` - Customer management
- `GET/POST /api/vehicles` - Vehicle management
- `GET/POST /api/service-requests` - Service request handling
- `GET/POST /api/inventory` - Parts inventory management
- `GET/POST /api/billing` - Invoice generation and management



