const pool = require('../config/db');

// POST /api/companies/:companyId/attendance/check-in
const checkIn = async (req, res) => {
    try {
        const { employee_id, selfie_url, lat, lng } = req.body;
        if (!employee_id) return res.status(400).json({ success: false, message: 'employee_id is required' });

        const today = new Date().toISOString().split('T')[0];

        // Check if already checked in today
        const existing = await pool.query(
            'SELECT id, check_in_time FROM attendance WHERE employee_id = $1 AND date = $2',
            [employee_id, today]
        );
        if (existing.rowCount > 0 && existing.rows[0].check_in_time) {
            return res.status(400).json({ success: false, message: 'Already checked in today' });
        }

        const result = await pool.query(
            `INSERT INTO attendance(employee_id, company_id, date, check_in_time, check_in_selfie_url, check_in_lat, check_in_lng, status)
       VALUES($1,$2,$3,NOW(),$4,$5,$6,'present')
       ON CONFLICT(employee_id, date)
       DO UPDATE SET check_in_time=NOW(), check_in_selfie_url=$4, check_in_lat=$5, check_in_lng=$6, status='present'
       RETURNING *`,
            [employee_id, req.companyId, today, selfie_url, lat, lng]
        );

        res.json({ success: true, message: 'Checked in successfully', data: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// POST /api/companies/:companyId/attendance/check-out
const checkOut = async (req, res) => {
    try {
        const { employee_id, selfie_url, lat, lng } = req.body;
        const today = new Date().toISOString().split('T')[0];

        const result = await pool.query(
            `UPDATE attendance
       SET check_out_time=NOW(), check_out_selfie_url=$1, check_out_lat=$2, check_out_lng=$3
       WHERE employee_id=$4 AND date=$5 AND company_id=$6 AND check_out_time IS NULL
       RETURNING *`,
            [selfie_url, lat, lng, employee_id, today, req.companyId]
        );

        if (result.rowCount === 0) {
            return res.status(400).json({ success: false, message: 'No check-in found for today, or already checked out' });
        }

        res.json({ success: true, message: 'Checked out successfully', data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/companies/:companyId/attendance?date=&employee_id=&month=&year=
const getAttendance = async (req, res) => {
    try {
        const { date, employee_id, month, year, page = 1, limit = 50 } = req.query;
        let query = `
      SELECT a.*, e.name AS emp_name, e.emp_code
      FROM attendance a JOIN employees e ON a.employee_id = e.id
      WHERE a.company_id = $1
    `;
        const params = [req.companyId];
        if (date) { query += ` AND a.date = $${params.length + 1}`; params.push(date); }
        if (employee_id) { query += ` AND a.employee_id = $${params.length + 1}`; params.push(employee_id); }
        if (month) { query += ` AND EXTRACT(MONTH FROM a.date) = $${params.length + 1}`; params.push(month); }
        if (year) { query += ` AND EXTRACT(YEAR FROM a.date) = $${params.length + 1}`; params.push(year); }
        query += ` ORDER BY a.date DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

        const result = await pool.query(query, params);
        res.json({ success: true, data: result.rows, count: result.rowCount, page: parseInt(page) });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/companies/:companyId/attendance/today
const getTodayAttendance = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const result = await pool.query(
            `SELECT a.*, e.name AS emp_name, e.emp_code, e.profile_photo_url
       FROM attendance a JOIN employees e ON a.employee_id = e.id
       WHERE a.company_id = $1 AND a.date = $2
       ORDER BY a.check_in_time`,
            [req.companyId, today]
        );
        res.json({ success: true, data: result.rows, date: today });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// PUT /api/companies/:companyId/attendance/:id (manual correction)
const updateAttendance = async (req, res) => {
    try {
        const { status, remarks, check_in_time, check_out_time } = req.body;
        const result = await pool.query(
            `UPDATE attendance SET status=$1, remarks=$2, check_in_time=$3, check_out_time=$4
       WHERE id=$5 AND company_id=$6 RETURNING *`,
            [status, remarks, check_in_time, check_out_time, req.params.id, req.companyId]
        );
        if (result.rowCount === 0) return res.status(404).json({ success: false, message: 'Record not found' });
        res.json({ success: true, message: 'Attendance updated', data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// POST /api/companies/:companyId/gps
const logGPS = async (req, res) => {
    try {
        const { employee_id, lat, lng, accuracy, battery_lvl } = req.body;
        await pool.query(
            `INSERT INTO gps_logs(employee_id, company_id, lat, lng, accuracy, battery_lvl) VALUES($1,$2,$3,$4,$5,$6)`,
            [employee_id, req.companyId, lat, lng, accuracy, battery_lvl]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/companies/:companyId/gps/:employeeId?date=
const getGPSHistory = async (req, res) => {
    try {
        const { date } = req.query;
        let query = `SELECT lat, lng, accuracy, battery_lvl, logged_at
                 FROM gps_logs WHERE employee_id = $1 AND company_id = $2`;
        const params = [req.params.employeeId, req.companyId];
        if (date) { query += ` AND DATE(logged_at) = $3`; params.push(date); }
        query += ' ORDER BY logged_at ASC';
        const result = await pool.query(query, params);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { checkIn, checkOut, getAttendance, getTodayAttendance, updateAttendance, logGPS, getGPSHistory };
