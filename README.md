<div align="center">

# Staff Leave Management System

A full-stack leave management platform built entirely with [Claude Code](https://claude.ai/code) by Anthropic and deployed on Microsoft Azure.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Azure%20Static%20Web%20Apps-0089D6?style=for-the-badge&logo=microsoft-azure&logoColor=white)](https://brave-glacier-08bdffd00.7.azurestaticapps.net)

&nbsp;

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![Azure](https://img.shields.io/badge/Microsoft_Azure-0089D6?style=for-the-badge&logo=microsoft-azure&logoColor=white)
![SQL Server](https://img.shields.io/badge/Azure_SQL-CC2927?style=for-the-badge&logo=microsoft-sql-server&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)

</div>

&nbsp;

## What this project does

Employees get a clean interface to apply for leave, track their request status, and cancel pending requests.

Admins get a full company overview — approve or reject requests with a reason, monitor dashboard stats, and see every registered employee. Everything updates instantly without page refreshes using optimistic UI updates and the Page Visibility API.

&nbsp;

## Features

**For employees**

- Register with name, email, department, and password
- Dashboard showing total requests broken down by status
- Submit leave requests by picking a type, date range, and reason — duration calculates automatically
- Filter leave history by status with a single tap
- Cancel pending requests inline, no pop-up dialogs

**For admins**

- Company-wide stats: total employees, pending, approved, and rejected counts
- Full leave request list across the whole team
- Approve with one click or reject with an optional reason that gets shown to the employee
- Employees tab listing every registered user with department and join date

**Authentication**

- JWT-based login and registration
- Token attached to every API request via Axios interceptor
- On token expiry, a custom browser event clears auth state and redirects cleanly without a hard reload

&nbsp;

## Tech stack

**Frontend**

| Library | Purpose |
|---|---|
| React 18 + React Router v6 | UI and client-side routing |
| Vite | Build tool, faster than Create React App |
| Tailwind CSS | Utility-first styling, custom indigo/violet theme |
| Framer Motion | Entrance animations on dashboards and cards |
| Lucide React | Icon set |
| Axios | HTTP client with request and response interceptors |

**Backend**

| Library | Purpose |
|---|---|
| Node.js + Express | API server, split into controllers/routes/middleware |
| bcryptjs | Password hashing before storage |
| jsonwebtoken | Token signing and verification |
| mssql | SQL Server driver with connection pooling |
| dotenv | Environment variable loading |

**Azure infrastructure**

| Service | What it does |
|---|---|
| Azure App Service | Hosts the Node.js backend on Linux |
| Azure SQL Database | Fully managed SQL Server with automatic backups |
| Azure Static Web Apps | Hosts the React frontend via global CDN |
| Azure SQL Firewall | Controls which IPs can reach the database |

&nbsp;

## API overview

Three route groups, all under `/api`.

**`/api/auth`** — public routes for register, login, and profile fetch.

**`/api/leave`** — employee-only. Submit a request, fetch personal history, cancel a pending request.

**`/api/admin`** — admin-only. List employees, list all leave requests, approve, reject, and fetch dashboard stats.

Every protected route passes through `verifyToken` (decodes JWT, attaches user to request) then `requireRole` (checks the role matches before the controller runs).

&nbsp;

## Database schema

```
users
  id            INT           PK, auto-increment
  name          NVARCHAR(100)
  email         NVARCHAR(150) UNIQUE
  password      NVARCHAR(255) bcrypt hash
  role          NVARCHAR(20)  'employee' or 'admin'
  department    NVARCHAR(100)
  created_at    DATETIME2

leave_requests
  id               INT           PK, auto-increment
  employee_id      INT           FK -> users.id (CASCADE DELETE)
  leave_type       NVARCHAR(50)  annual / sick / maternity / paternity / unpaid / other
  start_date       DATE
  end_date         DATE          must be >= start_date (CHECK constraint)
  reason           NVARCHAR(500)
  status           NVARCHAR(20)  pending / approved / rejected / cancelled
  rejection_reason NVARCHAR(300)
  reviewed_by      INT           FK -> users.id
  reviewed_at      DATETIME2
  created_at       DATETIME2
```

&nbsp;

## Project structure

```
staff-leave-management/
├── backend/
│   ├── src/
│   │   ├── config/db.js               SQL Server connection pool
│   │   ├── controllers/               auth, leave, admin
│   │   ├── middleware/                JWT verification, role guard
│   │   └── routes/                    auth, leave, admin route groups
│   ├── server.js
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/                DashboardLayout, Sidebar, ProtectedRoute, StatusBadge
│   │   ├── context/AuthContext.jsx    Global auth state
│   │   ├── pages/                     Home, Login, Register, dashboards, ApplyLeave, LeaveHistory
│   │   └── services/api.js            Axios instance with interceptors
│   ├── .env.example
│   └── package.json
│
└── database/
    └── schema.sql                     Table definitions and seed accounts
```

&nbsp;

## Built with Claude Code

This project was written entirely with [Claude Code](https://claude.ai/code), Anthropic's agentic coding tool.

The process was iterative — prompting to build features, debug Azure SQL connectivity, redesign the UI from scratch, and fix tricky problems like race conditions between polling intervals and optimistic UI updates.

Claude Code handled the full stack: Express boilerplate, SQL schema, React pages, Tailwind design system, JWT auth flow, and production deployment to Azure.
