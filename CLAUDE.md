# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Staff Leave Management System — a full-stack web app where employees apply for leave and admins approve/reject requests. Two separate apps in one repo:

- `backend/` — Node.js + Express REST API, Azure SQL (mssql)
- `frontend/` — React 18 + Vite SPA, Tailwind CSS

Deployed on Azure: App Service (`leave-mgmt-arfaan`, F1 free tier, Linux Node 22, `southeastasia`) + Azure SQL.

## Commands

### Backend
```bash
cd backend
npm install
npm run dev        # nodemon — auto-restarts on file change
npm start          # production start
```

Requires a `.env` file in `backend/`:
```
DB_SERVER=...
DB_NAME=...
DB_USER=...
DB_PASSWORD=...
DB_PORT=1433
JWT_SECRET=...
JWT_EXPIRES_IN=24h
FRONTEND_URL=https://your-frontend-url
NODE_ENV=development
```

### Frontend
```bash
cd frontend
npm install
npm run dev        # Vite dev server at http://localhost:5173
npm run build      # production build to dist/
npm run preview    # preview the production build locally
```

Requires a `.env` file in `frontend/`:
```
VITE_API_URL=http://localhost:5000/api
```

### Deploy to Azure
```bash
cd backend
az webapp up --name leave-mgmt-arfaan --resource-group leave-mgmt-rg --runtime "NODE:22-lts" --os-type linux --sku F1
```

## Architecture

### Auth flow
JWT-based, stateless. `verifyToken` middleware (`backend/src/middleware/auth.js`) reads `Authorization: Bearer <token>`, verifies with `JWT_SECRET`, and attaches `{ id, email, role }` to `req.user`. `requireRole('admin')` (`roleCheck.js`) guards admin-only routes. Tokens expire in 24h by default.

Admin accounts must be created directly via SQL — `POST /api/auth/register` always assigns `role = 'employee'`.

### Backend structure
```
backend/server.js          → entry point (dotenv + listen)
backend/src/app.js         → Express setup, CORS, route mounting
backend/src/config/db.js   → mssql connection pool (lazy init + reconnect on stale)
backend/src/middleware/    → verifyToken, requireRole
backend/src/controllers/   → auth, leave, admin (all DB logic lives here)
backend/src/routes/        → thin route files that wire HTTP verbs to controllers
```

All controllers call `getPool()` which returns a shared `mssql` connection pool. The pool auto-reconnects if the Azure App Service wakes from cold start or the DB restarts — it checks `pool.connected` and listens for pool errors to null out the reference.

### Frontend structure
```
frontend/src/App.jsx             → router + route definitions
frontend/src/context/AuthContext.jsx  → global auth state (React Context, persisted to localStorage)
frontend/src/services/api.js     → axios instance; request interceptor adds JWT; response interceptor fires auth:unauthorized custom event on 401
frontend/src/components/ProtectedRoute.jsx  → role guard + wraps pages in DashboardLayout
frontend/src/components/DashboardLayout.jsx → sidebar + mobile top bar shell
frontend/src/pages/              → one file per route
```

`AuthContext` listens for the `auth:unauthorized` custom event dispatched by the axios interceptor so React state and routing update without a hard page reload.

### Route map
| Path | Role | Page |
|------|------|------|
| `/` | public | Home |
| `/login` | public | Login |
| `/register` | public | Register |
| `/dashboard` | employee | EmployeeDashboard |
| `/apply-leave` | employee | ApplyLeave |
| `/leave-history` | employee | LeaveHistory |
| `/admin` | admin | AdminDashboard |

### API endpoints
| Method | Path | Auth |
|--------|------|------|
| POST | `/api/auth/register` | none |
| POST | `/api/auth/login` | none |
| GET | `/api/auth/profile` | JWT |
| POST | `/api/leave/apply` | JWT employee |
| GET | `/api/leave/my-leaves` | JWT employee |
| PUT | `/api/leave/cancel/:id` | JWT employee |
| GET | `/api/admin/employees` | JWT admin |
| GET | `/api/admin/leaves` | JWT admin |
| PUT | `/api/admin/leaves/:id/approve` | JWT admin |
| PUT | `/api/admin/leaves/:id/reject` | JWT admin |
| GET | `/api/admin/dashboard-stats` | JWT admin |
| GET | `/api/health` | none |

### Database tables
- `users` — `id, name, email, password (bcrypt), department, role ('employee'|'admin'), created_at`
- `leave_requests` — `id, employee_id (FK), leave_type, start_date, end_date, reason, status ('pending'|'approved'|'rejected'|'cancelled'), reviewed_by, reviewed_at, rejection_reason, created_at`

## Known Infrastructure Notes

- **F1 cold start**: The free tier App Service sleeps after ~20 min inactivity. First request after sleep can be slow (~10–30s). The DB pool reconnection in `db.js` handles the stale connection on wake. Consider pinging `/api/health` every 10 min via UptimeRobot to prevent sleep.
- **CORS**: Allowed origins are `FRONTEND_URL` env var + `localhost:5173/5174`. Update `app.js` when adding a new frontend domain.
