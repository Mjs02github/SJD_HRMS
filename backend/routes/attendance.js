const express = require('express');
const router = express.Router({ mergeParams: true });
const att = require('../controllers/attendanceController');
const { authenticate, checkCompanyAccess } = require('../middlewares/auth');

router.use(authenticate, checkCompanyAccess);

router.post('/check-in', att.checkIn);
router.post('/check-out', att.checkOut);
router.get('/', att.getAttendance);
router.get('/today', att.getTodayAttendance);
router.put('/:id', att.updateAttendance);

// GPS
router.post('/gps', att.logGPS);
router.get('/gps/:employeeId', att.getGPSHistory);

module.exports = router;
