const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// Verify JWT token
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Access token required' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user info to request
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};

// Check if user has role-level access
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Access denied: insufficient permissions' });
        }
        next();
    };
};

// Verify user has access to the requested company
const checkCompanyAccess = async (req, res, next) => {
    try {
        const companyId = parseInt(req.params.companyId || req.body.company_id || req.query.company_id);
        if (!companyId) {
            return res.status(400).json({ success: false, message: 'company_id is required' });
        }

        // Super admin has access to all companies
        if (req.user.role === 'super_admin') {
            req.companyId = companyId;
            return next();
        }

        // Check user_companies mapping
        const result = await pool.query(
            'SELECT 1 FROM user_companies WHERE user_id = $1 AND company_id = $2',
            [req.user.id, companyId]
        );

        if (result.rowCount === 0) {
            return res.status(403).json({ success: false, message: 'You do not have access to this company' });
        }

        req.companyId = companyId;
        next();
    } catch (err) {
        console.error('Company access check error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { authenticate, authorize, checkCompanyAccess };
