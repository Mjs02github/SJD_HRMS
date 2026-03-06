const pool = require('../config/db');

// GET /api/companies/:companyId/employee-dashboard/:employeeId
exports.getDashboardData = async (req, res) => {
    try {
        const { companyId, employeeId } = req.params;

        // Verify if employee belongs to company
        const empCheck = await pool.query(
            `SELECT basic_salary, gross_salary FROM employees WHERE id = $1 AND company_id = $2 AND status = 'active'`,
            [employeeId, companyId]
        );

        if (empCheck.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Employee not found or inactive' });
        }

        const employee = empCheck.rows[0];

        // 1. Get current month date range
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1; // 1-12
        const firstDay = new Date(year, month - 1, 1).toISOString().split('T')[0];
        const lastDay = new Date(year, month, 0).toISOString().split('T')[0];

        // 2. Attendance Summary
        const attendanceResult = await pool.query(
            `SELECT status, COUNT(*) as count 
             FROM attendance 
             WHERE employee_id = $1 AND company_id = $2 
               AND date >= $3 AND date <= $4
             GROUP BY status`,
            [employeeId, companyId, firstDay, lastDay]
        );

        const attendance = { present: 0, absent: 0, leave: 0, half_day: 0 };
        attendanceResult.rows.forEach(row => {
            if (attendance[row.status] !== undefined) {
                attendance[row.status] = parseInt(row.count, 10);
            }
        });

        // Calculate total present days (Half-day = 0.5)
        const totalPresentDays = attendance.present + (attendance.half_day * 0.5);

        // 3. DPR & Task Progress Trend
        const dprResult = await pool.query(
            `SELECT COUNT(*) as dpr_count 
             FROM dpr 
             WHERE employee_id = $1 AND company_id = $2 
               AND date >= $3 AND date <= $4`,
            [employeeId, companyId, firstDay, lastDay]
        );

        const taskResult = await pool.query(
            `SELECT status, COUNT(*) as count 
             FROM tasks 
             WHERE assigned_to = $1 AND company_id = $2 
               AND created_at >= $3 AND created_at <= $4
             GROUP BY status`,
            [employeeId, companyId, `${firstDay} 00:00:00`, `${lastDay} 23:59:59`]
        );

        const tasks = { complete: 0, partially_complete: 0, not_started: 0, total: 0 };
        taskResult.rows.forEach(row => {
            if (tasks[row.status] !== undefined) {
                tasks[row.status] = parseInt(row.count, 10);
                tasks.total += parseInt(row.count, 10);
            }
        });

        // 4. Estimated Pro-rated Salary (Basic formula: (Gross / 26) * Present Days)
        // Assume standard 26 working days in a month.
        const WORK_DAYS = 26;
        let estimatedSalary = 0;

        if (totalPresentDays > 0) {
            estimatedSalary = (parseFloat(employee.gross_salary) / WORK_DAYS) * totalPresentDays;
        }

        res.json({
            success: true,
            data: {
                attendance,
                progress_trend: {
                    dprs_submitted: parseInt(dprResult.rows[0].dpr_count, 10),
                    tasks
                },
                estimated_salary: {
                    gross_salary: parseFloat(employee.gross_salary),
                    present_days: totalPresentDays,
                    estimated_amount: parseFloat(estimatedSalary.toFixed(2))
                }
            }
        });

    } catch (error) {
        console.error('Employee Dashboard error:', error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
