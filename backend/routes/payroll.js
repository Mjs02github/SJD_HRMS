const express = require('express');
const router = express.Router({ mergeParams: true });
const { runPayroll, getPayroll, sendPayslipManual, markPaid } = require('../controllers/payrollController');
const { getAdvances, createAdvance, getAdvanceBalance, deleteAdvance } = require('../controllers/advanceController');
const { generateECR, previewECR } = require('../controllers/ecrController');
const { authenticate, checkCompanyAccess, authorize } = require('../middlewares/auth');

router.use(authenticate, checkCompanyAccess);

// Payroll
router.post('/payroll/run', authorize('super_admin', 'hr'), runPayroll);
router.get('/payroll', getPayroll);
router.post('/payroll/send-email', authorize('super_admin', 'hr'), sendPayslipManual);
router.put('/payroll/:id/mark-paid', authorize('super_admin', 'hr'), markPaid);

// Advances
router.get('/advances', getAdvances);
router.post('/advances', authorize('super_admin', 'hr'), createAdvance);
router.get('/advances/balance/:empId', getAdvanceBalance);
router.delete('/advances/:id', authorize('super_admin', 'hr'), deleteAdvance);

// ECR
router.get('/ecr/preview', previewECR);
router.post('/ecr/generate', authorize('super_admin', 'hr'), generateECR);

module.exports = router;
