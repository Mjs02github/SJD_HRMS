const PDFDocument = require('pdfkit');

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

const generatePayslipPDF = (payRecord, employee, company) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: 'A4', margin: 40 });
            const buffers = [];
            doc.on('data', chunk => buffers.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);

            const monthName = MONTH_NAMES[parseInt(payRecord.month) - 1];
            const primaryColor = '#1e40af';
            const lightBg = '#f0f4ff';

            // ── Header ───────────────────────────────────────────────
            doc.rect(0, 0, doc.page.width, 80).fill(primaryColor);
            doc.fillColor('white').fontSize(18).font('Helvetica-Bold')
                .text(company.name || 'Company Name', 40, 20, { width: 400 });
            doc.fontSize(10).font('Helvetica')
                .text(`PAYSLIP FOR ${monthName.toUpperCase()} ${payRecord.year}`, 40, 48);
            doc.fillColor('white').fontSize(9)
                .text(company.address || '', doc.page.width - 200, 20, { width: 160, align: 'right' });

            doc.moveDown(4);

            // ── Employee Details ─────────────────────────────────────
            doc.rect(40, 95, doc.page.width - 80, 80).fill(lightBg).stroke('#dde6ff');
            doc.fillColor('#333').fontSize(10).font('Helvetica-Bold');

            const col1 = 55, col2 = 310;
            const rowY = 105;
            doc.text(`Employee Name:`, col1, rowY).font('Helvetica').text(employee.name || '', col1 + 110, rowY);
            doc.font('Helvetica-Bold').text(`Emp Code:`, col2, rowY).font('Helvetica').text(employee.emp_code || '', col2 + 80, rowY);

            doc.font('Helvetica-Bold').text(`Designation:`, col1, rowY + 18).font('Helvetica').text(employee.designation_name || '—', col1 + 110, rowY + 18);
            doc.font('Helvetica-Bold').text(`UAN No:`, col2, rowY + 18).font('Helvetica').text(employee.uan_no || '—', col2 + 80, rowY + 18);

            doc.font('Helvetica-Bold').text(`Department:`, col1, rowY + 36).font('Helvetica').text(employee.dept_name || '—', col1 + 110, rowY + 36);
            doc.font('Helvetica-Bold').text(`ESIC No:`, col2, rowY + 36).font('Helvetica').text(employee.esic_no || '—', col2 + 80, rowY + 36);

            doc.font('Helvetica-Bold').text(`Bank Account:`, col1, rowY + 54).font('Helvetica').text(employee.bank_account || '—', col1 + 110, rowY + 54);
            doc.font('Helvetica-Bold').text(`IFSC:`, col2, rowY + 54).font('Helvetica').text(employee.bank_ifsc || '—', col2 + 80, rowY + 54);

            // ── Attendance Summary ────────────────────────────────────
            doc.moveDown(6.5);
            doc.fontSize(11).font('Helvetica-Bold').fillColor(primaryColor).text('ATTENDANCE SUMMARY', 40, 185);
            doc.rect(40, 198, doc.page.width - 80, 28).fill('#e8edff');
            doc.fillColor('#333').fontSize(9).font('Helvetica-Bold');
            doc.text('Working Days', 55, 207);
            doc.text('Present Days', 175, 207);
            doc.text('LOP Days', 295, 207);
            doc.text('LOP Deduction', 375, 207);
            doc.font('Helvetica');
            doc.text(payRecord.working_days, 55, 220);
            doc.text(payRecord.present_days, 175, 220);
            doc.text(payRecord.lop_days, 295, 220);
            doc.text(`₹${fmt(payRecord.lop_deduction)}`, 375, 220);

            // ── Earnings & Deductions Table ──────────────────────────
            const tableTop = 240;
            doc.fontSize(11).font('Helvetica-Bold').fillColor(primaryColor);
            doc.text('EARNINGS', 40, tableTop);
            doc.text('DEDUCTIONS', 340, tableTop);

            // Column headers
            doc.rect(40, tableTop + 15, 255, 20).fill('#1e40af');
            doc.fillColor('white').fontSize(9).font('Helvetica-Bold');
            doc.text('Particulars', 50, tableTop + 21);
            doc.text('Amount (₹)', 240, tableTop + 21, { align: 'right', width: 50 });

            doc.rect(340, tableTop + 15, 215, 20).fill('#1e40af');
            doc.text('Particulars', 350, tableTop + 21);
            doc.text('Amount (₹)', 490, tableTop + 21, { align: 'right', width: 55 });

            const earnings = [
                ['Basic Salary', payRecord.basic],
                ['HRA', payRecord.hra],
                ['Allowances', payRecord.allowances],
            ];
            const deductions = [
                ['PF (Employee)', payRecord.pf_employee],
                ['ESIC (Employee)', payRecord.esic_employee],
                ['Advance Deduction', payRecord.advance_deduction],
                ['LOP Deduction', payRecord.lop_deduction],
                ['Other Deductions', payRecord.other_deductions],
            ];

            let eY = tableTop + 40;
            earnings.forEach(([label, amt], i) => {
                if (i % 2 === 0) doc.rect(40, eY - 3, 255, 18).fill('#f7f9ff');
                doc.fillColor('#333').font('Helvetica').fontSize(9);
                doc.text(label, 50, eY).text(`${fmt(amt)}`, 240, eY, { align: 'right', width: 50 });
                eY += 18;
            });

            let dY = tableTop + 40;
            deductions.forEach(([label, amt], i) => {
                if (i % 2 === 0) doc.rect(340, dY - 3, 215, 18).fill('#fff5f5');
                doc.fillColor('#333').font('Helvetica').fontSize(9);
                doc.text(label, 350, dY).text(`${fmt(amt)}`, 490, dY, { align: 'right', width: 55 });
                dY += 18;
            });

            // Totals
            const totalEarnings = parseFloat(payRecord.gross_salary) - parseFloat(payRecord.lop_deduction);
            const totalDeductions = parseFloat(payRecord.pf_employee) + parseFloat(payRecord.esic_employee) +
                parseFloat(payRecord.advance_deduction) + parseFloat(payRecord.lop_deduction) + parseFloat(payRecord.other_deductions);

            const totY = Math.max(eY, dY) + 5;
            doc.rect(40, totY, 255, 22).fill('#dde6ff');
            doc.rect(340, totY, 215, 22).fill('#ffe4e4');
            doc.fillColor('#1e40af').font('Helvetica-Bold').fontSize(10);
            doc.text('Total Earnings', 50, totY + 6).text(`${fmt(totalEarnings)}`, 240, totY + 6, { align: 'right', width: 50 });
            doc.fillColor('#dc2626');
            doc.text('Total Deductions', 350, totY + 6).text(`${fmt(totalDeductions)}`, 490, totY + 6, { align: 'right', width: 55 });

            // ── Net Salary Box ────────────────────────────────────────
            const netY = totY + 40;
            doc.rect(40, netY, doc.page.width - 80, 40).fill(primaryColor);
            doc.fillColor('white').font('Helvetica-Bold').fontSize(13);
            doc.text('NET SALARY (Take Home)', 55, netY + 12);
            doc.fontSize(16).text(`₹ ${fmt(payRecord.net_salary)}`, doc.page.width - 180, netY + 10);

            // ── Footer ────────────────────────────────────────────────
            const footY = netY + 60;
            doc.fillColor('#999').fontSize(8).font('Helvetica');
            doc.text('This is a system-generated payslip and does not require a signature.', 40, footY, { align: 'center', width: doc.page.width - 80 });
            doc.text(`Generated on ${new Date().toLocaleDateString('en-IN')} | ${company.name}`, 40, footY + 12, { align: 'center', width: doc.page.width - 80 });

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
};

const fmt = (val) => parseFloat(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

module.exports = { generatePayslipPDF };
