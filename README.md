# E-Commerce - Single vendor E-commerce System

## Node.js Express App with PostgreSQL

A comprehensive full-stack single vendor e-commerce system built with Express.js, Sequelize ORM, and MySQL. This system supports multiple business types including visa agencies, travel agencies, IT firms, educational institutions, and more.

## 🚀 Features

### Core Features

- **Role-Based Access Control**: Hierarchical permission system with score-based access
- **JWT Authentication**: Secure authentication with refresh tokens
- **RESTful API**: Well-documented API with Swagger/OpenAPI
- **Database Migrations**: Sequelize-based database versioning
- **Audit Logging**: Complete audit trail for all user actions

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL/Postgres with Sequelize ORM
- **Authentication**: JWT with bcryptjs
- **Documentation**: Swagger/OpenAPI
- **File Upload**: Express file upload
- **Validation**: Joi
- **Rate Limiting**: Express Rate Limit
- **Security**: Helmet, CORS
- **Containerization**: Docker & Docker Compose

## 📁 Project Structure

\`\`\`
src/
├── assets/ # Static files & uploads
├── middleware/ # Authentication, error handling, rate limiting
├── admin/ # Admin-specific modules
│ ├── controllers/
│ ├── routes/
│ └── services/
├── user/ # User-specific modules
├── config/ # Database and app configuration
├── utils/ # Utility functions and helpers
├── models/ # Sequelize models with associations
├── migrations/ # Database migration files
├── seeders/ # Database seed files
├── scripts/ # CLI utilities and seed scripts
├── routes/ # API route definitions
├── webhooks/ # Webhook handlers
└── server.js # Application entry point
\`\`\`

## Getting Started

### Prerequisites

Ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (v22.8.0 or higher)
- [PostgreSQL](https://www.postgresql.org/)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### PostgreSQL Installation and Setup

#### macOS

1. **Install PostgreSQL via Homebrew**:

   If you have [Homebrew](https://brew.sh/) installed, run the following command:

   ```bash
   brew install postgresql
   ```

2. **Start PostgreSQL**:

   After installation, you can start PostgreSQL with:

   ```bash
   brew services start postgresql
   ```

3. **Create a New Database User and Database**:

   ```bash
   psql postgres
   ```

   In the `psql` shell, create a new user and database:

   ```sql
   CREATE USER your_username WITH PASSWORD 'your_password';
   CREATE DATABASE your_database_name;
   GRANT ALL PRIVILEGES ON DATABASE your_database_name TO your_username;
   ```

4. **Verify the Setup**:

   You can connect to your new database:

   ```bash
   psql -U your_username -d your_database_name
   ```

5. **Login and setup**:

```bash
sudo -u postgres psql
```

- Create new db

```bash
CREATE DATABASE your_db_name;
```

- Create a new user (role) with password

```bash
CREATE USER your_username WITH PASSWORD 'your_password';
```

- switch to your database

```bash
\c your_db_name;
```

- Give full permissions on the DB to the user

```bash
GRANT ALL PRIVILEGES ON DATABASE your_db_name TO your_username;

or

GRANT ALL ON SCHEMA public to your_user_name

or

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO your_username;

