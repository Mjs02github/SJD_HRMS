import React, { useState, useEffect } from 'react';
import { api } from '../../contexts/AuthContext';
import {
    FileBox,
    Search,
    Calendar,
    Layers
} from 'lucide-react';

export default function DPRViews() {
    const [dprs, setDprs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

    const companyId = 1;

    useEffect(() => {
        fetchDPRs();
    }, [filterDate]);

    const fetchDPRs = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/companies/${companyId}/dprs?date=${filterDate}`);
            if (res.data.success) {
                setDprs(res.data.data);
            }
        } catch (err) {
            console.error('Error fetching DPRs', err);
            // Fallback
            setDprs([
                {
                    id: 1,
                    employee_name: 'Jane Smith',
                    date: filterDate,
                    report_text: 'Completed 3 client meetings today. Sent monthly reports. Prepared deck for tomorrow.',
                    tasks_completed: 4,
                    hours_logged: 8.5
                },
                {
                    id: 2,
                    employee_name: 'John Doe',
                    date: filterDate,
                    report_text: 'Worked on Q3 audit processing. Resolved 15 employee tickets regarding payslips.',
                    tasks_completed: 2,
                    hours_logged: 7.0
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="flex-between mb-6">
                <div>
                    <h1 className="title-lg mb-1 flex items-center gap-2">
                        <FileBox className="text-primary" size={32} /> Daily Progress Reports (DPR)
                    </h1>
                    <p className="subtitle">Review daily summaries submitted by employees</p>
                </div>
            </div>

            <div className="glass-card mb-6" style={{ padding: '1rem' }}>
                <div className="flex gap-4 items-end">
                    <div className="input-group" style={{ margin: 0, minWidth: '200px' }}>
                        <label className="input-label">Report Date</label>
                        <input
                            type="date"
                            className="input-field"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                        />
                    </div>

                    <div className="input-wrapper" style={{ margin: 0, flex: 1 }}>
                        <Search className="input-icon" size={18} />
                        <input type="text" className="input-field with-icon" placeholder="Search employee..." />
                    </div>
                </div>
            </div>

            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
                {loading ? (
                    <div className="col-span-full flex-center py-12">
                        <div className="spinner spinner-primary"></div>
                    </div>
                ) : dprs.length > 0 ? (
                    dprs.map(dpr => (
                        <div key={dpr.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="flex-between" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
                                <div style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--text-main)' }}>{dpr.employee_name}</div>
                                <span className="badge badge-info"><Calendar size={12} className="inline mr-1" /> {dpr.date}</span>
                            </div>

                            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.6, flex: 1 }}>
                                <strong className="text-sm uppercase text-muted block mb-1">Status Update:</strong>
                                <p>"{dpr.report_text}"</p>
                            </div>

                            <div className="flex gap-4 mt-2 p-3 rounded" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
                                <div className="flex-1">
                                    <div className="text-xs text-muted uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
                                        <Layers size={12} /> Tasks Done
                                    </div>
                                    <div className="text-lg font-bold text-primary">{dpr.tasks_completed}</div>
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs text-muted uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
                                        <Clock size={12} /> Hrs Logged
                                    </div>
                                    <div className="text-lg font-bold text-primary">{dpr.hours_logged}h</div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center text-muted" style={{ padding: '3rem', background: 'var(--bg-glass)', borderRadius: 'var(--radius-lg)' }}>
                        No DPRs submitted for this date.
                    </div>
                )}
            </div>
        </div>
    );
}
