const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

const sendPayslipEmail = async (toEmail, empName, month, year, pdfBuffer) => {
    const monthName = MONTH_NAMES[parseInt(month) - 1];
    await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"SJD HRMS" <noreply@sjdhrms.com>',
        to: toEmail,
        subject: `Your Payslip for ${monthName} ${year}`,
        html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e0e0e0;border-radius:8px;">
        <h2 style="color:#2563eb;margin-bottom:8px;">SJD HRMS</h2>
        <hr style="border:none;border-top:1px solid #e0e0e0;margin-bottom:16px;"/>
        <p>Dear <strong>${empName}</strong>,</p>
        <p>Please find your payslip for <strong>${monthName} ${year}</strong> attached to this email.</p>
        <p>If you have any queries regarding your payslip, please contact the HR department.</p>
        <br/>
        <p style="color:#666;font-size:13px;">This is an automated email. Please do not reply.</p>
        <p style="color:#666;font-size:13px;">© ${year} SJD HRMS</p>
      </div>
    `,
        attachments: [
            {
                filename: `Payslip_${monthName}_${year}.pdf`,
                content: pdfBuffer,
                contentType: 'application/pdf',
            },
        ],
    });
};

module.exports = { sendPayslipEmail };
