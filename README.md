# Staff Leave Management System

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Azure%20Static%20Web%20Apps-0089D6?style=for-the-badge&logo=microsoft-azure&logoColor=white)](https://brave-glacier-08bdffd00.7.azurestaticapps.net)

A full-stack web application for managing employee leave requests, built entirely using [Claude Code](https://claude.ai/code) by Anthropic. The project covers everything from authentication and role-based access to real-time dashboard updates, all deployed on Microsoft Azure.

&nbsp;

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![Azure](https://img.shields.io/badge/Microsoft_Azure-0089D6?style=for-the-badge&logo=microsoft-azure&logoColor=white)
![SQL Server](https://img.shields.io/badge/Azure_SQL-CC2927?style=for-the-badge&logo=microsoft-sql-server&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)

&nbsp;

## What this project does

The system gives employees a clean interface to apply for leave, track their request status in real time, and cancel pending requests if plans change. On the admin side, managers get a full overview of the team — they can approve or reject requests with a reason, see all employees, and watch dashboard stats update the moment they take an action.

There are no page refreshes, no manual syncing. The moment an admin approves or rejects a request, the UI reflects it instantly using optimistic updates. When a user switches back to the tab after being away, the data quietly re-fetches in the background via the Page Visibility API.

&nbsp;

## Features

**For employees**

Employees register with their name, email, department, and password. Once logged in they land on a personal dashboard showing their total requests and a breakdown by status. From there they can submit a new leave request by picking a type, choosing a date range, and writing a reason. The duration calculates automatically. Past and current requests live in a history page with filter chips for each status, and pending requests can be cancelled inline without any pop-up dialogs.

**For admins**

Admins see a separate dashboard with company-wide stats: total employees, pending requests, approvals, and rejections. The leave requests tab lists every submission across the team with the employee name, leave type, dates, and current status. Approving is a single click. Rejecting opens a small inline field to write a reason, which gets stored and shown to the employee in their history. There is also an employees tab that lists every registered user with their department and role.

**Authentication**

Login and registration use JWT. The token is stored in localStorage and attached to every API request automatically via an Axios interceptor. If a token expires or gets invalidated, the interceptor fires a custom browser event that the auth context listens for, clearing state and redirecting to login without a hard page reload.

&nbsp;

## Tech stack

**Frontend**

React 18 with React Router v6 handles all client-side routing and navigation. Vite replaces Create React App for a much faster dev experience and build process. Tailwind CSS handles all styling with a custom indigo and violet color scheme, Inter as the default font, and a few utility classes for gradients. Framer Motion drives the entrance animations on dashboards and cards. Lucide React provides the icon set throughout the UI.

**Backend**

Node.js with Express handles all API routes. The codebase is split into controllers, routes, and middleware so each layer has a clear responsibility. `bcryptjs` hashes passwords before they ever touch the database. `jsonwebtoken` signs and verifies tokens. `mssql` connects to SQL Server using a connection pool so the app does not open a new connection on every request.

**Database**

Azure SQL Database stores all data across two tables: `users` and `leave_requests`. Foreign key constraints link leave requests back to the employee who submitted them and the admin who reviewed them. A check constraint on the database level enforces that `end_date` can never be before `start_date`. Indexes are placed on `employee_id` and `status` since those are the most queried columns.

**Azure infrastructure**

| Service | What it does |
|---|---|
| Azure App Service | Hosts the Node.js backend as a managed web app on Linux |
| Azure SQL Database | Fully managed SQL Server database with automatic backups |
| Azure Static Web Apps | Hosts the built React frontend with a global CDN |
| Azure SQL Firewall | Controls which IPs and Azure services can reach the database |

&nbsp;

## API overview

The backend exposes three route groups.

`/api/auth` handles registration, login, and profile fetch. No token required to register or log in.

`/api/leave` is for employees only. It covers submitting a new request, fetching personal leave history, and cancelling a pending request.

`/api/admin` is locked to admin-role tokens only. It exposes endpoints for listing all employees, listing all leave requests across the company, approving a request, rejecting a request with a reason, and fetching the dashboard stats.

Every protected route passes through two middleware functions in sequence: `verifyToken` decodes the JWT and attaches the user payload to the request, then `requireRole` checks that the user's role matches what the route expects before the controller ever runs.

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
│   │   ├── config/
│   │   │   └── db.js                  SQL Server connection pool
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── leave.controller.js
│   │   │   └── admin.controller.js
│   │   ├── middleware/
│   │   │   ├── auth.js                JWT verification
│   │   │   └── roleCheck.js           Role guard
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── leave.routes.js
│   │   │   └── admin.routes.js
│   │   └── app.js                     Express setup, CORS, route mounting
│   ├── server.js
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DashboardLayout.jsx    Sidebar + main content wrapper
│   │   │   ├── Sidebar.jsx            Navigation for both roles
│   │   │   ├── ProtectedRoute.jsx     Auth and role guard for pages
│   │   │   └── StatusBadge.jsx        Colored status pill
│   │   ├── context/
│   │   │   └── AuthContext.jsx        Global auth state
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── EmployeeDashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── ApplyLeave.jsx
│   │   │   └── LeaveHistory.jsx
│   │   ├── services/
│   │   │   └── api.js                 Axios instance with interceptors
│   │   └── App.jsx
│   ├── .env.example
│   └── package.json
│
└── database/
    └── schema.sql                     Table definitions and seed accounts
```

&nbsp;

## Built with Claude Code

This entire project was written with [Claude Code](https://claude.ai/code), Anthropic's agentic coding tool. The development process involved iterative prompting to build out features, debug Azure connectivity issues, redesign the UI, and solve real-time state management problems like race conditions between polling intervals and optimistic updates.

Claude Code handled everything from writing the initial Express boilerplate and SQL schema to redesigning the frontend with Tailwind and Framer Motion, fixing JWT auth timing bugs in React, and replacing interval-based polling with the Page Visibility API for more reliable data sync.
