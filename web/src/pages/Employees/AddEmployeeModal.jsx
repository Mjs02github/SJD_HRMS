import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

export default function AddEmployeeModal({ isOpen, onClose, companyId, onEmployeeAdded }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        designation_name: '',
        dept_name: '',
        basic_salary: '',
        status: 'active'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Using import from AuthContext.jsx so we don't cause circular dependencies
        const { api } = await import('../../contexts/AuthContext');

        try {
            const res = await api.post(`/companies/${companyId}/employees`, {
                ...formData,
                basic_salary: Number(formData.basic_salary) || 0
            });

            if (res.data.success) {
                onEmployeeAdded(res.data.data);
                onClose();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add employee');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content animate-fade-in" style={{ maxWidth: '600px', width: '90%' }}>
                <div className="modal-header flex-between">
                    <h2 className="text-xl font-bold">Add New Employee</h2>
                    <button onClick={onClose} className="btn-icon text-muted hover-danger"><X size={20} /></button>
                </div>

                {error && <div className="alert alert-danger mb-4">{error}</div>}

                <form onSubmit={handleSubmit} className="modal-body p-6">
                    <div className="grid-2-col gap-4 mb-4">
                        <div className="input-group">
                            <label className="input-label">Full Name</label>
                            <input
                                type="text" name="name" className="input-field" required
                                value={formData.name} onChange={handleChange}
                                placeholder="John Doe"
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Email Address</label>
                            <input
                                type="email" name="email" className="input-field" required
                                value={formData.email} onChange={handleChange}
                                placeholder="john@company.com"
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Phone Number</label>
                            <input
                                type="tel" name="phone" className="input-field" required
                                value={formData.phone} onChange={handleChange}
                                placeholder="+91 9876543210"
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Login Password</label>
                            <input
                                type="password" name="password" className="input-field" required
                                value={formData.password} onChange={handleChange}
                                placeholder="Secure password"
                                minLength="6"
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Department</label>
                            <input
                                type="text" name="dept_name" className="input-field"
                                value={formData.dept_name} onChange={handleChange}
                                placeholder="e.g. Engineering"
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Designation</label>
                            <input
                                type="text" name="designation_name" className="input-field"
                                value={formData.designation_name} onChange={handleChange}
                                placeholder="e.g. Software Engineer"
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Basic Salary (Monthly ₹)</label>
                            <input
                                type="number" name="basic_salary" className="input-field" required
                                value={formData.basic_salary} onChange={handleChange}
                                placeholder="50000" min="0" step="1000"
                            />
                        </div>
                    </div>

                    <div className="modal-footer flex gap-3 mt-6" style={{ justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? <div className="spinner"></div> : <><Save size={18} /> Save Employee</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
