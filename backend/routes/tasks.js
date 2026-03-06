const express = require('express');
const router = express.Router({ mergeParams: true });
const taskController = require('../controllers/taskController');
const { authenticate, checkCompanyAccess } = require('../middlewares/auth');

router.use(authenticate, checkCompanyAccess);

router.post('/', taskController.createTask);
router.get('/', taskController.getTasks);
router.put('/:id/status', taskController.updateTaskStatus);
router.get('/mis', taskController.getTaskMIS);

module.exports = router;
