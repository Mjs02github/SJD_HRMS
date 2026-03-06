import React, { useState, useEffect } from 'react';
import { api } from '../../contexts/AuthContext';
import {
    Users,
    Search,
    Plus,
    MoreVertical,
    Edit,
    Trash2,
    CheckCircle2,
    XCircle,
    MapPin,
    BaggageClaim,
    Mail,
    Phone
} from 'lucide-react';

import AddEmployeeModal from './AddEmployeeModal';

export default function EmployeeList() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Need to get companyId from context/selector in real app, assuming '1' for now
    const companyId = 1;

    useEffect(() => {
        fetchEmployees();
    }, [companyId]);

    const fetchEmployees = async (search = '') => {
        try {
            setLoading(true);
            const res = await api.get(`/companies/${companyId}/employees${search ? `?search=${search}` : ''}`);
            if (res.data.success) setEmployees(res.data.data);
        } catch (err) {
            console.error('Error fetching employees');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchEmployees(searchTerm);
    };

    return (
        <div className="animate-fade-in">
            <div className="flex-between mb-6">
                <div>
                    <h1 className="title-lg mb-1 flex items-center gap-2">
                        <Users className="text-primary" size={32} /> Directory
                    </h1>
                    <p className="subtitle">Manage company workforce</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
                    <Plus size={18} /> Add Employee
                </button>
            </div>

            <div className="glass-card mb-6" style={{ padding: '1rem' }}>
                <form onSubmit={handleSearch} className="flex gap-4">
                    <div className="input-wrapper" style={{ flex: 1, margin: 0 }}>
                        <Search className="input-icon" size={18} />
                        <input
                            type="text"
                            className="input-field with-icon"
                            placeholder="Search by name, ID or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn btn-secondary">Search</button>
                </form>
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
                                    <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Role</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Contact</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Status</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center text-muted" style={{ padding: '2rem' }}>
                                            No employees found.
                                        </td>
                                    </tr>
                                ) : (
                                    employees.map(emp => (
                                        <tr key={emp.id} style={{ borderBottom: '1px solid var(--border-light)', transition: 'var(--transition-fast)' }}>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-dark)', fontWeight: 'bold' }}>
                                                        {emp.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{emp.name}</div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{emp.emp_code}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ fontWeight: 500 }}>{emp.designation_name || 'N/A'}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{emp.dept_name || 'No Dept'}</div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', marginBottom: '0.2rem' }}>
                                                    <Mail size={14} className="text-muted" /> {emp.email || 'N/A'}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                                                    <Phone size={14} className="text-muted" /> {emp.phone || 'N/A'}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                {emp.status === 'active' ? (
                                                    <span className="badge badge-success"><CheckCircle2 size={12} style={{ marginRight: '4px' }} /> Active</span>
                                                ) : (
                                                    <span className="badge badge-danger"><XCircle size={12} style={{ marginRight: '4px' }} /> Inactive</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                    <button className="btn btn-secondary" style={{ padding: '0.5rem' }} title="Edit">
                                                        <Edit size={16} />
                                                    </button>
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

            <AddEmployeeModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                companyId={companyId}
                onEmployeeAdded={(newEmp) => {
                    setEmployees([newEmp, ...employees]);
                    setIsAddModalOpen(false);
                }}
            />
        </div>
    );
}
