# Staff Leave Management System

A beginner-friendly, full-stack web application for managing employee leave requests. Built with React, Node.js/Express, and Microsoft SQL Server — designed for learning Azure cloud deployment.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Why](#2-tech-stack--why)
3. [Folder Structure](#3-folder-structure)
4. [Database Design](#4-database-design)
5. [API Endpoints](#5-api-endpoints)
6. [Authentication Flow](#6-authentication-flow)
7. [Local Development Setup](#7-local-development-setup)
8. [Azure Deployment Guide](#8-azure-deployment-guide)
9. [Environment Variables](#9-environment-variables)
10. [Common Mistakes & Tips](#10-common-mistakes--tips)
11. [Future Improvements](#11-future-improvements)

---

## 1. Project Overview

### Features

| Role     | Capabilities |
|----------|-------------|
| Employee | Register/Login, Apply for leave, View leave history, Cancel pending requests |
| Admin    | View all employees, View all leave requests, Approve/Reject leave, Dashboard stats |

### Core Concepts Demonstrated
- JWT-based stateless authentication
- Role-based access control (RBAC)
- SQL relationships with foreign keys
- RESTful API design
- React Context API for state management
- Azure App Service + Azure SQL deployment

---

## 2. Tech Stack & Why

### Frontend — React.js + Vite
React is the most popular frontend library. Vite is the modern build tool (faster than Create React App).
- **React Router** — client-side routing without page reloads
- **Axios** — HTTP client with interceptors (auto-attach JWT to every request)
- **Context API** — simple global state for auth (no Redux needed at this scale)
- **Tailwind CSS** — utility-first CSS, fast to write, great for responsive design

### Backend — Node.js + Express.js
Express is lightweight, minimal, and widely used. Perfect for learning API development.
- **bcryptjs** — hashes passwords before storing in the database (pure JS, no native deps)
- **jsonwebtoken** — creates and verifies JWT tokens
- **mssql** — official Microsoft SQL Server driver for Node.js
- **cors** — allows the frontend (different origin) to call the backend API
- **dotenv** — loads secrets from a `.env` file (never hardcode credentials)

### Database — Microsoft SQL Server / Azure SQL
SQL Server is enterprise-standard and integrates natively with Azure.
- Enforces data integrity with constraints and foreign keys
- Azure SQL is fully managed (no server patching required)
- Works locally with SQL Server Developer Edition (free)

### Why JWT?
JWT (JSON Web Token) is stateless — the server doesn't store sessions.
The token contains the user's ID and role, signed with a secret key.
Every protected API request sends this token; the server verifies it without a DB lookup.
This is scalable and works perfectly for cloud deployments with multiple server instances.

---

## 3. Folder Structure

```
staff-leave-management/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js              # SQL Server connection pool
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT verification middleware
│   │   │   └── roleCheck.js       # Role guard middleware
│   │   ├── routes/
│   │   │   ├── auth.routes.js     # /api/auth/*
│   │   │   ├── leave.routes.js    # /api/leave/*
│   │   │   └── admin.routes.js    # /api/admin/*
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── leave.controller.js
│   │   │   └── admin.controller.js
│   │   └── app.js                 # Express app setup, CORS, routes
│   ├── server.js                  # Entry point
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx         # Top navigation bar
│   │   │   └── ProtectedRoute.jsx # Auth/role guard for pages
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Global auth state (Context API)
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── EmployeeDashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── ApplyLeave.jsx
│   │   │   └── LeaveHistory.jsx
│   │   ├── services/
│   │   │   └── api.js             # Axios instance + interceptors
│   │   ├── App.jsx                # Routes + layout
│   │   ├── main.jsx               # React DOM entry point
│   │   └── index.css              # Tailwind imports
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env.example
│   └── package.json
│
├── database/
│   └── schema.sql                 # Table definitions + seed data
│
└── README.md
```

### Middleware Flow (how a request travels)

```
Client Request
     ↓
Express Router  (/api/admin/leaves)
     ↓
verifyToken middleware  → reads JWT from Authorization header, decodes it
     ↓                    attaches { id, email, role } to req.user
requireRole('admin')    → checks req.user.role === 'admin'
     ↓
Controller function     → runs business logic, queries DB, sends response
     ↓
Client Response
```

---

## 4. Database Design

### Tables

#### `users`
| Column     | Type         | Notes                        |
|------------|--------------|------------------------------|
| id         | INT PK       | Auto-increment primary key   |
| name       | NVARCHAR(100)| Employee full name           |
| email      | NVARCHAR(150)| Unique — used to log in      |
| password   | NVARCHAR(255)| bcrypt hash (never plain)    |
| role       | NVARCHAR(20) | 'employee' or 'admin'        |
| department | NVARCHAR(100)| Optional department name     |
| created_at | DATETIME2    | Auto-set on insert           |

#### `leave_requests`
| Column           | Type         | Notes                           |
|------------------|--------------|---------------------------------|
| id               | INT PK       | Auto-increment primary key      |
| employee_id      | INT FK       | → users.id (ON DELETE CASCADE)  |
| leave_type       | NVARCHAR(50) | annual/sick/maternity/etc.      |
| start_date       | DATE         |                                 |
| end_date         | DATE         | Must be >= start_date           |
| reason           | NVARCHAR(500)|                                 |
| status           | NVARCHAR(20) | pending/approved/rejected/cancelled |
| rejection_reason | NVARCHAR(300)| Set when admin rejects          |
| reviewed_by      | INT FK       | → users.id (admin who reviewed) |
| reviewed_at      | DATETIME2    | When the review happened        |
| created_at       | DATETIME2    | Auto-set on insert              |

### Relationships
- **One-to-Many**: One user can have many leave requests (`users.id → leave_requests.employee_id`)
- **One-to-Many**: One admin can review many leave requests (`users.id → leave_requests.reviewed_by`)
- **Foreign Key Constraint**: `employee_id` uses `ON DELETE CASCADE` — if an employee is deleted, their leave records are automatically removed
- **Check Constraints**: Enforce valid values for `role`, `leave_type`, `status`, and date ordering at the database level

---

## 5. API Endpoints

### Auth Routes — `/api/auth`

| Method | Endpoint         | Auth Required | Description          |
|--------|------------------|---------------|----------------------|
| POST   | `/register`      | No            | Create employee account |
| POST   | `/login`         | No            | Login, get JWT token |
| GET    | `/profile`       | Yes (any)     | Get logged-in user's profile |

### Leave Routes — `/api/leave` (Employee only)

| Method | Endpoint         | Auth Required | Description          |
|--------|------------------|---------------|----------------------|
| POST   | `/apply`         | Yes (employee)| Submit leave request |
| GET    | `/my-leaves`     | Yes (employee)| Get own leave history |
| PATCH  | `/cancel/:id`    | Yes (employee)| Cancel a pending request |

### Admin Routes — `/api/admin` (Admin only)

| Method | Endpoint                    | Auth Required | Description          |
|--------|-----------------------------|---------------|----------------------|
| GET    | `/employees`                | Yes (admin)   | List all employees   |
| GET    | `/leaves`                   | Yes (admin)   | List all leave requests |
| PATCH  | `/leaves/:id/approve`       | Yes (admin)   | Approve a request    |
| PATCH  | `/leaves/:id/reject`        | Yes (admin)   | Reject a request     |
| GET    | `/dashboard/stats`          | Yes (admin)   | Summary statistics   |

### Example: Login Request/Response

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "jane@company.com",
  "password": "Employee@1234"
}
```

**Response:**
```json
{
  "message": "Login successful.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "name": "Jane Smith",
    "email": "jane@company.com",
    "role": "employee",
    "department": "Engineering"
  }
}
```

### Example: Apply Leave (with Authorization header)

```http
POST /api/leave/apply
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "leave_type": "annual",
  "start_date": "2026-06-01",
  "end_date": "2026-06-05",
  "reason": "Family vacation"
}
```

---

## 6. Authentication Flow

```
1. User submits login form
        ↓
2. Backend verifies email + bcrypt.compare(password, hash)
        ↓
3. Backend creates JWT: jwt.sign({ id, email, role }, SECRET, { expiresIn: '24h' })
        ↓
4. Frontend stores token in localStorage
        ↓
5. Every API request includes: Authorization: Bearer <token>
        ↓
6. Backend middleware verifies the token on each request
        ↓
7. req.user = decoded payload  →  controller runs
        ↓
8. On logout: localStorage.removeItem('token')  →  token is gone
```

**Why localStorage for tokens?**
Simple and effective for learning projects. For production, consider `httpOnly` cookies (immune to XSS) once you're comfortable with cookies.

---

## 7. Local Development Setup

### Prerequisites
- Node.js v18+
- SQL Server (Developer Edition, free) or Docker with SQL Server image
- npm or yarn

### Step 1: Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Step 2: Database Setup

Open SQL Server Management Studio (SSMS) or Azure Data Studio and run:

```bash
# Connect to your local SQL Server, then run:
database/schema.sql
```

This creates the `StaffLeaveDB` database, both tables, indexes, and seed accounts.

### Step 3: Backend Environment

```bash
cd backend
cp .env.example .env
# Edit .env with your local SQL Server credentials
```

Key values to update in `.env`:
```
DB_SERVER=localhost
DB_USER=sa
DB_PASSWORD=YourLocalPassword
JWT_SECRET=any_long_random_string
```

### Step 4: Frontend Environment

```bash
cd frontend
cp .env.example .env
# .env already has: VITE_API_URL=http://localhost:5000/api
```

### Step 5: Run Both Servers

```bash
# Terminal 1 — Backend
cd backend
npm run dev       # starts on http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm run dev       # starts on http://localhost:5173
```

Open `http://localhost:5173` in your browser.

**Demo accounts** (from seed data):
- Admin: `admin@company.com` / `Admin@1234`
- Employee: `jane@company.com` / `Admin@1234`

---

## 8. Azure Deployment Guide

### Architecture Overview

```
Browser
  ↓
Azure Static Web Apps (Frontend - React)
  ↓  (HTTPS API calls)
Azure App Service (Backend - Node.js/Express)
  ↓  (TCP 1433)
Azure SQL Database
```

---

### Step 1: Create Azure SQL Database

1. Go to [portal.azure.com](https://portal.azure.com)
2. Search **"SQL databases"** → **Create**
3. Fill in:
   - **Resource group**: Create new → `leave-mgmt-rg`
   - **Database name**: `StaffLeaveDB`
   - **Server**: Create new → set server name, admin username, strong password
   - **Pricing**: Choose "Basic" (cheapest, ~$5/month) for learning
4. Click **Review + Create**

5. After creation, go to **Query editor** in the Azure portal and paste the contents of `database/schema.sql` to create your tables.

6. **Important**: Go to the SQL Server → **Networking** → Add your current IP address to the firewall rules, and enable "Allow Azure services to access this server".

---

### Step 2: Deploy Backend to Azure App Service

**Option A: Deploy via Azure CLI (recommended for learning)**

```bash
# Install Azure CLI: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli
az login

cd backend

# Create App Service Plan (free tier)
az appservice plan create \
  --name leave-mgmt-plan \
  --resource-group leave-mgmt-rg \
  --sku FREE \
  --is-linux

# Create Web App
az webapp create \
  --name your-leave-api \            # Must be globally unique
  --resource-group leave-mgmt-rg \
  --plan leave-mgmt-plan \
  --runtime "NODE:18-lts"

# Deploy code (run from /backend folder)
az webapp up \
  --name your-leave-api \
  --resource-group leave-mgmt-rg
```

**Set environment variables on Azure App Service:**

```bash
az webapp config appsettings set \
  --name your-leave-api \
  --resource-group leave-mgmt-rg \
  --settings \
    NODE_ENV=production \
    PORT=8080 \
    JWT_SECRET="your_production_jwt_secret_here" \
    JWT_EXPIRES_IN="24h" \
    DB_SERVER="yourserver.database.windows.net" \
    DB_NAME="StaffLeaveDB" \
    DB_USER="sqladmin" \
    DB_PASSWORD="YourAzurePassword" \
    DB_PORT="1433" \
    FRONTEND_URL="https://your-frontend.azurestaticapps.net"
```

Your backend will be live at: `https://your-leave-api.azurewebsites.net`

Test it: `https://your-leave-api.azurewebsites.net/api/health`

---

### Step 3: Deploy Frontend to Azure Static Web Apps

1. Update `frontend/.env` (or create `frontend/.env.production`):
   ```
   VITE_API_URL=https://your-leave-api.azurewebsites.net/api
   ```

2. Build the frontend:
   ```bash
   cd frontend
   npm run build
   # Creates a /dist folder with static files
   ```

3. In the Azure portal → search **"Static Web Apps"** → **Create**:
   - **Resource group**: `leave-mgmt-rg`
   - **Name**: `leave-mgmt-frontend`
   - **Hosting plan**: Free
   - **Source**: Other (we'll deploy manually)

4. Deploy using Azure CLI:
   ```bash
   # Install Static Web Apps CLI
   npm install -g @azure/static-web-apps-cli

   # Deploy the dist folder
   swa deploy ./dist \
     --deployment-token <your-token-from-portal> \
     --env production
   ```

Your frontend will be live at: `https://your-frontend.azurestaticapps.net`

---

### Step 4: Configure CORS on Backend

Update the `FRONTEND_URL` environment variable on App Service to match your Static Web Apps URL:

```bash
az webapp config appsettings set \
  --name your-leave-api \
  --resource-group leave-mgmt-rg \
  --settings FRONTEND_URL="https://your-frontend.azurestaticapps.net"
```

---

### Step 5: Verify Azure SQL Connection

The `db.js` config already handles Azure requirements:
- `encrypt: true` — Azure SQL requires encrypted connections
- `trustServerCertificate: false` in production — Azure has valid SSL certs

If you get a connection error, check:
1. Firewall rules on the Azure SQL Server (allow Azure services)
2. Connection string format: `yourserver.database.windows.net` (not just `yourserver`)
3. App Service environment variables are correctly set

---

## 9. Environment Variables

### Backend `.env`

| Variable       | Description                                    | Example |
|----------------|------------------------------------------------|---------|
| PORT           | Port the server listens on                     | 5000    |
| NODE_ENV       | `development` or `production`                  | development |
| JWT_SECRET     | Secret key for signing tokens (keep private!)  | long_random_string |
| JWT_EXPIRES_IN | Token lifetime                                 | 24h     |
| DB_SERVER      | SQL Server hostname                            | localhost or x.database.windows.net |
| DB_NAME        | Database name                                  | StaffLeaveDB |
| DB_USER        | SQL login username                             | sa |
| DB_PASSWORD    | SQL login password                             | Password123 |
| DB_PORT        | SQL Server port (default 1433)                 | 1433 |
| FRONTEND_URL   | Frontend origin for CORS                       | http://localhost:5173 |

### Frontend `.env`

| Variable        | Description              | Example |
|-----------------|--------------------------|---------|
| VITE_API_URL    | Backend API base URL     | http://localhost:5000/api |

> **Note**: Vite env variables must be prefixed with `VITE_` to be accessible in the browser.

---

## 10. Common Mistakes & Tips

### ❌ Common Mistakes

1. **Forgetting to set `encrypt: true`** for Azure SQL — local SQL Server doesn't require it, but Azure does. The `db.js` file handles this automatically based on `NODE_ENV`.

2. **CORS errors in production** — make sure `FRONTEND_URL` matches *exactly* (no trailing slash, correct protocol `https://`).

3. **JWT_SECRET in production** — never use the same secret from `.env.example`. Generate a proper one:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

4. **`VITE_` prefix missing** — environment variables in Vite MUST start with `VITE_` or they won't be available in React code.

5. **Tailwind not purging** — if styles don't appear in production build, check `tailwind.config.js` `content` array includes all your `.jsx` file paths.

6. **Dynamic class names in Tailwind** — don't build class names dynamically like `` `bg-${color}-500` ``. Tailwind can't find them at build time. Use full class names in objects instead.

7. **SQL Server port not open locally** — make sure SQL Server Browser service is running and TCP/IP is enabled in SQL Server Configuration Manager.

### ✅ Deployment Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| 503 on App Service | App crashed on startup | Check App Service logs: `az webapp log tail` |
| "Login failed" DB error | Wrong credentials or firewall | Check App Service env vars + Azure SQL firewall |
| CORS error in browser | Wrong FRONTEND_URL | Update `FRONTEND_URL` setting on App Service |
| Blank white page on frontend | Wrong `VITE_API_URL` | Rebuild with correct `.env` and redeploy |
| JWT errors after deploy | Different JWT_SECRET | Make sure same secret is used everywhere |

---

## 11. Future Improvements

Once you're comfortable with this project, here are good next steps:

1. **Email notifications** — use Azure Communication Services to email employees when their leave is approved/rejected
2. **Leave balance tracking** — add a `leave_balance` table to limit how many days each type an employee can take per year
3. **File upload** — allow employees to attach a doctor's note (store in Azure Blob Storage)
4. **Pagination** — the admin leave list could get very long; add `OFFSET/FETCH` pagination in SQL queries
5. **Password reset** — send a reset link via email using a time-limited JWT
6. **Unit tests** — add Jest tests for controllers and React Testing Library for components
7. **GitHub Actions CI/CD** — auto-deploy to Azure on every push to `main`
8. **Refresh tokens** — implement refresh token rotation so users don't get logged out every 24 hours
9. **Department-level admin** — allow a manager to only see and manage their department's leaves
10. **Azure AD integration** — replace JWT with Microsoft Entra ID (Azure AD) for enterprise single sign-on

---

## Quick Reference

```bash
# Start backend locally
cd backend && npm run dev

# Start frontend locally
cd frontend && npm run dev

# Build frontend for production
cd frontend && npm run build

# Check backend health
curl http://localhost:5000/api/health

# Generate a JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

*Built for learning Azure deployment and full-stack development. Keep it simple, ship it, then improve it.*
