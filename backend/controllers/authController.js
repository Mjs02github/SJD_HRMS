const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// POST /api/auth/login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        // Find user
        const result = await pool.query(
            `SELECT u.*, 
        array_agg(uc.company_id) AS company_ids
       FROM users u
       LEFT JOIN user_companies uc ON u.id = uc.user_id
       WHERE u.email = $1
       GROUP BY u.id`,
            [email.toLowerCase()]
        );

        if (result.rowCount === 0) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const user = result.rows[0];

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                company_ids: user.company_ids.filter(Boolean),
            },
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// POST /api/auth/register (Super Admin only creates other users)
const register = async (req, res) => {
    try {
        const { name, email, password, role = 'hr', company_ids = [] } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
        }

        // Check duplicate
        const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
        if (exists.rowCount > 0) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await pool.query(
            'INSERT INTO users(name, email, password, role) VALUES($1, $2, $3, $4) RETURNING id, name, email, role',
            [name, email.toLowerCase(), hashedPassword, role]
        );

        const userId = newUser.rows[0].id;

        // Assign companies
        if (company_ids.length > 0) {
            const vals = company_ids.map((cId, i) => `($1, $${i + 2})`).join(', ');
            await pool.query(
                `INSERT INTO user_companies(user_id, company_id) VALUES ${vals}`,
                [userId, ...company_ids]
            );
        }

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            user: newUser.rows[0],
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/auth/me
const getMe = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT u.id, u.name, u.email, u.role, u.created_at,
        array_agg(uc.company_id) FILTER (WHERE uc.company_id IS NOT NULL) AS company_ids
       FROM users u
       LEFT JOIN user_companies uc ON u.id = uc.user_id
       WHERE u.id = $1
       GROUP BY u.id`,
            [req.user.id]
        );
        res.json({ success: true, user: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// POST /api/auth/change-password
const changePassword = async (req, res) => {
    try {
        const { old_password, new_password } = req.body;
        const result = await pool.query('SELECT password FROM users WHERE id = $1', [req.user.id]);
        const user = result.rows[0];

        const isMatch = await bcrypt.compare(old_password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Old password is incorrect' });
        }

        const hashed = await bcrypt.hash(new_password, 10);
        await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, req.user.id]);

        res.json({ success: true, message: 'Password changed successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { login, register, getMe, changePassword };
