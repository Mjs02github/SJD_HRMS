const express = require('express');
const router = express.Router();
const comp = require('../controllers/companyController');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate);

router.get('/', comp.getCompanies);
router.get('/:id', comp.getCompany);
router.post('/', authorize('super_admin'), comp.createCompany);
router.put('/:id', authorize('super_admin'), comp.updateCompany);

// HR Settings per company
router.get('/:id/settings', comp.getSettings);
router.put('/:id/settings', authorize('super_admin', 'hr'), comp.updateSetting);

module.exports = router;
