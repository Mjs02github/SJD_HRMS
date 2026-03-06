const pool = require('../config/db');

// GET /api/companies  (super_admin: all | others: their assigned ones)
const getCompanies = async (req, res) => {
    try {
        let result;
        if (req.user.role === 'super_admin') {
            result = await pool.query('SELECT * FROM companies ORDER BY name');
        } else {
            result = await pool.query(
                `SELECT c.* FROM companies c
         JOIN user_companies uc ON c.id = uc.company_id
         WHERE uc.user_id = $1
         ORDER BY c.name`,
                [req.user.id]
            );
        }
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/companies/:id
const getCompany = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM companies WHERE id = $1', [req.params.id]);
        if (result.rowCount === 0) return res.status(404).json({ success: false, message: 'Company not found' });
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// POST /api/companies  (super_admin only)
const createCompany = async (req, res) => {
    try {
        const { name, logo_url, pan, gstin, pf_reg_no, esic_reg_no, address, email, phone } = req.body;
        if (!name) return res.status(400).json({ success: false, message: 'Company name is required' });

        const result = await pool.query(
            `INSERT INTO companies(name, logo_url, pan, gstin, pf_reg_no, esic_reg_no, address, email, phone)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
            [name, logo_url, pan, gstin, pf_reg_no, esic_reg_no, address, email, phone]
        );

        // Default HR settings
        const companyId = result.rows[0].id;
        await pool.query(
            `INSERT INTO hr_settings(company_id, key, value) VALUES($1,'send_payslip_email','false') ON CONFLICT DO NOTHING`,
            [companyId]
        );

        res.status(201).json({ success: true, message: 'Company created', data: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// PUT /api/companies/:id  (super_admin only)
const updateCompany = async (req, res) => {
    try {
        const { name, logo_url, pan, gstin, pf_reg_no, esic_reg_no, address, email, phone } = req.body;
        const result = await pool.query(
            `UPDATE companies SET name=$1, logo_url=$2, pan=$3, gstin=$4, pf_reg_no=$5,
       esic_reg_no=$6, address=$7, email=$8, phone=$9 WHERE id=$10 RETURNING *`,
            [name, logo_url, pan, gstin, pf_reg_no, esic_reg_no, address, email, phone, req.params.id]
        );
        if (result.rowCount === 0) return res.status(404).json({ success: false, message: 'Company not found' });
        res.json({ success: true, message: 'Company updated', data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/companies/:id/settings
const getSettings = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT key, value FROM hr_settings WHERE company_id = $1',
            [req.params.id]
        );
        const settings = {};
        result.rows.forEach(r => { settings[r.key] = r.value; });
        res.json({ success: true, data: settings });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// PUT /api/companies/:id/settings
const updateSetting = async (req, res) => {
    try {
        const { key, value } = req.body;
        await pool.query(
            `INSERT INTO hr_settings(company_id, key, value) VALUES($1,$2,$3)
       ON CONFLICT(company_id, key) DO UPDATE SET value = $3`,
            [req.params.id, key, value]
        );
        res.json({ success: true, message: `Setting '${key}' updated` });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { getCompanies, getCompany, createCompany, updateCompany, getSettings, updateSetting };
