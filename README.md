Qwipo Customer Management App

A full-stack web application for managing Customers and their Multiple Addresses, built using React.js, Node.js with Express.js, and SQLite.

This project demonstrates complete CRUD operations with proper validation, search & filtering, pagination, and navigation. It serves as an assignment for showcasing proficiency in modern full-stack development.

Tech Stack

Frontend: React.js, React Router, Axios

Backend: Node.js, Express.js, CORS

Database: SQLite3

Project Structure (as described in the README)

customer-management-app/

├── client/           # React frontend

│   ├── src/

│   │   ├── pages/     # Page components (List, Detail, Form)

│   │   ├── components/  # Reusable UI components

│   │   └── App.js     # Router setup

│   └── package.json

├── server/          # Express backend


│   ├── index.js       # Entry point

│   ├── db.js          # DB connection & migrations

│   ├── migrations/    # SQL migration scripts

│   └── database.db    # SQLite database file (auto-created)

├── .gitignore

└── other config files (package.json, tsconfig.json, next.config.mjs, etc.)

Setup Instructions

1. Clone the repository

git clone https://github.com/ibrahim9492/Qwipo_Assignment.git

cd Qwipo_Assignment

2. Backend Setup

cd server

npm install

Create a .env file inside server/ with:

Copy code

PORT=5000

DB_PATH=./database.db

Run migrations & start the server:

npm run migrate       # creates tables if not present

npm start

3. Frontend Setup

cd ../client

npm install

npm start

Database Design

customers table

Column	Type	Constraints	Description

id	INTEGER	PK AUTOINCREMENT	Unique identifier

first_name	TEXT	NOT NULL	Customer’s first name

last_name	TEXT	NOT NULL	Customer’s last name

phone_number	TEXT	NOT NULL, UNIQUE	Customer’s phone number

addresses table

Column	Type	Constraints	Description

id	INTEGER	PK AUTOINCREMENT	Unique identifier

customer_id	INTEGER	FK → customers(id)	Linked customer

address_details	TEXT	NOT NULL	Street, building, etc.

city	TEXT	NOT NULL	City name

state	TEXT	NOT NULL	State name

pin_code	TEXT	NOT NULL	Postal / ZIP code

API Endpoints (prefix /api)
Customer Routes

POST /api/customers → Create customer

GET /api/customers → Get all customers (with support for search, sorting, pagination)

GET /api/customers/:id → Get customer by ID

PUT /api/customers/:id → Update customer

DELETE /api/customers/:id → Delete customer

Address Routes

POST /api/customers/:id/addresses → Add a new address for a customer

GET /api/customers/:id/addresses → List all addresses of a customer

PUT /api/addresses/:addressId → Update an address

DELETE /api/addresses/:addressId → Delete an address

Frontend Features
Customer Management: Create, read, update, and delete customer records with validation on both client and server side

Address Management: Add, edit, and delete multiple addresses for each customer

Search & Filtering: Filter customers by city, state, or pin code

Pagination & Sorting: Navigate through customer list pages and sort results

Navigation: Smooth routing with React Router

Responsive Design: Works well on different devices, with media queries

UX Enhancements: Mark customers with “Only One Address”, reset filters/search, and provide confirmation messages

Error Handling: Includes error handling and logging mechanisms

Test Cases: Scenarios provided for correctness

