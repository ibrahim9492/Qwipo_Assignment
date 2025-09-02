Qwipo Customer Management App

A full-stack web application for managing Customers and their Multiple Addresses, built using React.js, Node.js with Express.js, and SQLite.

This project demonstrates complete CRUD operations with proper validation, search & filtering, pagination, and navigation. It serves as an assignment for showcasing proficiency in modern full-stack development.

🚀 Tech Stack

Frontend: React.js, React Router, Axios

Backend: Node.js, Express.js, CORS

Database: SQLite3

📂 Project Structure

customer-management-app/
├── client/          # React frontend
│   ├── src/
│   │   ├── pages/        # Page components (List, Detail, Form)
│   │   ├── components/   # Reusable UI components
│   │   └── App.js        # Router setup
│   └── package.json
│
└── server/          # Express backend
    ├── index.js     # Entry point
    ├── db.js        # DB connection & migrations
    ├── migrations/  # SQL migration scripts
    ├── database.db  # SQLite database file (auto-created)
    └── package.json


⚙️ Setup Instructions

1️⃣ Clone the repository

git clone https://github.com/your-username/customer-management-app.git

cd customer-management-app

2️⃣ Backend Setup

cd server

npm install

Configure Environment Variables

Create a .env file inside server/:

PORT=5000
DB_PATH=./database.db

Run Migrations & Start Server

npm run migrate   # creates tables if not present

npm start

3️⃣ Frontend Setup

cd ../client

npm install

npm start

🗄️ Database Design

customers table

| Column        | Type    | Constraints      | Description             |
| ------------- | ------- | ---------------- | ----------------------- |
| id            | INTEGER | PK AUTOINCREMENT | Unique identifier       |
| first\_name   | TEXT    | NOT NULL         | Customer’s first name   |
| last\_name    | TEXT    | NOT NULL         | Customer’s last name    |
| phone\_number | TEXT    | NOT NULL UNIQUE  | Customer’s phone number |

addresses table

| Column           | Type    | Constraints        | Description            |
| ---------------- | ------- | ------------------ | ---------------------- |
| id               | INTEGER | PK AUTOINCREMENT   | Unique identifier      |
| customer\_id     | INTEGER | FK → customers(id) | Linked customer        |
| address\_details | TEXT    | NOT NULL           | Street, building, etc. |
| city             | TEXT    | NOT NULL           | City name              |
| state            | TEXT    | NOT NULL           | State name             |
| pin\_code        | TEXT    | NOT NULL           | Postal / ZIP code      |
 

🔗 API Endpoints

All APIs are prefixed with /api.

Customer Routes

POST /api/customers → Create customer

GET /api/customers → Get all customers (supports search, sort, pagination)

GET /api/customers/:id → Get customer by ID

PUT /api/customers/:id → Update customer

DELETE /api/customers/:id → Delete customer

Address Routes

POST /api/customers/:id/addresses → Add new address for customer

GET /api/customers/:id/addresses → Get all addresses of a customer

PUT /api/addresses/:addressId → Update an address

DELETE /api/addresses/:addressId → Delete an address

🖥️ Frontend Features

Customer Management

Create, read, update, and delete customer records

Validation on both client & server

Address Management

Manage multiple addresses per customer

Add, edit, and delete addresses

Search & Filtering

Filter customers by city, state, or pin code

Pagination & Sorting

Navigate through customer list pages

Sort results for efficient retrieval

Navigation

Smooth page routing with React Router

📱 Mobile CRUD Assignment Coverage

Create, update, delete, and read customers

Manage multiple addresses per customer

Search & filter by city/state/pin

Mark customers with “Only One Address”

Reset filters & search

Proper validation and confirmation messages

🌐 Web CRUD Assignment Coverage

Full customer dashboard with CRUD operations

Organized sections for profile, addresses, and related data

Infinite scroll / pagination with sorting

Responsive design with media queries

Error handling and logging system

Test case scenarios for correctness

📜 Scripts

Backend

npm run migrate   # Runs migrations and creates tables

npm start         # Starts Express server

Frontend

npm start         # Starts React dev server

🖼️ Demo Screenshots

👉 Replace these with your actual screenshots after running the app:

Customer List Page


Customer Detail Page


Customer Form (Add/Edit)


🎥 Demo Recording

A demo video (via Loom/OBS) will showcase:

Customer & Address CRUD

Validation

Search & Filters

Pagination & Navigation
