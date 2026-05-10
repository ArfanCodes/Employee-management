const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const leaveRoutes = require('./routes/leave.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────

// CORS: allow requests from all configured frontend origins
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5174',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no Origin header (server-to-server, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin '${origin}' not allowed`));
  },
  credentials: true
}));

// Parse incoming JSON request bodies
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);    // /api/auth/register, /api/auth/login
app.use('/api/leave', leaveRoutes);  // /api/leave/apply, /api/leave/my-leaves
app.use('/api/admin', adminRoutes);  // /api/admin/employees, /api/admin/leaves

// Health check — useful for Azure App Service and load balancers
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Staff Leave API is running' });
});

module.exports = app;