```

- Make the user owner of the DB

```bash
ALTER DATABASE your_db_name OWNER TO your_username;
```

#### Windows

1. **Download PostgreSQL**:

   Download and install PostgreSQL from the official website: [PostgreSQL for Windows](https://www.postgresql.org/download/windows/).

2. **Installation Process**:

   During the installation, you'll be prompted to create a superuser account (Postgres user) and set up a password.

3. **Start PostgreSQL Service**:

   After installation, PostgreSQL should automatically start as a service. If not, you can manually start it from the "Services" panel on Windows.

4. **Create a New Database**:

   Open `pgAdmin` (PostgreSQL’s management tool) or use the command line to create a new user and database:

   ```bash
   psql -U postgres
   ```

   In the `psql` shell, run the following:

   ```sql
   CREATE USER your_username WITH PASSWORD 'your_password';
   CREATE DATABASE your_database_name;
   GRANT ALL PRIVILEGES ON DATABASE your_database_name TO your_username;
   ```

5. **Verify the Setup**:

   Connect to your new database:

   ```bash
   psql -U your_username -d your_database_name
   ```

### Application Setup

1. **Clone the Repository**

   First, clone the repository to your local machine:

   ```bash
   git clone https://github.com/roshoon/roshoon-api.git
   ```

2. **Install Dependencies**

   Navigate to the project directory and install the necessary Node.js dependencies:

   ```bash
   cd erp-api
   npm install
   ```

3. **Set Up PostgreSQL Connection**

   Update your PostgreSQL connection details in `config.json` or `.env`.

   If you're using environment variables, create a `.env` file with the following structure:

   ```bash
   DB_HOST=localhost
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=your_database_name
   DB_PORT=5432
   ```

4. **Run Database Migrations**

   To create the required database tables and schema, run:

   ```bash
   npx sequelize-cli db:migrate
   ```

5. **Run the Application**

   Start the application:

   ```bash
   node server.js
   ```

   The app will be running on [http://localhost:4545](http://localhost:4545).

## Commit and Branch Guidelines

### Branch Naming

When creating a branch, please follow these conventions:

- **Feature branches**: `feature/[Jira-ticket-number]`
  - Example: `feature/IVIS-12345`
- **Bugfix branches**: `bug/[Jira-ticket-number]`
  - Example: `bug/IVIS-12345`

### Commit Messages

Follow this structure for commit messages:

```bash
[Jira-ticket-number]: Short description of the change
```

Example:

```bash
[IVIS-12345]: Add role management for users
```

### Pull Request Guidelines

When submitting a pull request:

- Add a detailed description of the changes made.
- Mention the relevant Jira ticket number.
- Describe how the changes were tested (unit tests, manual testing, etc.).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Create Migration file

```bash
npx sequelize-cli migration:generate --name create-your-table_name
```

- Now Edit your migration file in the migrations folder and run:

```bash
npx sequelize-cli db:migrate
```

### Create seeder file

```bash
npx sequelize-cli seed:generate --name seed-your-file-name
```

- Now generate fake data

```bash
npx sequelize-cli db:seed:all
```

- Now remove fake data

```bash
npx sequelize-cli db:seed:undo:all
```

# E-Commerce API Documentation

## Base URL

```
http://localhost:5000/api/v1
```

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## 📋 Table of Contents

1. [Auth Routes](#auth-routes)
2. [Category Routes](#category-routes)
3. [Product Routes](#product-routes)
4. [Order Routes](#order-routes)
5. [Hero Routes](#hero-routes)
6. [Transaction Routes](#transaction-routes)
7. [User Routes](#user-routes)

---

## Auth Routes

### Register User

```http
POST /auth/register
```

**Body:**

```json
{
	"name": "John Doe",
	"email": "john@example.com",
	"password": "password123",
	"phone": "+1234567890",
	"address": "123 Main St"
}
```

### Login

```http
POST /auth/login
```

**Body:**

```json
{
	"email": "john@example.com",
	"password": "password123"
}
```

### Get Profile

```http
GET /auth/profile
Authorization: Bearer <token>
```

### Update Profile

```http
PUT /auth/update-profile
Authorization: Bearer <token>
```

**Body:**

```json
{
	"name": "John Updated",
	"phone": "+1234567890",
	"address": "456 New St",
	"avatar": "https://cloudinary.com/..."
}
```

### Update Password

```http
PUT /auth/update-password
Authorization: Bearer <token>
```

**Body:**

```json
{
	"password": "oldPassword123",
	"newPassword": "newPassword123",
	"confirmPassword": "newPassword123"
}
```

### Forgot Password

```http
POST /auth/forgot-password
```

**Body:**

```json
{
	"email": "john@example.com"
}
```

### Reset Password

```http
POST /auth/reset-password?token=<reset_token>
```

**Body:**

```json
{
	"newPassword": "newPassword123",
	"confirmPassword": "newPassword123"
}
```

### Logout

```http
POST /auth/logout
Authorization: Bearer <token>
```

---

## Category Routes

### Get All Categories

```http
GET /categories?page=1&limit=10&search=laptop&sortBy=name&sortOrder=ASC
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name or description
- `sortBy` (optional): Sort field (default: created_at)
- `sortOrder` (optional): ASC or DESC (default: DESC)

### Get Category by ID

```http
GET /categories/:id
```

### Create Category (Admin)

```http
POST /categories
Authorization: Bearer <admin_token>
```

**Body:**

```json
{
	"name": "Laptops",
	"description": "High-performance laptops",
	"image": "https://cloudinary.com/..."
}
```

### Update Category (Admin)

