const pool = require('../config/db');
const { generatePayslipPDF } = require('../services/pdfService');
const { sendPayslipEmail } = require('../services/emailService');

// Helper: calculate PF & ESIC
const calcStatutory = (basic, gross, pfApplicable, esicApplicable) => {
    let pf_employee = 0, pf_employer = 0, esic_employee = 0, esic_employer = 0;
    if (pfApplicable) {
        pf_employee = Math.round(basic * 0.12);
        pf_employer = Math.round(basic * 0.13); // 12% PF + 1% admin
    }
    if (esicApplicable && gross <= 21000) {
        esic_employee = Math.round(gross * 0.0075);
        esic_employer = Math.round(gross * 0.0325);
    }
    return { pf_employee, pf_employer, esic_employee, esic_employer };
};

// POST /api/companies/:companyId/payroll/run
const runPayroll = async (req, res) => {
    try {
        const { month, year, working_days = 26 } = req.body;
        const companyId = req.companyId;

        if (!month || !year) return res.status(400).json({ success: false, message: 'month and year are required' });

        // Get all active employees
        const employees = await pool.query(
            `SELECT * FROM employees WHERE company_id = $1 AND status = 'active'`,
            [companyId]
        );

        // Check email setting
        const settingRes = await pool.query(
            `SELECT value FROM hr_settings WHERE company_id = $1 AND key = 'send_payslip_email'`,
            [companyId]
        );
        const sendEmail = settingRes.rows[0]?.value === 'true';

        const results = [];

        for (const emp of employees.rows) {
            // Count attendance
            const attResult = await pool.query(
                `SELECT COUNT(*) FILTER (WHERE status = 'present') AS present_days,
                COUNT(*) FILTER (WHERE status = 'half_day') AS half_days
         FROM attendance
         WHERE employee_id = $1 AND EXTRACT(MONTH FROM date) = $2 AND EXTRACT(YEAR FROM date) = $3`,
                [emp.id, month, year]
            );
            const att = attResult.rows[0];
            const present_days = parseFloat(att.present_days) + parseFloat(att.half_days) * 0.5;
            const lop_days = Math.max(0, working_days - present_days);
            const lop_deduction = (emp.gross_salary / working_days) * lop_days;

            // Get pending advance balance
            const advRes = await pool.query(
                `SELECT COALESCE(SUM(amount - recovered_amount), 0) AS pending
         FROM advance_payments WHERE employee_id = $1 AND company_id = $2 AND status != 'recovered'`,
                [emp.id, companyId]
            );
            const advancePending = parseFloat(advRes.rows[0].pending);

            // Determine advance deduction for this month
            let advance_deduction = 0;
            const advDetails = await pool.query(
                `SELECT * FROM advance_payments WHERE employee_id = $1 AND company_id = $2 AND status != 'recovered' ORDER BY date`,
                [emp.id, companyId]
            );
            for (const adv of advDetails.rows) {
                const remaining = parseFloat(adv.amount) - parseFloat(adv.recovered_amount);
                if (remaining <= 0) continue;
                if (adv.deduction_mode === 'full') {
                    advance_deduction += remaining;
                } else {
                    advance_deduction += Math.min(parseFloat(adv.monthly_deduction || 0), remaining);
                }
            }

            const { pf_employee, pf_employer, esic_employee, esic_employer } = calcStatutory(
                emp.basic_salary, emp.gross_salary, emp.pf_applicable, emp.esic_applicable
            );

            const net_salary = Math.max(0,
                emp.gross_salary - lop_deduction - pf_employee - esic_employee - advance_deduction
            );

            // Upsert payroll record
            const payResult = await pool.query(
                `INSERT INTO payroll(employee_id, company_id, month, year, basic, gross_salary, working_days,
          present_days, lop_days, lop_deduction, pf_employee, pf_employer, esic_employee, esic_employer,
          advance_deduction, net_salary)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
         ON CONFLICT(employee_id, month, year) DO UPDATE SET
           present_days=$8, lop_days=$9, lop_deduction=$10, pf_employee=$11, pf_employer=$12,
           esic_employee=$13, esic_employer=$14, advance_deduction=$15, net_salary=$16
         RETURNING *`,
                [emp.id, companyId, month, year, emp.basic_salary, emp.gross_salary, working_days,
                    present_days, lop_days, lop_deduction.toFixed(2), pf_employee, pf_employer,
                    esic_employee, esic_employer, advance_deduction.toFixed(2), net_salary.toFixed(2)]
            );

            const payRecord = payResult.rows[0];

            // Update PF records
            await pool.query(
                `INSERT INTO pf_records(employee_id, company_id, month, year, uan_no, epf_wages, eps_wages, epf_contri, eps_contri)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT(employee_id,month,year) DO UPDATE SET epf_contri=$8, eps_contri=$9`,
                [emp.id, companyId, month, year, emp.uan_no, emp.basic_salary, emp.basic_salary, pf_employee, Math.round(emp.basic_salary * 0.0833)]
            );

            // Update ESIC records
            if (emp.esic_applicable && emp.gross_salary <= 21000) {
                await pool.query(
                    `INSERT INTO esic_records(employee_id, company_id, month, year, gross_wages, employee_contri, employer_contri)
           VALUES($1,$2,$3,$4,$5,$6,$7)
           ON CONFLICT(employee_id,month,year) DO UPDATE SET employee_contri=$6, employer_contri=$7`,
                    [emp.id, companyId, month, year, emp.gross_salary, esic_employee, esic_employer]
                );
            }

            // Update advance recovery
            if (advance_deduction > 0) {
                let remaining_deduction = advance_deduction;
                for (const adv of advDetails.rows) {
                    if (remaining_deduction <= 0) break;
                    const adv_remaining = parseFloat(adv.amount) - parseFloat(adv.recovered_amount);
                    if (adv_remaining <= 0) continue;
                    const this_deduction = Math.min(remaining_deduction, adv_remaining);
                    const new_recovered = parseFloat(adv.recovered_amount) + this_deduction;
                    const new_status = new_recovered >= parseFloat(adv.amount) ? 'recovered' : 'partial';
                    await pool.query(
                        `UPDATE advance_payments SET recovered_amount=$1, status=$2 WHERE id=$3`,
                        [new_recovered.toFixed(2), new_status, adv.id]
                    );
                    remaining_deduction -= this_deduction;
                }
            }

            // Send payslip email if enabled
            if (sendEmail && emp.email) {
                try {
                    const company = await pool.query('SELECT * FROM companies WHERE id = $1', [companyId]);
                    const pdfBuffer = await generatePayslipPDF(payRecord, emp, company.rows[0]);
                    await sendPayslipEmail(emp.email, emp.name, month, year, pdfBuffer);
                    await pool.query('UPDATE payroll SET email_sent = TRUE WHERE id = $1', [payRecord.id]);
                } catch (mailErr) {
                    console.error(`Email failed for ${emp.name}:`, mailErr.message);
                }
            }

            results.push({ emp_code: emp.emp_code, name: emp.name, net_salary: net_salary.toFixed(2) });
        }

        res.json({ success: true, message: `Payroll processed for ${results.length} employees`, data: results });
    } catch (err) {
        console.error('Payroll error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/companies/:companyId/payroll?month=&year=
const getPayroll = async (req, res) => {
    try {
        const { month, year, employee_id } = req.query;
        let query = `
      SELECT p.*, e.name AS emp_name, e.emp_code, e.bank_account, e.bank_ifsc
      FROM payroll p JOIN employees e ON p.employee_id = e.id
      WHERE p.company_id = $1
    `;
        const params = [req.companyId];
        if (month) { query += ` AND p.month = $${params.length + 1}`; params.push(month); }
        if (year) { query += ` AND p.year = $${params.length + 1}`; params.push(year); }
        if (employee_id) { query += ` AND p.employee_id = $${params.length + 1}`; params.push(employee_id); }
        query += ' ORDER BY e.name';

        const result = await pool.query(query, params);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// POST /api/companies/:companyId/payroll/send-email
const sendPayslipManual = async (req, res) => {
    try {
        const { payroll_id } = req.body;
        const payRes = await pool.query(
            `SELECT p.*, e.name, e.email, e.emp_code FROM payroll p JOIN employees e ON p.employee_id = e.id WHERE p.id = $1`,
            [payroll_id]
        );
        if (payRes.rowCount === 0) return res.status(404).json({ success: false, message: 'Payroll record not found' });

        const pay = payRes.rows[0];
        const empRes = await pool.query('SELECT * FROM employees WHERE id = $1', [pay.employee_id]);
        const companyRes = await pool.query('SELECT * FROM companies WHERE id = $1', [req.companyId]);

        const pdfBuffer = await generatePayslipPDF(pay, empRes.rows[0], companyRes.rows[0]);
        await sendPayslipEmail(pay.email, pay.name, pay.month, pay.year, pdfBuffer);
        await pool.query('UPDATE payroll SET email_sent = TRUE WHERE id = $1', [payroll_id]);

        res.json({ success: true, message: `Payslip emailed to ${pay.email}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to send email' });
    }
};

// PUT /api/companies/:companyId/payroll/:id/mark-paid
const markPaid = async (req, res) => {
    try {
        await pool.query(
            `UPDATE payroll SET status = 'paid', paid_at = NOW() WHERE id = $1 AND company_id = $2`,
            [req.params.id, req.companyId]
        );
        res.json({ success: true, message: 'Marked as paid' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { runPayroll, getPayroll, sendPayslipManual, markPaid };
