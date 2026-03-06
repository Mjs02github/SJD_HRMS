const express = require('express');
const router = express.Router();
const { login, register, getMe, changePassword, employeeLogin } = require('../controllers/authController');
const { authenticate, authorize } = require('../middlewares/auth');

router.post('/login', login);
router.post('/employee-login', employeeLogin);
router.post('/register', authenticate, authorize('super_admin'), register);
router.get('/me', authenticate, getMe);
router.put('/change-password', authenticate, changePassword);

module.exports = router;
