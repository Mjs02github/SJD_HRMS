const pool = require('../config/db');

// GET /api/companies/:companyId/ecr?month=&year=
// Returns ECR data for preview

// POST /api/companies/:companyId/ecr/generate
// Body: { month, year, employee_ids: [id1, id2, ...] }
const generateECR = async (req, res) => {
    try {
        const { month, year, employee_ids } = req.body;
        const companyId = req.companyId;

        if (!month || !year || !employee_ids?.length) {
            return res.status(400).json({ success: false, message: 'month, year, and employee_ids are required' });
        }

        // Fetch company info
        const compRes = await pool.query('SELECT * FROM companies WHERE id = $1', [companyId]);
        const company = compRes.rows[0];

        // Fetch PF records for selected employees
        const placeholders = employee_ids.map((_, i) => `$${i + 4}`).join(',');
        const pfRes = await pool.query(
            `SELECT pf.*, e.name AS emp_name, e.uan_no, e.emp_code
       FROM pf_records pf
       JOIN employees e ON pf.employee_id = e.id
       WHERE pf.company_id = $1 AND pf.month = $2 AND pf.year = $3
       AND pf.employee_id IN (${placeholders})
       ORDER BY e.emp_code`,
            [companyId, month, year, ...employee_ids]
        );

        if (pfRes.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'No payroll/PF data found for selected employees and period. Run payroll first.' });
        }

        // Generate ECR v2.0 text content
        const MONTH_MAP = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthName = MONTH_MAP[parseInt(month) - 1];

        let ecrLines = [];

        // Header row
        ecrLines.push(`#~#${company.pf_reg_no || 'AAAAAAAAAA'}#~#${monthName}-${year}#~#`);

        // Detail rows: ECR v2.0 format
        // UAN~NAME~GROSSWAGES~EPFWAGES~EPSWAGES~NCPDAYS~REFUNDOFADV~EPFCONTRI~EPSCONTRI~EPFWAGES~NCPDAYS
        for (const row of pfRes.rows) {
            const line = [
                row.uan_no || '100000000000',         // UAN
                row.emp_name.replace(/,/g, ' '),       // NAME (no commas)
                row.epf_wages || 0,                    // GROSS WAGES
                row.epf_wages || 0,                    // EPF WAGES
                row.eps_wages || 0,                    // EPS WAGES
                row.ncp_days || 0,                     // NCP DAYS
                row.refund_adv || 0,                   // REFUND OF ADVANCES
                row.epf_contri || 0,                   // EPF CONTRIBUTION
                row.eps_contri || 0,                   // EPS CONTRIBUTION
                row.epf_wages || 0,                    // EPF EPF WAGES (repeat for v2)
                row.ncp_days || 0,                     // NCP DAYS
            ].join('#~#');
            ecrLines.push(line);
        }

        // Summary line
        const totalEPF = pfRes.rows.reduce((sum, r) => sum + parseFloat(r.epf_contri || 0), 0);
        const totalEPS = pfRes.rows.reduce((sum, r) => sum + parseFloat(r.eps_contri || 0), 0);
        ecrLines.push(`#~#Total#~#${pfRes.rowCount}#~#${totalEPF.toFixed(2)}#~#${totalEPS.toFixed(2)}#~#`);

        const ecrContent = ecrLines.join('\n');

        // Return as downloadable file
        const filename = `ECR_${company.pf_reg_no || 'XXXX'}_${monthName}_${year}.txt`;
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(ecrContent);

    } catch (err) {
        console.error('ECR generation error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/companies/:companyId/ecr/preview?month=&year=
const previewECR = async (req, res) => {
    try {
        const { month, year } = req.query;
        const result = await pool.query(
            `SELECT pf.*, e.name AS emp_name, e.uan_no, e.emp_code
       FROM pf_records pf
       JOIN employees e ON pf.employee_id = e.id
       WHERE pf.company_id = $1 AND pf.month = $2 AND pf.year = $3
       ORDER BY e.emp_code`,
            [req.companyId, month, year]
        );
        res.json({ success: true, data: result.rows, count: result.rowCount });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { generateECR, previewECR };
