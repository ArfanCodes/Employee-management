const { getPool, sql } = require('../config/db');

// ─── APPLY FOR LEAVE ──────────────────────────────────────────────────────────
const applyLeave = async (req, res) => {
  const { leave_type, start_date, end_date, reason } = req.body;
  const employee_id = req.user.id;

  if (!leave_type || !start_date || !end_date || !reason) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  if (new Date(end_date) < new Date(start_date)) {
    return res.status(400).json({ message: 'End date must be on or after start date.' });
  }

  try {
    const pool = await getPool();

    const result = await pool.request()
      .input('employee_id', sql.Int, employee_id)
      .input('leave_type', sql.NVarChar, leave_type)
      .input('start_date', sql.Date, start_date)
      .input('end_date', sql.Date, end_date)
      .input('reason', sql.NVarChar, reason)
      .query(`
        INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, reason, status)
        OUTPUT INSERTED.*
        VALUES (@employee_id, @leave_type, @start_date, @end_date, @reason, 'pending')
      `);

    res.status(201).json({
      message: 'Leave application submitted successfully.',
      leave: result.recordset[0]
    });
  } catch (error) {
    console.error('Apply leave error:', error.message);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─── GET MY LEAVES ────────────────────────────────────────────────────────────
const getMyLeaves = async (req, res) => {
  try {
    const pool = await getPool();

    const result = await pool.request()
      .input('employee_id', sql.Int, req.user.id)
      .query(`
        SELECT *
        FROM leave_requests
        WHERE employee_id = @employee_id
        ORDER BY created_at DESC
      `);

    res.json(result.recordset);
  } catch (error) {
    console.error('Get my leaves error:', error.message);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─── CANCEL LEAVE ─────────────────────────────────────────────────────────────
const cancelLeave = async (req, res) => {
  const { id } = req.params;
  const employee_id = req.user.id;

  try {
    const pool = await getPool();

    // Ensure this leave belongs to the current employee and is still pending
    const check = await pool.request()
      .input('id', sql.Int, id)
      .input('employee_id', sql.Int, employee_id)
      .query(`
        SELECT id FROM leave_requests
        WHERE id = @id AND employee_id = @employee_id AND status = 'pending'
      `);

    if (check.recordset.length === 0) {
      return res.status(404).json({
        message: 'Leave request not found or cannot be cancelled (only pending requests can be cancelled).'
      });
    }

    await pool.request()
      .input('id', sql.Int, id)
      .query(`UPDATE leave_requests SET status = 'cancelled' WHERE id = @id`);

    res.json({ message: 'Leave request cancelled successfully.' });
  } catch (error) {
    console.error('Cancel leave error:', error.message);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { applyLeave, getMyLeaves, cancelLeave };
