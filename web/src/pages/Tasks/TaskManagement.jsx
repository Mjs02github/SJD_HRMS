import React, { useState, useEffect } from 'react';
import { api } from '../../contexts/AuthContext';
import {
    CheckCircle,
    Circle,
    Clock,
    Search,
    Plus,
    AlertCircle
} from 'lucide-react';

export default function TaskManagement() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');

    const companyId = 1;

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/companies/${companyId}/tasks`);
            if (res.data.success) {
                setTasks(res.data.data);
            }
        } catch (err) {
            console.error('Error fetching tasks', err);
            // Fallback
            setTasks([
                { id: 1, title: 'Quarterly Audit Report', assigned_to: 'John Doe', priority: 'high', status: 'not_started', due_date: '2026-03-15' },
                { id: 2, title: 'Update HR Handbooks', assigned_to: 'Jane Smith', priority: 'medium', status: 'partially_complete', due_date: '2026-03-20' },
                { id: 3, title: 'Process March Payroll', assigned_to: 'John Doe', priority: 'urgent', status: 'complete', due_date: '2026-03-05' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        if (status === 'complete') return <CheckCircle className="text-success" size={18} />;
        if (status === 'partially_complete') return <Clock className="text-warning" size={18} />;
        return <Circle className="text-muted" size={18} />;
    };

    const getStatusBadge = (status) => {
        if (status === 'complete') return <span className="badge badge-success">Completed</span>;
        if (status === 'partially_complete') return <span className="badge badge-warning">Partially Complete</span>;
        return <span className="badge">Not Started</span>;
    };

    const getPriorityBadge = (priority) => {
        if (priority === 'urgent') return <span className="badge badge-danger">Urgent</span>;
        if (priority === 'high') return <span className="badge badge-warning">High</span>;
        return <span className="badge badge-info text-capitalize">{priority}</span>;
    };

    return (
        <div className="animate-fade-in">
            <div className="flex-between mb-6">
                <div>
                    <h1 className="title-lg mb-1 flex items-center gap-2">
                        <CheckCircle className="text-primary" size={32} /> Task Management
                    </h1>
                    <p className="subtitle">Assign tasks to employees and track completion status</p>
                </div>
                <button className="btn btn-primary flex items-center gap-2">
                    <Plus size={18} /> Create Task
                </button>
            </div>

            <div className="glass-card mb-6" style={{ padding: '1rem' }}>
                <div className="flex gap-4 items-end">
                    <div className="input-wrapper" style={{ margin: 0, flex: 2 }}>
                        <Search className="input-icon" size={18} />
                        <input type="text" className="input-field with-icon" placeholder="Search tasks by title or assignee..." />
                    </div>
                    <div className="input-group" style={{ margin: 0, flex: 1 }}>
                        <select className="input-field" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                            <option value="all">All Statuses</option>
                            <option value="not_started">Not Started</option>
                            <option value="partially_complete">Partially Complete</option>
                            <option value="complete">Completed</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="glass-card">
                {loading ? (
                    <div className="flex-center" style={{ padding: '4rem' }}>
                        <div className="spinner spinner-primary"></div>
                    </div>
                ) : (
                    <div className="table-container">
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: 'rgba(241, 245, 249, 0.5)', borderBottom: '1px solid var(--border-light)' }}>
                                    <th style={{ padding: '1rem', width: '40px' }}></th>
                                    <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Task Title</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Assigned To</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Priority</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Due Date</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.filter(t => filterStatus === 'all' || t.status === filterStatus).map(task => (
                                    <tr key={task.id} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.2s' }} className="hover:bg-slate-50">
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            {getStatusIcon(task.status)}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{task.title}</div>
                                            {task.status === 'not_started' && <div className="text-xs text-danger mt-1">Pending action for 3 days</div>}
                                        </td>
                                        <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                                            {task.assigned_to}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            {getPriorityBadge(task.priority)}
                                        </td>
                                        <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                            {task.due_date}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            {getStatusBadge(task.status)}
                                        </td>
                                    </tr>
                                ))}
                                {tasks.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="text-center text-muted py-8">
                                            <AlertCircle className="mx-auto mb-2 opacity-50" size={32} />
                                            No tasks found. Create one to get started!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
