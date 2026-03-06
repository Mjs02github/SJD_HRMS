import React, { useState, useEffect } from 'react';
import { useAuth, api } from '../contexts/AuthContext';
import {
    UserCircle,
    CalendarDays,
    TrendingUp,
    IndianRupee,
    CheckCircle2,
    Clock,
    FileText
} from 'lucide-react';
import './EmployeeDashboard.css';

export default function EmployeeDashboard() {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await api.get(`/companies/${user.company_id}/employee-dashboard/${user.id}`);
                setData(res.data.data);
            } catch (err) {
                console.error('Failed to load dashboard', err);
            } finally {
                setLoading(false);
            }
        };
        if (user?.id) fetchDashboard();
    }, [user]);

    if (loading) {
        return (
            <div className="flex-center" style={{ height: '100%', minHeight: '60vh' }}>
                <div className="spinner spinner-primary"></div>
            </div>
        );
    }

    if (!data) return <div className="app-content">Failed to load dashboard data.</div>;

    const { attendance, progress_trend, estimated_salary } = data;

    return (
        <div className="app-content animate-fade-in emp-dashboard">
            {/* Header Profile Section */}
            <div className="glass-card profile-card">
                <div className="profile-info">
                    <div className="profile-dp">
                        {user.profile_photo_url ? (
                            <img src={user.profile_photo_url} alt="DP" />
                        ) : (
                            <UserCircle size={64} className="text-light" />
                        )}
                    </div>
                    <div>
                        <h1 className="title-lg">{user.name}</h1>
                        <p className="subtitle">EMP Code: {user.emp_code} | {user.email}</p>
                    </div>
                </div>
                <div className="profile-actions">
                    <button className="btn btn-primary" onClick={() => alert('Mark Attendance Not Implemented Here')}>
                        Mark Attendance IN/OUT
                    </button>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* 1. Monthly Attendance */}
                <div className="glass-card stat-card">
                    <div className="stat-header">
                        <h3><CalendarDays className="text-primary" size={20} /> Monthly Attendance</h3>
                    </div>
                    <div className="stat-body attendance-stats">
                        <div className="stat-item">
                            <span className="stat-value text-secondary">{attendance.present}</span>
                            <span className="stat-label">Present</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value text-accent">{attendance.absent}</span>
                            <span className="stat-label">Absent</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value text-warning">{attendance.leave}</span>
                            <span className="stat-label">Leaves</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value text-info">{attendance.half_day}</span>
                            <span className="stat-label">Half Days</span>
                        </div>
                    </div>
                </div>

                {/* 2. Progress Trend */}
                <div className="glass-card stat-card">
                    <div className="stat-header">
                        <h3><TrendingUp className="text-primary" size={20} /> Progress Trend</h3>
                    </div>
                    <div className="stat-body progress-stats">
                        <div className="progress-row">
                            <div className="progress-label">
                                <FileText size={16} /> DPRs Submitted
                            </div>
                            <div className="progress-value">{progress_trend.dprs_submitted} this month</div>
                        </div>

                        <div className="tasks-breakdown mt-4">
                            <h4 className="text-sm font-semibold mb-2">My Tasks Status</h4>
                            <div className="flex-between text-sm mb-1">
                                <span>Completed</span>
                                <span className="text-secondary font-medium"><CheckCircle2 size={14} className="inline mr-1" />{progress_trend.tasks.complete}</span>
                            </div>
                            <div className="flex-between text-sm mb-1">
                                <span>In Progress</span>
                                <span className="text-warning font-medium"><Clock size={14} className="inline mr-1" />{progress_trend.tasks.partially_complete}</span>
                            </div>
                            <div className="flex-between text-sm">
                                <span>Pending</span>
                                <span className="text-muted font-medium"><Clock size={14} className="inline mr-1" />{progress_trend.tasks.not_started}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Estimated Salary Widget */}
                <div className="glass-card stat-card salary-card">
                    <div className="stat-header">
                        <h3><IndianRupee className="text-secondary" size={20} /> Estimated Salary</h3>
                        <span className="badge badge-success">Live</span>
                    </div>
                    <div className="stat-body">
                        <p className="text-sm text-muted mb-2">Pro-rated based on {estimated_salary.present_days} working days so far.</p>
                        <div className="salary-amount text-gradient">
                            ₹ {estimated_salary.estimated_amount.toLocaleString('en-IN')}
                        </div>
                        <div className="salary-progress mt-4">
                            <div className="flex-between text-xs text-muted mb-1">
                                <span>0</span>
                                <span>Max: ₹{estimated_salary.gross_salary.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${Math.min(100, (estimated_salary.estimated_amount / estimated_salary.gross_salary) * 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
