
# Student Placement Management System

A web application for managing student records, company information,
and placement applications.

## Features

- Add, view, edit, and delete student records
- Store student name, email, branch, and CGPA
- Manage companies, job roles, packages, and locations
- Create placement applications for students and companies
- Track application statuses
- Store data persistently in MySQL
- REST API built with Node.js and Express

## Technologies Used

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express.js
- Database: MySQL
- Database driver: mysql2
- Testing: Postman (if used)

## Project Structure

PlacementSystem/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
└── README.md

## Setup Instructions

1. Install Node.js and MySQL Server.
2. Create the database and tables using the SQL schema.
3. Open a terminal in the backend directory.
4. Install dependencies:

   npm install

5. Configure the backend `.env` file:

   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=placement_system
   DB_PORT=3306
   PORT=3000

6. Start the backend:

   node server.js

7. Open frontend/index.html in your browser.

## API Endpoints

### Students
- GET /api/students
- POST /api/students
- PUT /api/students/:id
- DELETE /api/students/:id

### Companies
- GET /api/companies
- POST /api/companies
- PUT /api/companies/:id
- DELETE /api/companies/:id

### Applications
- GET /api/applications
- POST /api/applications
- PUT /api/applications/:id
- DELETE /api/applications/:id

## Security Notes

- Keep database credentials in `.env`.
- Never commit `.env` or other secrets to GitHub.
- Configure production environment variables before deployment.