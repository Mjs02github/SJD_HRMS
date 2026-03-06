import React, { useState, useEffect } from 'react';
import { api } from '../contexts/AuthContext';
import {
    FileCheck2,
    Search,
    Check,
    X,
    Clock
} from 'lucide-react';

export default function LeaveManagement() {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);

    const companyId = 1;

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/companies/${companyId}/leaves`);
            if (res.data.success) {
                setLeaves(res.data.data);
            }
        } catch (err) {
            console.error('Error fetching leaves:', err);
            // Dummy data for visual development
            setLeaves([
                { id: 1, employee_name: 'Alice Cooper', leave_type: 'Sick Leave', start_date: '2026-03-08', end_date: '2026-03-09', status: 'pending', reason: 'Fever and cold' },
                { id: 2, employee_name: 'Bob Builder', leave_type: 'Casual Leave', start_date: '2026-03-15', end_date: '2026-03-20', status: 'approved', reason: 'Family vacation' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, status) => {
        try {
            // await api.put(\`/companies/\${companyId}/leaves/\${id}/status\`, { status });
            setLeaves(leaves.map(l => l.id === id ? { ...l, status } : l));
        } catch (err) {
            console.error('Action failed', err);
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="flex-between mb-6">
                <div>
                    <h1 className="title-lg mb-1 flex items-center gap-2">
                        <FileCheck2 className="text-primary" size={32} /> Leave Approvals
                    </h1>
                    <p className="subtitle">Review and manage employee leave applications</p>
                </div>
            </div>

            <div className="glass-card mb-6" style={{ padding: '1rem' }}>
                <div className="input-wrapper" style={{ maxWidth: '400px', margin: 0 }}>
                    <Search className="input-icon" size={18} />
                    <input type="text" className="input-field with-icon" placeholder="Search by employee name..." />
                </div>
            </div>

            <div className="glass-card">
                {loading ? (
                    <div className="flex-center" style={{ padding: '4rem' }}>
                        <div className="spinner spinner-primary"></div>
                    </div>
                ) : (
                    <div className="table-container" style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: 'rgba(241, 245, 249, 0.5)', borderBottom: '1px solid var(--border-light)' }}>
                                    <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Employee</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Leave Details</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Duration</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Status</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaves.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center text-muted" style={{ padding: '3rem' }}>
                                            No leave applications found.
                                        </td>
                                    </tr>
                                ) : (
                                    leaves.map(req => (
                                        <tr key={req.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                            <td style={{ padding: '1rem', fontWeight: 500 }}>{req.employee_name}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <span className="badge badge-info mb-1" style={{ display: 'inline-block' }}>{req.leave_type}</span>
                                                <div className="text-sm text-muted line-clamp-1" title={req.reason}>{req.reason}</div>
                                            </td>
                                            <td style={{ padding: '1rem', fontSize: '0.9rem' }}>
                                                <div>From: {req.start_date}</div>
                                                <div>To: {req.end_date}</div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                {req.status === 'pending' && <span className="badge badge-warning"><Clock size={12} className="inline mr-1" /> Pending</span>}
                                                {req.status === 'approved' && <span className="badge badge-success"><Check size={12} className="inline mr-1" /> Approved</span>}
                                                {req.status === 'rejected' && <span className="badge badge-danger"><X size={12} className="inline mr-1" /> Rejected</span>}
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                {req.status === 'pending' && (
                                                    <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
                                                        <button onClick={() => handleAction(req.id, 'approved')} className="btn btn-secondary text-success py-1 px-2" title="Approve">
                                                            <Check size={18} />
                                                        </button>
                                                        <button onClick={() => handleAction(req.id, 'rejected')} className="btn btn-secondary text-danger py-1 px-2" title="Reject">
                                                            <X size={18} />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
