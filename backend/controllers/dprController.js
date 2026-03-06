const pool = require('../config/db');

// Submit/Create a Daily Progress Report
exports.submitDPR = async (req, res) => {
    try {
        const { companyId } = req.params;
        const { employee_id, date, report_text, manager_id } = req.body;

        if (!employee_id || !date || !report_text) {
            return res.status(400).json({ success: false, message: 'Employee ID, Date and Report text are required' });
        }

        // Upsert DPR for the given date (One per day)
        const result = await pool.query(
            `INSERT INTO dpr (company_id, employee_id, date, report_text, manager_id)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (employee_id, date) 
       DO UPDATE SET report_text = EXCLUDED.report_text, manager_id = EXCLUDED.manager_id, created_at = NOW()
       RETURNING *`,
            [companyId, employee_id, date, report_text, manager_id]
        );

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Submit DPR error:', error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get DPRs (Filters: employee_id, manager_id, from_date, to_date)
exports.getDPRs = async (req, res) => {
    try {
        const { companyId } = req.params;
        const { employee_id, manager_id, from_date, to_date } = req.query;

        let query = `
      SELECT d.*, e.name as employee_name, m.name as manager_name
      FROM dpr d
      JOIN employees e ON d.employee_id = e.id
      LEFT JOIN employees m ON d.manager_id = m.id
      WHERE d.company_id = $1
    `;
        const params = [companyId];
        let count = 2;

        if (employee_id) {
            query += ` AND d.employee_id = $${count}`;
            params.push(employee_id);
            count++;
        }

        // For Managers viewing their reportees' DPRs
        if (manager_id) {
            query += ` AND d.manager_id = $${count}`;
            params.push(manager_id);
            count++;
        }

        if (from_date && to_date) {
            query += ` AND d.date >= $${count} AND d.date <= $${count + 1}`;
            params.push(from_date, to_date);
            count += 2;
        }

        query += ` ORDER BY d.date DESC`;

        const result = await pool.query(query, params);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Get DPRs error:', error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
