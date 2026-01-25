# AutoIMS Backend API

Flask-based REST API for the Vehicle and Service Center Management System.

## Features

- JWT-based authentication
- User registration and login
- Password hashing with Werkzeug
- PostgreSQL database with SQLAlchemy ORM
- CORS enabled for frontend integration

## Prerequisites

- Python 3.8 or higher
- PostgreSQL database
- pip (Python package manager)

## Installation

### 1. Navigate to the backend directory

```bash
cd backend
```

### 2. Create a virtual environment (recommended)

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/macOS
python3 -m venv venv
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure the database

1. Create a PostgreSQL database:

   ```sql
   CREATE DATABASE vehicle_service_db;
   ```

2. Run the schema file to create tables:

   ```bash
   psql -U postgres -d vehicle_service_db -f ../database/schema.sql
   ```

3. Copy the environment file and update credentials:

   ```bash
   cp .env.example .env
   ```

4. Edit `.env` with your database credentials:
   ```
   DATABASE_URL=postgresql://postgres:your_password@localhost:5432/vehicle_service_db
   JWT_SECRET_KEY=your-secure-random-key
   SECRET_KEY=your-flask-secret-key
   ```

### 5. Run the backend server

```bash
python app.py
```

The server will start at `http://localhost:5000`

## API Endpoints

### Authentication Endpoints

#### POST /api/signup

Register a new user.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Success Response (201):**

```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2026-01-23T10:30:00"
  }
}
```

**Error Response (409):**

```json
{
  "error": "Email already registered"
}
```

---

#### POST /api/login

Authenticate a user and get a JWT token.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Success Response (200):**

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2026-01-23T10:30:00"
  }
}
```

**Error Response (401):**

```json
{
  "error": "Invalid email or password"
}
```

---

#### GET /api/me

Get the currently authenticated user's information.

**Headers:**

```
Authorization: Bearer <your_jwt_token>
```

**Success Response (200):**

```json
{
  "message": "User retrieved successfully",
  "user": {
    "user_id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2026-01-23T10:30:00"
  }
}
```

**Error Response (401):**

```json
{
  "error": "Authentication token is missing"
}
```

---

#### GET /api/health

Health check endpoint.

**Success Response (200):**

```json
{
  "status": "healthy",
  "message": "Backend is running"
}
```

## Frontend Integration Guide

### Storing the Token

After successful login or signup, store the JWT token in localStorage:

```javascript
// After login/signup response
const response = await fetch("http://localhost:5000/api/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ email, password }),
});

const data = await response.json();

if (response.ok) {
  // Store token and user info
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));

  // Redirect to dashboard
  window.location.href = "/dashboard";
}
```

### Making Authenticated Requests

Include the `Authorization` header with the Bearer token for protected routes:

```javascript
const token = localStorage.getItem("token");

const response = await fetch("http://localhost:5000/api/me", {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
});

const data = await response.json();

if (response.ok) {
  console.log("Current user:", data.user);
} else if (response.status === 401) {
  // Token expired or invalid - redirect to login
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
}
```

### Logout

To logout, simply remove the token from localStorage:

```javascript
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
}
```

## Token Details

- **Algorithm:** HS256
- **Expiration:** 12 hours from creation
- **Payload includes:** user_id, iat (issued at), exp (expiration)

## Error Handling

All error responses follow this format:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:

- `200` - Success
- `201` - Created (signup success)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid credentials or token)
- `409` - Conflict (email already exists)
- `500` - Internal Server Error

## Development

To run in development mode with auto-reload:

```bash
export FLASK_ENV=development  # Linux/macOS
set FLASK_ENV=development     # Windows CMD
$env:FLASK_ENV="development"  # Windows PowerShell

python app.py
```

## Security Notes

1. Always use HTTPS in production
2. Change the default JWT_SECRET_KEY and SECRET_KEY
3. Store sensitive credentials in environment variables
4. Never commit `.env` files to version control
