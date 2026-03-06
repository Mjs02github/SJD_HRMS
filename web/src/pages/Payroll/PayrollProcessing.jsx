import React, { useState, useEffect } from 'react';
import { api } from '../../contexts/AuthContext';
import {
    Banknote,
    Search,
    Download,
    Settings,
    Mail,
    FileText
} from 'lucide-react';

export default function PayrollProcessing() {
    const [payrollData, setPayrollData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Settings for the current payroll month
    const [selectedMonth, setSelectedMonth] = useState('2026-03');
    const [totalWorkingDays] = useState(30);

    const companyId = 1;

    useEffect(() => {
        fetchPayroll();
    }, [selectedMonth]);

    const fetchPayroll = async () => {
        try {
            setLoading(true);
            // In a real app we'd fetch actual calculated payroll for the month
            const res = await api.get(`/companies/${companyId}/payroll?month=${selectedMonth}`);
            if (res.data.success) {
                setPayrollData(res.data.data);
            }
        } catch (err) {
            console.error('Error fetching payroll', err);
            // Fallback Dummy Data for UI Development
            setPayrollData([
                {
                    employee_id: 1,
                    employee_name: 'John Doe',
                    emp_code: 'EMP001',
                    basic_salary: 50000,
                    present_days: 28,
                    leaves: 2,
                    gross_salary: 46666.67,
                    deductions_pf: 1800,
                    deductions_esic: 350,
                    advance_recovery: 5000,
                    net_payable: 39516.67,
                    status: 'pending' // pending, processed, paid
                },
                {
                    employee_id: 2,
                    employee_name: 'Jane Smith',
                    emp_code: 'EMP002',
                    basic_salary: 40000,
                    present_days: 30,
                    leaves: 0,
                    gross_salary: 40000,
                    deductions_pf: 1800,
                    deductions_esic: 300,
                    advance_recovery: 0,
                    net_payable: 37900,
                    status: 'processed'
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleProcessPayroll = async (empId) => {
        // API call to lock payroll for this employee
        setPayrollData(data => data.map(item =>
            item.employee_id === empId ? { ...item, status: 'processed' } : item
        ));
    };

    const handleSendPayslip = async (empId) => {
        alert(`Payslip email initiated for employee ID: ${empId}`);
    };

    const totalPayout = payrollData.reduce((acc, curr) => acc + curr.net_payable, 0);

    return (
        <div className="animate-fade-in">
            <div className="flex-between mb-6">
                <div>
                    <h1 className="title-lg mb-1 flex items-center gap-2">
                        <Banknote className="text-primary" size={32} /> Payroll Processing
                    </h1>
                    <p className="subtitle">Calculate salaries, deductions, and generate payslips</p>
                </div>
                <div className="flex gap-2">
                    <button className="btn btn-secondary flex items-center gap-2">
                        <Settings size={18} /> Payroll Settings
                    </button>
                    <button className="btn btn-secondary flex items-center gap-2">
                        <Download size={18} /> Export Bank Format
                    </button>
                </div>
            </div>

            <div className="glass-card mb-6 flex-between" style={{ padding: '1.5rem' }}>
                <div className="flex gap-4 items-end">
                    <div className="input-group" style={{ margin: 0, minWidth: '200px' }}>
                        <label className="input-label">Payroll Month</label>
                        <input
                            type="month"
                            className="input-field"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                        />
                    </div>

                    <div className="input-wrapper" style={{ margin: 0, minWidth: '250px' }}>
                        <Search className="input-icon" size={18} />
                        <input type="text" className="input-field with-icon" placeholder="Search employee..." />
                    </div>
                </div>

                <div className="text-right">
                    <p className="text-sm text-muted font-medium uppercase mb-1">Estimated Total Payout</p>
                    <h2 className="title-lg text-gradient m-0">₹ {totalPayout.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</h2>
                </div>
            </div>

            <div className="glass-card">
                {loading ? (
                    <div className="flex-center" style={{ padding: '4rem' }}>
                        <div className="spinner spinner-primary"></div>
                    </div>
                ) : (
                    <div className="table-container" style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
                            <thead>
                                <tr style={{ background: 'rgba(241, 245, 249, 0.5)', borderBottom: '1px solid var(--border-light)' }}>
                                    <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Employee Details</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center' }}>Attendance (/{totalWorkingDays})</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>Base / Gross Salary</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>Deductions (PF/ESIC/Adv)</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>Net Payable</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center' }}>Status</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payrollData.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center text-muted" style={{ padding: '3rem' }}>
                                            No payroll data generated for this month.
                                        </td>
                                    </tr>
                                ) : (
                                    payrollData.map(record => (
                                        <tr key={record.employee_id} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.2s' }} className="hover:bg-slate-50">
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{record.employee_name}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{record.emp_code}</div>
                                            </td>

                                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                <div className="text-sm font-medium text-secondary">{record.present_days} P / {record.leaves} L</div>
                                            </td>

                                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>₹{record.basic_salary.toLocaleString()}</div>
                                                <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>₹{record.gross_salary.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                                            </td>

                                            <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--text-warning)' }}>
                                                <div style={{ fontSize: '0.8rem' }} title="PF & ESIC">₹{record.deductions_pf + record.deductions_esic}
                                                    {record.advance_recovery > 0 && ` + ₹${record.advance_recovery} (Adv)`}
                                                </div>
                                                <div style={{ fontWeight: 600, color: '#B91C1C' }}>
                                                    -₹{(record.deductions_pf + record.deductions_esic + record.advance_recovery).toLocaleString('en-IN')}
                                                </div>
                                            </td>

                                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary-dark)' }}>
                                                    ₹{record.net_payable.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                                </div>
                                            </td>

                                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                {record.status === 'processed' ? (
                                                    <span className="badge badge-success">Processed</span>
                                                ) : (
                                                    <span className="badge badge-warning">Draft</span>
                                                )}
                                            </td>

                                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                    {record.status !== 'processed' && (
                                                        <button
                                                            className="btn btn-secondary text-xs py-1"
                                                            onClick={() => handleProcessPayroll(record.employee_id)}
                                                            title="Lock and Process"
                                                        >
                                                            Process
                                                        </button>
                                                    )}
                                                    {record.status === 'processed' && (
                                                        <>
                                                            <button className="btn btn-secondary text-primary px-2" title="View Payslip">
                                                                <FileText size={16} />
                                                            </button>
                                                            <button
                                                                className="btn btn-secondary text-info px-2"
                                                                title="Email Payslip"
                                                                onClick={() => handleSendPayslip(record.employee_id)}
                                                            >
                                                                <Mail size={16} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
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
