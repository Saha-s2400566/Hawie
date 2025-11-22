# Hawie - Beauty and Wellness Management System

A full-stack application for managing beauty and wellness appointments, staff, and services.

## Features

### User Features
- User registration and authentication (JWT)
- Browse and book services
- View and manage appointments
- Leave reviews for services
- View service details and staff profiles

### Admin Features
- Manage services (CRUD operations)
- Manage staff members
- View and manage bookings
- Generate reports and analytics
- Manage user accounts

### Staff Features
- View assigned appointments
- Update appointment status
- Manage availability
- View service details

## Prerequisites

- Node.js (v14+)
- MySQL (v8.0+)
- npm (v6+)

## Getting Started

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone [your-repo-url]
   cd hawo/backend
Install dependencies
bash
npm install
Set up environment variables Create a .env file in the backend directory with the following content:
env
# Database Configuration
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=havasa

# Server Configuration
NODE_ENV=development
PORT=5000

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
EMAIL_FROM=your_email@gmail.com
Set up the database
Create a MySQL database named havasa
Run the database schema from 
database.sql
 or let Sequelize create tables automatically
Start the backend server
bash
# Development
npm run dev

# Production
npm start
Frontend Setup
Navigate to the frontend directory
bash
cd ../frontend
Install dependencies
bash
npm install
Set up environment variables Create a .env file in the frontend directory with:
env
REACT_APP_API_URL=http://localhost:5000/api/v1
Start the frontend development server
bash
npm start
API Documentation
The API documentation is available at http://localhost:5000/api-docs when the backend server is running.

Available Scripts
Backend
npm start - Start the production server
npm run dev - Start the development server with nodemon
npm test - Run tests
Frontend
npm start - Start the development server
npm build - Build for production
npm test - Run tests
npm run eject - Eject from create-react-app

Project Structure
hawo/
├── backend/               # Backend server
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── utils/            # Utility functions
│   ├── server.js         # Main server file
│   └── package.json
│
└── frontend/             # Frontend React application
    ├── public/           # Static files
    ├── src/              # Source files
    │   ├── components/   # Reusable components
    │   ├── pages/        # Page components
    │   ├── services/     # API services
    │   ├── utils/        # Utility functions
    │   ├── App.js        # Main App component
    │   └── index.js      # Entry point
    └── package.json

    
Technologies Used
Backend
Node.js
Express.js
MySQL
Sequelize ORM
JWT Authentication
Bcrypt for password hashing
Frontend
React.js
React Router
Axios for API calls
Context API for state management
Styled Components / CSS Modules
Contributing
Fork the repository
Create a new branch (git checkout -b feature/AmazingFeature)
Commit your changes (git commit -m 'Add some AmazingFeature')
Push to the branch (git push origin feature/AmazingFeature)
Open a Pull Request
License
This project is licensed under the MIT License - see the LICENSE file for details.

Support
For support, please contact your-email@example.com or open an issue in the repository.