```http
PUT /categories/:id
Authorization: Bearer <admin_token>
```

**Body:**

```json
{
	"name": "Updated Laptops",
	"description": "Updated description",
	"image": "https://cloudinary.com/..."
}
```

### Delete Category (Admin)

```http
DELETE /categories/:id
Authorization: Bearer <admin_token>
```

---

## Product Routes

### Get All Products

```http
GET /products?page=1&limit=10&search=macbook&category_id=xxx&min_price=100&max_price=2000&status=active&sortBy=price&sortOrder=ASC
```

**Query Parameters:**

- `page` (optional): Page number
- `limit` (optional): Items per page
- `search` (optional): Search by name or description
- `category_id` (optional): Filter by category
- `min_price` (optional): Minimum price filter
- `max_price` (optional): Maximum price filter
- `status` (optional): active, inactive, out_of_stock
- `sortBy` (optional): Sort field
- `sortOrder` (optional): ASC or DESC

### Get Product by ID

```http
GET /products/:id
```

### Create Product (Admin)

```http
POST /products
Authorization: Bearer <admin_token>
```

**Body:**

```json
{
	"name": "MacBook Pro 14",
	"description": "Powerful laptop with M3 chip",
	"price": 1999,
	"category_id": "category-uuid",
	"stock": 15,
	"image": "https://cloudinary.com/...",
	"rating": 4.8,
	"reviews": 234
}
```

### Update Product (Admin)

```http
PUT /products/:id
Authorization: Bearer <admin_token>
```

**Body:**

```json
{
	"name": "Updated MacBook Pro",
	"price": 2199,
	"stock": 20,
	"status": "active"
}
```

### Update Product Stock (Admin)

```http
PATCH /products/:id/stock
Authorization: Bearer <admin_token>
```

**Body:**

```json
{
	"quantity": 10,
	"operation": "add"
}
```

**Operations:** `add` or `subtract`

### Delete Product (Admin)

```http
DELETE /products/:id
Authorization: Bearer <admin_token>
```

---

## Order Routes

### Create Order

```http
POST /orders
Authorization: Bearer <token>
```

**Body:**

```json
{
	"items": [
		{
			"product_id": "product-uuid",
			"quantity": 2
		}
	],
	"payment_method": "STRIPE",
	"shipping_address": "123 Main St, City, State 12345",
	"notes": "Please handle with care"
}
```

**Payment Methods:** STRIPE, PAYPAL, CASH_ON_DELIVERY, BANK_TRANSFER

### Get All Orders (Admin)

```http
GET /orders?page=1&limit=10&status=PENDING&payment_method=STRIPE&user_id=xxx
Authorization: Bearer <admin_token>
```

**Query Parameters:**

- `status`: PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED
- `payment_method`: STRIPE, PAYPAL, CASH_ON_DELIVERY, BANK_TRANSFER
- `user_id`: Filter by user

### Get My Orders

```http
GET /orders/my-orders?page=1&limit=10&status=DELIVERED
Authorization: Bearer <token>
```

### Get Order by ID

```http
GET /orders/:id
Authorization: Bearer <token>
```

### Update Order Status (Admin)

```http
PATCH /orders/:id/status
Authorization: Bearer <admin_token>
```

**Body:**

```json
{
	"status": "SHIPPED",
	"tracking_number": "TRK123456789"
}
```

### Cancel Order

```http
POST /orders/:id/cancel
Authorization: Bearer <token>
```

---

## Hero Routes

### Get Active Hero Slides (Public)

```http
GET /heroes/active
```

### Get All Hero Slides (Admin)

```http
GET /heroes?page=1&limit=10&status=active&sortBy=order&sortOrder=ASC
Authorization: Bearer <admin_token>
```

### Get Hero by ID

```http
GET /heroes/:id
```

### Create Hero (Admin)

```http
POST /heroes
Authorization: Bearer <admin_token>
```

**Body:**

```json
{
	"title": "MacBook Pro M3",
	"subtitle": "Supercharged for pros",
	"description": "The most powerful MacBook Pro ever",
	"image": "https://cloudinary.com/...",
	"bg_color": "from-slate-900 to-slate-700",
	"cta": "Shop Now",
	"category_id": "category-uuid",
	"product_id": "product-uuid",
	"price": "$1,999",
	"badge": "New Arrival",
	"order": 1,
	"status": "active"
}
```

