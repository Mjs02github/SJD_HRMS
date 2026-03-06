import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Users, Building2, CalendarDays, Wallet } from 'lucide-react';

export default function AdminDashboard() {
    const { user } = useAuth();

    // Dummy data for now until we hook up the backend overview API
    const stats = [
        { title: 'Total Employees', value: '142', icon: Users, color: 'var(--primary)' },
        { title: 'Active Companies', value: '5', icon: Building2, color: 'var(--secondary)' },
        { title: 'Present Today', value: '128', icon: CalendarDays, color: 'var(--secondary-dark)' },
        { title: 'Total Payroll (Est)', value: '₹ 12.5 L', icon: Wallet, color: 'var(--accent)' }
    ];

    return (
        <div className="animate-fade-in">
            <div className="flex-between mb-6">
                <div>
                    <h1 className="title-lg mb-1">Overview Dashboard</h1>
                    <p className="subtitle">Welcome back, {user?.name}</p>
                </div>
            </div>

            {/* Top Stats Array */}
            <div className="dashboard-grid">
                {stats.map((stat, idx) => (
                    <div key={idx} className="glass-card stat-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div
                            style={{
                                width: '60px', height: '60px', borderRadius: '1rem',
                                background: `${stat.color}15`, color: stat.color,
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                        >
                            <stat.icon size={28} />
                        </div>
                        <div>
                            <p className="text-muted font-medium text-sm mb-1">{stat.title}</p>
                            <h3 style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0, lineHeight: 1 }}>{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                <div className="glass-card" style={{ padding: '1.5rem', minHeight: '350px' }}>
                    <h3 className="mb-4 text-lg font-semibold border-b pb-2">Recent Attendance Activity</h3>
                    <div className="flex-center h-full text-muted">
                        <p>Activity chart will be rendered here...</p>
                    </div>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem', minHeight: '350px' }}>
                    <h3 className="mb-4 text-lg font-semibold border-b pb-2">Alerts & Pending Actions</h3>
                    <div className="flex-center h-full text-muted">
                        <p>No pending leave requests or approvals.</p>
                    </div>
                </div>
            </div>
        </div >
    );
}
