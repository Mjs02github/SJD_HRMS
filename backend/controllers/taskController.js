const pool = require('../config/db');

// Create a Task (Self or Assigned)
exports.createTask = async (req, res) => {
    try {
        const { companyId } = req.params;
        const { title, description, assigned_to, due_date } = req.body;

        // In actual implementation, req.user will contain the logged in user id.
        // For now, assume we find the employee based on the user's email or it's passed directly.
        // assigned_by should ideally come from the authenticated employee's ID.
        // Let's assume the frontend passes `assigned_by` for now.
        const { assigned_by } = req.body;

        if (!title || !assigned_to) {
            return res.status(400).json({ success: false, message: 'Title and assigned_to are required' });
        }

        const result = await pool.query(
            `INSERT INTO tasks (company_id, title, description, assigned_to, assigned_by, due_date)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [companyId, title, description, assigned_to, assigned_by, due_date]
        );

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Create task error:', error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get Tasks (Filters: assigned_to, assigned_by, status)
exports.getTasks = async (req, res) => {
    try {
        const { companyId } = req.params;
        const { assigned_to, assigned_by, status } = req.query;

        let query = `
      SELECT t.*, 
             e_to.name as assigned_to_name, 
             e_by.name as assigned_by_name
      FROM tasks t
      LEFT JOIN employees e_to ON t.assigned_to = e_to.id
      LEFT JOIN employees e_by ON t.assigned_by = e_by.id
      WHERE t.company_id = $1
    `;
        const params = [companyId];
        let count = 2;

        if (assigned_to) {
            query += ` AND t.assigned_to = $${count}`;
            params.push(assigned_to);
            count++;
        }
        if (assigned_by) {
            query += ` AND t.assigned_by = $${count}`;
            params.push(assigned_by);
            count++;
        }
        if (status) {
            query += ` AND t.status = $${count}`;
            params.push(status);
            count++;
        }

        query += ` ORDER BY t.due_date ASC NULLS LAST`;

        const result = await pool.query(query, params);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Get tasks error:', error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update Task Status
exports.updateTaskStatus = async (req, res) => {
    try {
        const { companyId, id } = req.params;
        const { status } = req.body; // not_started, partially_complete, complete

        if (!status) {
            return res.status(400).json({ success: false, message: 'Status is required' });
        }

        const result = await pool.query(
            `UPDATE tasks 
       SET status = $1, updated_at = NOW() 
       WHERE id = $2 AND company_id = $3 RETURNING *`,
            [status, id, companyId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Update task error:', error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Task MIS (For a Manager to see their team's tasks)
exports.getTaskMIS = async (req, res) => {
    try {
        const { companyId } = req.params;
        const { manager_id } = req.query; // The manager whose team we are looking at

        if (!manager_id) {
            return res.status(400).json({ success: false, message: 'manager_id is required for MIS' });
        }

        // Get stats for all reportees of this manager
        const result = await pool.query(
            `SELECT 
        e.id as employee_id, e.name as employee_name,
        COUNT(t.id) as total_tasks,
        SUM(CASE WHEN t.status = 'complete' THEN 1 ELSE 0 END) as completed_tasks,
        SUM(CASE WHEN t.status = 'partially_complete' THEN 1 ELSE 0 END) as partial_tasks,
        SUM(CASE WHEN t.status = 'not_started' THEN 1 ELSE 0 END) as not_started_tasks,
        SUM(CASE WHEN t.status != 'complete' AND t.due_date < CURRENT_DATE THEN 1 ELSE 0 END) as overdue_tasks
       FROM employees e
       LEFT JOIN tasks t ON e.id = t.assigned_to
       WHERE e.manager_id = $1 AND e.company_id = $2 AND e.status = 'active'
       GROUP BY e.id, e.name
       ORDER BY e.name`,
            [manager_id, companyId]
        );

        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Task MIS error:', error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
