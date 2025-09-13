# Agri Backend

## Setup

1. Install dependencies:
   npm install

2. Make sure MySQL is running and create the database:
   - Login to MySQL:
     mysql -u root -p
   - Run:
     CREATE DATABASE agri_accounts;

3. Start the backend server:
   npm start

The backend will run on http://localhost:5000

## API

POST /api/register
- Body: { username, email, password, blockchain_account }
- Stores user registration details in MySQL.
