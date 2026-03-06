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

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
                <div className="glass-card" style={{ padding: '1.5rem', minHeight: '350px' }}>
                    <div className="flex-between border-b pb-4 mb-4">
                        <h3 className="text-lg font-semibold m-0">Daily Attendance Trends</h3>
                        <select className="input-field py-1 text-sm bg-slate-50" style={{ width: 'auto' }}>
                            <option>This Week</option>
                            <option>This Month</option>
                        </select>
                    </div>
                    {/* Mocked Chart Area */}
                    <div className="flex-center h-full relative" style={{ minHeight: '250px' }}>
                        <div className="absolute bottom-0 w-full flex justify-between items-end px-4 h-48 gap-2">
                            {[60, 80, 40, 90, 70, 50, 85].map((h, i) => (
                                <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                                    <div
                                        className="w-full bg-primary-light rounded-t-sm transition-all group-hover:bg-primary-main"
                                        style={{ height: `${h}%` }}
                                    ></div>
                                    <span className="text-xs text-muted font-medium">Day {i + 1}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '1.5rem', minHeight: '350px' }}>
                    <div className="flex-between border-b pb-4 mb-4">
                        <h3 className="text-lg font-semibold m-0">Pending Actions</h3>
                        <span className="badge badge-warning">3 New</span>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="p-3 rounded-lg border border-slate-100 hover:border-primary-light hover:bg-slate-50 transition-colors cursor-pointer">
                            <h4 className="font-bold text-sm text-main mb-1">Leave Approval Pending</h4>
                            <p className="text-xs text-muted mb-2">Jane Smith requested 2 days Sick Leave.</p>
                            <div className="flex gap-2">
                                <button className="btn btn-primary text-xs py-1 px-3">Review</button>
                            </div>
                        </div>

                        <div className="p-3 rounded-lg border border-slate-100 hover:border-primary-light hover:bg-slate-50 transition-colors cursor-pointer">
                            <h4 className="font-bold text-sm text-main mb-1">Payroll Generation Due</h4>
                            <p className="text-xs text-muted mb-2">March salary slips need processing.</p>
                            <div className="flex gap-2">
                                <button className="btn btn-secondary text-xs py-1 px-3">Process Now</button>
                            </div>
                        </div>

                        <div className="p-3 rounded-lg border border-slate-100 hover:border-primary-light hover:bg-slate-50 transition-colors cursor-pointer">
                            <h4 className="font-bold text-sm text-main mb-1">Missing Check-outs</h4>
                            <p className="text-xs text-muted mb-2">5 employees did not check out yesterday.</p>
                            <div className="flex gap-2">
                                <button className="btn btn-secondary text-xs py-1 px-3">Send Reminder</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
