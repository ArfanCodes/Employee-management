const { getPool, sql } = require('../config/db');

// ─── GET ALL EMPLOYEES ────────────────────────────────────────────────────────
const getAllEmployees = async (req, res) => {
  try {
    const pool = await getPool();

    const result = await pool.request()
      .query(`
        SELECT id, name, email, department, role, created_at
        FROM users
        WHERE role = 'employee'
        ORDER BY name
      `);

    res.json(result.recordset);
  } catch (error) {
    console.error('Get employees error:', error.message);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─── GET ALL LEAVE REQUESTS (with employee info via JOIN) ─────────────────────
const getAllLeaves = async (req, res) => {
  try {
    const pool = await getPool();

    // JOIN users table so the admin sees the employee name & department
    const result = await pool.request()
      .query(`
        SELECT
          lr.*,
          u.name        AS employee_name,
          u.email       AS employee_email,
          u.department
        FROM leave_requests lr
        INNER JOIN users u ON lr.employee_id = u.id
        ORDER BY lr.created_at DESC
      `);

    res.json(result.recordset);
  } catch (error) {
    console.error('Get all leaves error:', error.message);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─── APPROVE LEAVE ────────────────────────────────────────────────────────────
const approveLeave = async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await getPool();

    const check = await pool.request()
      .input('id', sql.Int, id)
      .query(`SELECT id FROM leave_requests WHERE id = @id AND status = 'pending'`);

    if (check.recordset.length === 0) {
      return res.status(404).json({ message: 'Pending leave request not found.' });
    }

    await pool.request()
      .input('id', sql.Int, id)
      .input('admin_id', sql.Int, req.user.id)
      .query(`
        UPDATE leave_requests
        SET status = 'approved', reviewed_by = @admin_id, reviewed_at = GETDATE()
        WHERE id = @id
      `);

    res.json({ message: 'Leave approved successfully.' });
  } catch (error) {
    console.error('Approve leave error:', error.message);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─── REJECT LEAVE ─────────────────────────────────────────────────────────────
const rejectLeave = async (req, res) => {
  const { id } = req.params;
  const { rejection_reason } = req.body;

  try {
    const pool = await getPool();

    const check = await pool.request()
      .input('id', sql.Int, id)
      .query(`SELECT id FROM leave_requests WHERE id = @id AND status = 'pending'`);

    if (check.recordset.length === 0) {
      return res.status(404).json({ message: 'Pending leave request not found.' });
    }

    await pool.request()
      .input('id', sql.Int, id)
      .input('admin_id', sql.Int, req.user.id)
      .input('rejection_reason', sql.NVarChar, rejection_reason || '')
      .query(`
        UPDATE leave_requests
        SET status = 'rejected',
            reviewed_by = @admin_id,
            reviewed_at = GETDATE(),
            rejection_reason = @rejection_reason
        WHERE id = @id
      `);

    res.json({ message: 'Leave rejected.' });
  } catch (error) {
    console.error('Reject leave error:', error.message);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─── DASHBOARD STATS ──────────────────────────────────────────────────────────
const getDashboardStats = async (req, res) => {
  try {
    const pool = await getPool();

    // Single query with subqueries — efficient and easy to understand
    const result = await pool.request()
      .query(`
        SELECT
          (SELECT COUNT(*) FROM users          WHERE role = 'employee')            AS total_employees,
          (SELECT COUNT(*) FROM leave_requests WHERE status = 'pending')           AS pending_requests,
          (SELECT COUNT(*) FROM leave_requests WHERE status = 'approved')          AS approved_requests,
          (SELECT COUNT(*) FROM leave_requests WHERE status = 'rejected')          AS rejected_requests,
          (SELECT COUNT(*) FROM leave_requests)                                    AS total_requests
      `);

    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Dashboard stats error:', error.message);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getAllEmployees, getAllLeaves, approveLeave, rejectLeave, getDashboardStats };
