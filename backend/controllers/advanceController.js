const pool = require('../config/db');

// GET /api/companies/:companyId/advances
const getAdvances = async (req, res) => {
    try {
        const { employee_id, status } = req.query;
        let query = `
      SELECT a.*, e.name AS emp_name, e.emp_code
      FROM advance_payments a
      JOIN employees e ON a.employee_id = e.id
      WHERE a.company_id = $1
    `;
        const params = [req.companyId];
        if (employee_id) { query += ` AND a.employee_id = $${params.length + 1}`; params.push(employee_id); }
        if (status) { query += ` AND a.status = $${params.length + 1}`; params.push(status); }
        query += ' ORDER BY a.date DESC';
        const result = await pool.query(query, params);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// POST /api/companies/:companyId/advances
const createAdvance = async (req, res) => {
    try {
        const { employee_id, amount, date, reason, deduction_mode = 'full', monthly_deduction } = req.body;
        if (!employee_id || !amount || !date) {
            return res.status(400).json({ success: false, message: 'employee_id, amount, and date are required' });
        }
        const result = await pool.query(
            `INSERT INTO advance_payments(employee_id, company_id, amount, date, reason, deduction_mode, monthly_deduction, created_by)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
            [employee_id, req.companyId, amount, date, reason, deduction_mode, monthly_deduction, req.user.id]
        );
        res.status(201).json({ success: true, message: 'Advance recorded', data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/companies/:companyId/employees/:empId/advance-balance
const getAdvanceBalance = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT COALESCE(SUM(amount - recovered_amount), 0) AS pending_balance,
              COUNT(*) FILTER (WHERE status != 'recovered') AS active_advances
       FROM advance_payments
       WHERE employee_id = $1 AND company_id = $2`,
            [req.params.empId, req.companyId]
        );
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// DELETE /api/companies/:companyId/advances/:id
const deleteAdvance = async (req, res) => {
    try {
        await pool.query(
            `DELETE FROM advance_payments WHERE id = $1 AND company_id = $2 AND status = 'pending'`,
            [req.params.id, req.companyId]
        );
        res.json({ success: true, message: 'Advance deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { getAdvances, createAdvance, getAdvanceBalance, deleteAdvance };
