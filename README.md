<div align="center">

# Auren

A full-stack leave management platform with a calm, architectural enterprise interface — built entirely with [Claude Code](https://claude.ai/code) by Anthropic and deployed on Microsoft Azure.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Azure%20Static%20Web%20Apps-0089D6?style=for-the-badge&logo=microsoft-azure&logoColor=white)](https://brave-glacier-08bdffd00.7.azurestaticapps.net)
[![Uptime](https://img.shields.io/badge/Uptime%20Status-Live%20Monitor-brightgreen?style=for-the-badge&logo=statuspage&logoColor=white)](https://stats.uptimerobot.com/k1OfLaiYDk)

&nbsp;

> The backend runs on the App Service Free tier, which sleeps after twenty minutes of inactivity. UptimeRobot pings `/api/health` every ten minutes to keep the worker warm; the login page also shows a "waking up" banner with auto-retry on cold start, so the first request after a long idle still resolves cleanly.

&nbsp;

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![Azure](https://img.shields.io/badge/Microsoft_Azure-0089D6?style=for-the-badge&logo=microsoft-azure&logoColor=white)
![SQL Server](https://img.shields.io/badge/Azure_SQL-CC2927?style=for-the-badge&logo=microsoft-sql-server&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)

</div>

&nbsp;

## What it does

Employees apply for leave, watch the request status, and cancel pending requests inline. Admins see every pending request, approve in one click or reject with an optional reason, and browse the full employee directory.

The interface is a unified industrial-editorial design system — warm graphite surfaces, burnt-orange accents, architectural composition — applied consistently across the marketing home, auth screens, and the dashboard shell. Dashboards update optimistically and re-sync on tab focus via the Page Visibility API.

&nbsp;

## Features

**Employees**

- Register with name, email, optional department, and password (strength-checked client-side)
- Dashboard with a four-column stat strip (total, pending, approved, rejected) and recent-requests list
- Apply for leave by selecting a type, picking a date range, and writing a reason — duration computes live
- Filter leave history by status with sliding tab pills
- Cancel pending requests inline

**Admins**

- Stats strip: total employees + pending / approved / rejected request counts
- Full leave request table with employee avatar, type, date range, reason, status
- Approve in one click, or reject with an optional reason that surfaces back to the employee
- Employees tab — every registered user with department and join date

**Authentication**

- JWT login and registration via `/api/auth/*`
- Bearer token attached to every API request by an Axios request interceptor
- On 401, an `auth:unauthorized` browser event clears state and redirects without a hard reload

&nbsp;

## Tech stack

**Frontend** ([frontend/package.json](frontend/package.json))

| Library | Purpose |
|---|---|
| React 18 + React Router v6 | UI + client-side routing |
| Vite 5 | Dev server + production bundler |
| Tailwind CSS 3 | Utility-first styling, custom warm graphite + burnt orange theme |
| Framer Motion 12 | Entrance, hover, and shared-layout animations |
| Lucide React | Icon set |
| Axios | HTTP client with request and response interceptors (40s timeout) |

**Backend** ([backend/package.json](backend/package.json))

| Library | Purpose |
|---|---|
| Node.js 22 + Express 4 | REST API server |
| mssql 10 | Azure SQL driver with shared connection pool |
| jsonwebtoken 9 | JWT sign + verify |
| bcryptjs 2 | Password hashing |
| cors 2 | Origin allowlist (`FRONTEND_URL` env var + localhost dev) |
| dotenv 16 | Local env var loading |

**Azure infrastructure**

| Service | Role |
|---|---|
| Azure Static Web Apps | Hosts the React build, global CDN, SPA fallback via `staticwebapp.config.json` |
| Azure App Service (Linux, Node 22 LTS, F1 free) | Hosts the Express API |
| Azure SQL Database | Managed SQL Server, encrypted in transit |
| Azure SQL firewall | "Allow Azure services" rule for App Service access; per-IP rules for local dev |

&nbsp;

## Design system

The whole product runs on a single token palette defined in [`frontend/tailwind.config.js`](frontend/tailwind.config.js):

| Role | Value | Use |
|---|---|---|
| `surface` | `#f4f0e8` | Warm bone — light dashboard canvas |
| `surface-container-lowest` | `#faf6ed` | Elevated cards |
| `on-surface` | `#1b1a17` | Deep warm graphite text |
| `on-surface-variant` | `#615d54` | Muted charcoal text |
| `outline-variant` | `#d6cfc2` | Warm gray borders |
| `inverse-surface` | `#1b1a17` | Dark sections (hero, sidebar, auth) |
| `primary` | `#b15a1c` | Burnt orange — the only accent |
| `primary-container` | `#cf7b35` | Copper hover state |
| `inverse-primary` | `#e89255` | Warm copper on dark |

Recurring patterns:

- **Architectural mark** — a 2×2 grid of copper/dim squares paired with the "Auren" wordmark (navbar, sidebar, auth pages, favicon)
- **Eyebrow rule** — short copper hairline + uppercase `tracking-[0.22em]` label above every section heading
- **Panel hairline** — `shadow-[0_1px_0_rgba(27,26,23,0.04)]` + top inner gradient highlight on every card
- **Status badges** — quieter pills (`rounded-md`, `text-[11px]`), saturation-reduced
- **Tables** — uppercase 10px headers, row hover tint, status badge as the single emphasis

&nbsp;

## API overview

All endpoints under `/api`. Protected routes pass through `verifyToken` (decodes JWT, attaches `{ id, email, role }` to `req.user`), then optionally `requireRole('admin')`.

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | public | Create employee account (role always `'employee'`) |
| POST | `/api/auth/login` | public | Return JWT + user payload |
| GET | `/api/auth/profile` | JWT | Refresh user info |
| POST | `/api/leave/apply` | JWT employee | Submit a new request |
| GET | `/api/leave/my-leaves` | JWT employee | Personal leave history |
| PATCH | `/api/leave/cancel/:id` | JWT employee | Cancel a pending request |
| GET | `/api/admin/employees` | JWT admin | List all employees |
| GET | `/api/admin/leaves` | JWT admin | List all leave requests |
| PATCH | `/api/admin/leaves/:id/approve` | JWT admin | Approve |
| PATCH | `/api/admin/leaves/:id/reject` | JWT admin | Reject with optional `rejection_reason` |
| GET | `/api/admin/dashboard/stats` | JWT admin | Aggregate counts |
| GET | `/api/health` | public | Lightweight liveness (no DB hit by default); `?ping=db` for full DB connectivity check |

Admin accounts are created directly via SQL — `/api/auth/register` cannot create them.

&nbsp;

## Routes (frontend)

| Path | Role | Page |
|---|---|---|
| `/` | public | Home (marketing) |
| `/login` | public | Sign in |
| `/register` | public | Sign up |
| `/dashboard` | employee | EmployeeDashboard |
| `/apply-leave` | employee | ApplyLeave |
| `/leave-history` | employee | LeaveHistory |
| `/admin` | admin | AdminDashboard (tabs: leaves, employees) |

&nbsp;

## Database schema

Full DDL lives in [`database/schema.sql`](database/schema.sql).

```
users
  id          INT             PK, auto-increment
  name        NVARCHAR(100)
  email       NVARCHAR(150)   UNIQUE
  password    NVARCHAR(255)   bcrypt hash
  role        NVARCHAR(20)    'employee' | 'admin'   (default 'employee')
  department  NVARCHAR(100)   nullable
  created_at  DATETIME2

leave_requests
  id               INT             PK, auto-increment
  employee_id      INT             FK -> users.id  (ON DELETE CASCADE)
  leave_type       NVARCHAR(50)    annual | sick | maternity | paternity | unpaid | other
  start_date       DATE
  end_date         DATE            CHECK (end_date >= start_date)
  reason           NVARCHAR(500)
  status           NVARCHAR(20)    pending | approved | rejected | cancelled
  rejection_reason NVARCHAR(300)   nullable, populated on reject
  reviewed_by      INT             FK -> users.id (the admin)
  reviewed_at      DATETIME2
  created_at       DATETIME2
```

&nbsp;

## Project structure

```
staff-leave-management/
├── backend/
│   ├── src/
│   │   ├── app.js                       Express setup, CORS, route mounting, /api/health
│   │   ├── config/db.js                 mssql pool with auto-reconnect on stale
│   │   ├── controllers/                 auth.controller, leave.controller, admin.controller
│   │   ├── middleware/                  auth (verifyToken), roleCheck (requireRole)
│   │   └── routes/                      auth.routes, leave.routes, admin.routes
│   ├── server.js                        dotenv + listen on PORT
│   ├── .azure/config                    az webapp up defaults
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   ├── favicon.svg                  Auren mark (graphite tile + copper diagonal)
│   │   └── staticwebapp.config.json     SPA fallback for Azure Static Web Apps
│   ├── src/
│   │   ├── components/
│   │   │   ├── DashboardLayout.jsx      Sidebar + canvas shell, mobile top bar
│   │   │   ├── ProtectedRoute.jsx       Auth + role guard, wraps page in DashboardLayout
│   │   │   ├── Sidebar.jsx              Architectural nav with copper active indicator
│   │   │   └── StatusBadge.jsx          Pending / approved / rejected / cancelled pill
│   │   ├── context/AuthContext.jsx      Global auth state (localStorage-persisted)
│   │   ├── pages/                       Home, Login, Register, EmployeeDashboard,
│   │   │                                AdminDashboard, ApplyLeave, LeaveHistory
│   │   ├── services/api.js              Axios instance + JWT interceptor + 401 event dispatch
│   │   ├── App.jsx                      Router
│   │   ├── main.jsx                     Entry
│   │   └── index.css                    Tailwind base + grid utilities + keyframes
│   ├── tailwind.config.js               Token palette + box-shadows + easings
│   ├── vite.config.js
│   ├── .env.example
│   └── package.json
│
└── database/
    └── schema.sql                       Table DDL + seed admin account
```

&nbsp;

## Running locally

**Backend** — needs a `backend/.env` (copy from `.env.example` and fill in real values):

```bash
cd backend
npm install
npm run dev          # nodemon on port 5000
```

Required env vars: `DB_SERVER`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `FRONTEND_URL`, `NODE_ENV=development`. The Azure SQL firewall must allow your client IP — add it under the SQL server's Networking → Firewall rules in the Azure Portal (or `az sql server firewall-rule create`).

**Frontend** — needs `frontend/.env`:

```bash
cd frontend
npm install
npm run dev          # Vite on port 5173
```

Required env var: `VITE_API_URL=http://localhost:5000/api`.

There is no test suite and no lint config in this repo.

&nbsp;

## Deployment

**Backend** — from `backend/`, using `.azure/config` defaults:

```bash
az webapp up --runtime "NODE:22-lts" --os-type linux
```

This zip-deploys to `leave-mgmt-arfaan` in `leave-mgmt-rg`. Production env vars live on the App Service (Application settings), not in a deployed `.env` — `.env` is gitignored and excluded from the bundle. After deploy, verify settings with `az webapp config appsettings list -g leave-mgmt-rg -n leave-mgmt-arfaan`.

**Frontend** — from `frontend/`, with the production backend URL baked in at build time:

```bash
VITE_API_URL='https://leave-mgmt-arfaan-edfyfth3cffxf3cx.southeastasia-01.azurewebsites.net/api' \
  npm run build

# Get the SWA deployment token, then push
SWA_TOKEN=$(az staticwebapp secrets list -n leave-mgmt-frontend -g leave-mgmt-rg \
  --query properties.apiKey -o tsv)
npx @azure/static-web-apps-cli deploy ./dist \
  --deployment-token "$SWA_TOKEN" --env production
```

The Static Web App was created in "Other" mode (no GitHub Actions integration), so deploys are CLI-driven. `public/staticwebapp.config.json` ships with the build and handles SPA navigation fallback.

&nbsp;

## Built with Claude Code

Every line in this repo was authored through [Claude Code](https://claude.ai/code) — feature work, Azure SQL connectivity debugging, the full industrial-editorial redesign, the brand migration from "LeaveMS" to "Auren", and the production deploy automation. The iteration loop covered Express boilerplate, SQL schema, every React page, the Tailwind token system, JWT auth, and the Azure infrastructure on App Service + Static Web Apps + SQL Database.
