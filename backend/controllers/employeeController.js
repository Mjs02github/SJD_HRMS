const pool = require('../config/db');

// GET /api/companies/:companyId/employees
const getEmployees = async (req, res) => {
    try {
        const { companyId } = req;
        const { dept_id, status = 'active', search } = req.query;

        let query = `
      SELECT e.*, d.name AS dept_name, ds.name AS designation_name,
             m.name AS manager_name
      FROM employees e
      LEFT JOIN departments d ON e.dept_id = d.id
      LEFT JOIN designations ds ON e.designation_id = ds.id
      LEFT JOIN employees m ON e.manager_id = m.id
      WHERE e.company_id = $1 AND e.status = $2
    `;
        const params = [companyId, status];

        if (dept_id) { query += ` AND e.dept_id = $${params.length + 1}`; params.push(dept_id); }
        if (search) {
            query += ` AND (e.name ILIKE $${params.length + 1} OR e.emp_code ILIKE $${params.length + 1} OR e.phone ILIKE $${params.length + 1})`;
            params.push(`%${search}%`);
        }
        query += ' ORDER BY e.name';

        const result = await pool.query(query, params);
        res.json({ success: true, data: result.rows, count: result.rowCount });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/companies/:companyId/employees/:id
const getEmployee = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT e.*, d.name AS dept_name, ds.name AS designation_name, m.name AS manager_name
       FROM employees e
       LEFT JOIN departments d ON e.dept_id = d.id
       LEFT JOIN designations ds ON e.designation_id = ds.id
       LEFT JOIN employees m ON e.manager_id = m.id
       WHERE e.id = $1 AND e.company_id = $2`,
            [req.params.id, req.companyId]
        );
        if (result.rowCount === 0) return res.status(404).json({ success: false, message: 'Employee not found' });
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// POST /api/companies/:companyId/employees
const createEmployee = async (req, res) => {
    try {
        const {
            emp_code, name, email, phone, dept_id, designation_id, manager_id,
            doj, basic_salary, gross_salary, pf_applicable = true, esic_applicable = true,
            uan_no, esic_no, aadhar_no, pan_no, bank_account, bank_ifsc, bank_name
        } = req.body;

        if (!emp_code || !name) {
            return res.status(400).json({ success: false, message: 'emp_code and name are required' });
        }

        const result = await pool.query(
            `INSERT INTO employees(
        company_id, emp_code, name, email, phone, dept_id, designation_id, manager_id,
        doj, basic_salary, gross_salary, pf_applicable, esic_applicable,
        uan_no, esic_no, aadhar_no, pan_no, bank_account, bank_ifsc, bank_name
      ) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
      RETURNING *`,
            [
                req.companyId, emp_code, name, email, phone, dept_id, designation_id, manager_id,
                doj, basic_salary, gross_salary, pf_applicable, esic_applicable,
                uan_no, esic_no, aadhar_no, pan_no, bank_account, bank_ifsc, bank_name
            ]
        );
        res.status(201).json({ success: true, message: 'Employee created', data: result.rows[0] });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ success: false, message: 'Employee code already exists in this company' });
        }
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// PUT /api/companies/:companyId/employees/:id
const updateEmployee = async (req, res) => {
    try {
        const {
            name, email, phone, dept_id, designation_id, manager_id, doj,
            basic_salary, gross_salary, pf_applicable, esic_applicable,
            uan_no, esic_no, aadhar_no, pan_no, bank_account, bank_ifsc, bank_name,
            profile_photo_url, status
        } = req.body;

        const result = await pool.query(
            `UPDATE employees SET
        name=$1, email=$2, phone=$3, dept_id=$4, designation_id=$5, manager_id=$6, doj=$7,
        basic_salary=$8, gross_salary=$9, pf_applicable=$10, esic_applicable=$11,
        uan_no=$12, esic_no=$13, aadhar_no=$14, pan_no=$15, bank_account=$16,
        bank_ifsc=$17, bank_name=$18, profile_photo_url=$19, status=$20
       WHERE id=$21 AND company_id=$22 RETURNING *`,
            [
                name, email, phone, dept_id, designation_id, manager_id, doj,
                basic_salary, gross_salary, pf_applicable, esic_applicable,
                uan_no, esic_no, aadhar_no, pan_no, bank_account, bank_ifsc, bank_name,
                profile_photo_url, status, req.params.id, req.companyId
            ]
        );
        if (result.rowCount === 0) return res.status(404).json({ success: false, message: 'Employee not found' });
        res.json({ success: true, message: 'Employee updated', data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// DELETE (soft) /api/companies/:companyId/employees/:id
const deactivateEmployee = async (req, res) => {
    try {
        await pool.query(
            `UPDATE employees SET status = 'inactive' WHERE id = $1 AND company_id = $2`,
            [req.params.id, req.companyId]
        );
        res.json({ success: true, message: 'Employee deactivated' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/companies/:companyId/departments
const getDepartments = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM departments WHERE company_id = $1 ORDER BY name',
            [req.companyId]
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// POST /api/companies/:companyId/departments
const createDepartment = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ success: false, message: 'Department name required' });
        const result = await pool.query(
            'INSERT INTO departments(company_id, name) VALUES($1,$2) RETURNING *',
            [req.companyId, name]
        );
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/companies/:companyId/designations
const getDesignations = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM designations WHERE company_id = $1 ORDER BY name',
            [req.companyId]
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// POST /api/companies/:companyId/designations
const createDesignation = async (req, res) => {
    try {
        const { name } = req.body;
        const result = await pool.query(
            'INSERT INTO designations(company_id, name) VALUES($1,$2) RETURNING *',
            [req.companyId, name]
        );
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    getEmployees, getEmployee, createEmployee, updateEmployee, deactivateEmployee,
    getDepartments, createDepartment, getDesignations, createDesignation
};
