const express = require('express');
const router = express.Router({ mergeParams: true });
const emp = require('../controllers/employeeController');
const { authenticate, checkCompanyAccess } = require('../middlewares/auth');

router.use(authenticate, checkCompanyAccess);

// Employees
router.get('/', emp.getEmployees);
router.get('/:id', emp.getEmployee);
router.post('/', emp.createEmployee);
router.put('/:id', emp.updateEmployee);
router.delete('/:id', emp.deactivateEmployee);

// Departments
router.get('/meta/departments', emp.getDepartments);
router.post('/meta/departments', emp.createDepartment);

// Designations
router.get('/meta/designations', emp.getDesignations);
router.post('/meta/designations', emp.createDesignation);

module.exports = router;