### Update Hero (Admin)

```http
PUT /heroes/:id
Authorization: Bearer <admin_token>
```

### Update Hero Order (Admin)

```http
PATCH /heroes/:id/order
Authorization: Bearer <admin_token>
```

**Body:**

```json
{
	"order": 2
}
```

### Reorder Heroes (Admin)

```http
POST /heroes/reorder
Authorization: Bearer <admin_token>
```

**Body:**

```json
{
	"orderArray": [
		{ "id": "hero-uuid-1", "order": 1 },
		{ "id": "hero-uuid-2", "order": 2 },
		{ "id": "hero-uuid-3", "order": 3 }
	]
}
```

### Toggle Hero Status (Admin)

```http
PATCH /heroes/:id/toggle-status
Authorization: Bearer <admin_token>
```

### Delete Hero (Admin)

```http
DELETE /heroes/:id
Authorization: Bearer <admin_token>
```

---

## Transaction Routes

### Get All Transactions (Admin)

```http
GET /transactions?page=1&limit=10&status=COMPLETED&method=STRIPE&user_id=xxx
Authorization: Bearer <admin_token>
```

### Get My Transactions

```http
GET /transactions/my-transactions?page=1&limit=10&status=COMPLETED
Authorization: Bearer <token>
```

### Get Transaction by ID

```http
GET /transactions/:id
Authorization: Bearer <token>
```

### Get Transaction Stats (Admin)

```http
GET /transactions/stats?start_date=2025-01-01&end_date=2025-12-31
Authorization: Bearer <admin_token>
```

### Update Transaction Status (Admin)

```http
PATCH /transactions/:id/status
Authorization: Bearer <admin_token>
```

**Body:**

```json
{
	"status": "COMPLETED",
	"metadata": {
		"payment_gateway_id": "pi_xxx",
		"note": "Payment verified"
	}
}
```

### Process Payment

```http
POST /transactions/:id/process
Authorization: Bearer <token>
```

**Body:**

```json
{
	"payment_details": {
		"transaction_id": "stripe_pi_xxx",
		"card_last4": "4242",
		"card_brand": "visa"
	}
}
```

### Create Transaction (Admin)

```http
POST /transactions
Authorization: Bearer <admin_token>
```

**Body:**

```json
{
	"order_id": "order-uuid",
	"amount": 999.99,
	"method": "STRIPE",
	"transaction_id": "stripe_pi_xxx",
	"metadata": {}
}
```

---

## User Routes (Admin Only)

### Get All Users

```http
GET /users?page=1&limit=10&search=john&role_id=xxx&status=active&sortBy=created_at&sortOrder=DESC
Authorization: Bearer <admin_token>
```

### Get User Stats

```http
GET /users/stats
Authorization: Bearer <admin_token>
```

### Get User by ID

```http
GET /users/:id
Authorization: Bearer <admin_token>
```

### Update User

```http
PUT /users/:id
Authorization: Bearer <admin_token>
```

**Body:**

```json
{
	"name": "Updated Name",
	"phone": "+1234567890",
	"address": "New Address"
}
```

### Update User Status

```http
PATCH /users/:id/status
Authorization: Bearer <admin_token>
```

**Body:**

```json
{
	"status": "active"
}
```

**Status Options:** active, inactive, suspended

### Update User Role

```http
PATCH /users/:id/role
Authorization: Bearer <admin_token>
```

**Body:**

```json
{
	"role_id": "role-uuid"
}
```

### Delete User

```http
DELETE /users/:id
Authorization: Bearer <admin_token>
```

---

## Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "token": "jwt_token_here" // (optional, for login/register)
}
```

### Error Response

```json
{
	"success": false,
	"message": "Error message",
	"error": "Detailed error description"
}
```

### Pagination Response

```json
{
  "success": true,
  "message": "Data fetched successfully",
  "data": {
    "items": [ ... ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 10,
      "totalPages": 10
    }
  }
}
```

---

## Permissions Summary

### User Permissions (Score: 0)

- Access own profile
- View products
- Create orders
- View own orders
- Cancel own orders
- View own transactions
- Process payments

### Admin Permissions (Score: 999)

- Manage categories
- Manage products
- Manage all orders
- Manage hero slides
- Manage all transactions
- Manage users
- View dashboard and stats

---

## Status Codes

- `200` - OK
- `201` - Created
- `202` - Accepted (Update)
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error
