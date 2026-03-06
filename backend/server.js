require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const pool = require('./config/db');

const app = express();
const server = http.createServer(app);

// ── Socket.io for live GPS tracking ──────────────────────
const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
});

const activeEmployees = new Map(); // employeeId -> socketId

io.on('connection', (socket) => {
    console.log('📡 Socket connected:', socket.id);

    socket.on('employee:join', ({ employee_id, company_id }) => {
        socket.join(`company_${company_id}`);
        activeEmployees.set(employee_id, socket.id);
        io.to(`company_${company_id}`).emit('employee:online', { employee_id });
    });

    socket.on('employee:location', async ({ employee_id, company_id, lat, lng, accuracy, battery_lvl }) => {
        // Persist to DB
        try {
            await pool.query(
                'INSERT INTO gps_logs(employee_id, company_id, lat, lng, accuracy, battery_lvl) VALUES($1,$2,$3,$4,$5,$6)',
                [employee_id, company_id, lat, lng, accuracy, battery_lvl]
            );
        } catch (e) { console.error('GPS log error:', e.message); }

        // Broadcast to admin watchers
        io.to(`company_${company_id}`).emit('employee:location', {
            employee_id, lat, lng, accuracy, battery_lvl, timestamp: new Date()
        });
    });

    socket.on('disconnect', () => {
        for (const [empId, sockId] of activeEmployees.entries()) {
            if (sockId === socket.id) { activeEmployees.delete(empId); break; }
        }
        console.log('📴 Socket disconnected:', socket.id);
    });
});

// ── Middleware ────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────────────────
const authRoutes = require('./routes/auth');
const companyRoutes = require('./routes/companies');
const employeeRoutes = require('./routes/employees');
const attendanceRoutes = require('./routes/attendance');
const payrollRoutes = require('./routes/payroll');
const taskRoutes = require('./routes/tasks');
const dprRoutes = require('./routes/dpr');

app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/companies/:companyId/employees', employeeRoutes);
app.use('/api/companies/:companyId/attendance', attendanceRoutes);
app.use('/api/companies/:companyId/tasks', taskRoutes);
app.use('/api/companies/:companyId/dpr', dprRoutes);
app.use('/api/companies/:companyId', payrollRoutes);

// ── Health check ─────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'SJD HRMS API is running', timestamp: new Date() });
});

// ── 404 handler ───────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
});

// ── Error handler ─────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
});

// ── Start server ──────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 SJD HRMS Server running on port ${PORT}`);
    console.log(`📡 Socket.io live GPS tracking enabled`);
    console.log(`🌐 Health: http://localhost:${PORT}/api/health`);
});

module.exports = { app, io };
