const express = require('express');
const router = express.Router({ mergeParams: true });
const { getDashboardData } = require('../controllers/employeeDashboardController');
const { authenticate, checkCompanyAccess } = require('../middlewares/auth');

router.use(authenticate, checkCompanyAccess);

router.get('/:employeeId', getDashboardData);

module.exports = router;
