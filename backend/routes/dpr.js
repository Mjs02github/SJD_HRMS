const express = require('express');
const router = express.Router({ mergeParams: true });
const dprController = require('../controllers/dprController');
const { authenticate, checkCompanyAccess } = require('../middlewares/auth');

router.use(authenticate, checkCompanyAccess);

router.post('/', dprController.submitDPR);
router.get('/', dprController.getDPRs);

module.exports = router;
