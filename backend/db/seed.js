/**
 * Seed Script: Creates the initial Super Admin user
 * Run: node backend/db/seed.js
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function seed() {
    try {
        console.log('🌱 Seeding database...');

        const email = 'admin@sjdhrms.com';
        const password = 'Admin@123';
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert super admin
        await pool.query(
            `INSERT INTO users(name, email, password, role)
       VALUES('Super Admin', $1, $2, 'super_admin')
       ON CONFLICT(email) DO NOTHING`,
            [email, hashedPassword]
        );

        // Insert a demo company
        const compResult = await pool.query(
            `INSERT INTO companies(name, pan, pf_reg_no, esic_reg_no, email, phone)
       VALUES('Demo Company Pvt Ltd', 'AAAAA1234A', 'MH/1234/56789', '1234567890', 'hr@demo.com', '9999999999')
       ON CONFLICT DO NOTHING RETURNING id`
        );

        if (compResult.rowCount > 0) {
            const compId = compResult.rows[0].id;
            // Default HR settings
            await pool.query(
                `INSERT INTO hr_settings(company_id, key, value) VALUES($1,'send_payslip_email','false') ON CONFLICT DO NOTHING`,
                [compId]
            );
            // Grant super admin access to company
            const adminRes = await pool.query(`SELECT id FROM users WHERE email = $1`, [email]);
            if (adminRes.rowCount > 0) {
                await pool.query(
                    `INSERT INTO user_companies(user_id, company_id) VALUES($1,$2) ON CONFLICT DO NOTHING`,
                    [adminRes.rows[0].id, compId]
                );
            }
        }

        console.log('✅ Seed complete!');
        console.log('');
        console.log('  📧 Admin Email:    admin@sjdhrms.com');
        console.log('  🔑 Admin Password: Admin@123');
        console.log('');
        console.log('  ⚠️  CHANGE THE PASSWORD AFTER FIRST LOGIN!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seed failed:', err.message);
        process.exit(1);
    }
}

seed();
