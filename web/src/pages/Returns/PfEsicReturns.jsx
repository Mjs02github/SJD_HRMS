import React, { useState } from 'react';
import {
    Building2,
    Download,
    FileSpreadsheet,
    ShieldCheck,
    CalendarDays
} from 'lucide-react';

export default function PfEsicReturns() {
    const [selectedMonth, setSelectedMonth] = useState('2026-03');
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);

    // Dummy employee list for selection
    const employees = [
        { id: 1, name: 'John Doe', uan: '100000000010', ecr_pf: 1800, eps: 1250, edli: 250 },
        { id: 2, name: 'Jane Smith', uan: '100000000021', ecr_pf: 1800, eps: 1250, edli: 250 },
        { id: 3, name: 'Robert Johnson', uan: '100000000032', ecr_pf: 2100, eps: 1500, edli: 300 },
    ];

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedEmployees(employees.map(emp => emp.id));
        } else {
            setSelectedEmployees([]);
        }
    };

    const handleSelect = (id) => {
        if (selectedEmployees.includes(id)) {
            setSelectedEmployees(selectedEmployees.filter(empId => empId !== id));
        } else {
            setSelectedEmployees([...selectedEmployees, id]);
        }
    };

    const generateECRFile = () => {
        if (selectedEmployees.length === 0) {
            alert("Please select at least one employee for the ECR generation.");
            return;
        }

        setIsGenerating(true);
        // Simulate API delay for generating the TXT/CSV ECR format
        setTimeout(() => {
            setIsGenerating(false);
            alert(`ECR File generated successfully for ${selectedEmployees.length} employees.`);
        }, 1500);
    };

    return (
        <div className="animate-fade-in">
            <div className="flex-between mb-6">
                <div>
                    <h1 className="title-lg mb-1 flex items-center gap-2">
                        <Building2 className="text-primary" size={32} /> PF & ESIC Returns
                    </h1>
                    <p className="subtitle">Generate Provident Fund ECR and ESIC contribution files</p>
                </div>
            </div>

            <div className="grid" style={{ gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
                {/* Main Content Area */}
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div className="flex-between mb-4 pb-4" style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <h2 className="title-md m-0">Select Employees for ECR</h2>
                        <div className="input-group" style={{ margin: 0, width: '200px' }}>
                            <input
                                type="month"
                                className="input-field"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                            />
                        </div>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: 'var(--bg-card)', borderBottom: '2px solid var(--border-light)' }}>
                                <th style={{ padding: '1rem', width: '50px' }}>
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={selectedEmployees.length === employees.length && employees.length > 0}
                                    />
                                </th>
                                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Employee</th>
                                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>UAN Number</th>
                                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>PF Contribution</th>
                                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>EPS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map(emp => (
                                <tr key={emp.id} style={{ borderBottom: '1px solid var(--border-light)' }} className="hover:bg-slate-50">
                                    <td style={{ padding: '1rem' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedEmployees.includes(emp.id)}
                                            onChange={() => handleSelect(emp.id)}
                                        />
                                    </td>
                                    <td style={{ padding: '1rem', fontWeight: 500, color: 'var(--text-main)' }}>{emp.name}</td>
                                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{emp.uan}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>₹{emp.ecr_pf}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--text-muted)' }}>₹{emp.eps}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Action Sidebar */}
                <div>
                    <div className="glass-card mb-4" style={{ padding: '1.5rem' }}>
                        <h3 className="title-md mb-4 flex items-center gap-2">
                            <ShieldCheck className="text-info" size={20} /> EPF Actions
                        </h3>

                        <div className="p-4 rounded-lg mb-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
                            <div className="flex-between mb-2">
                                <span className="text-sm text-muted">Selected Employees</span>
                                <span className="font-bold text-primary">{selectedEmployees.length}</span>
                            </div>
                            <div className="flex-between mb-2">
                                <span className="text-sm text-muted">Month</span>
                                <span className="font-bold text-main">{selectedMonth}</span>
                            </div>
                        </div>

                        <button
                            className="btn btn-primary w-100 flex-center gap-2 mb-3"
                            onClick={generateECRFile}
                            disabled={isGenerating || selectedEmployees.length === 0}
                        >
                            {isGenerating ? <div className="spinner spinner-white" /> : <FileSpreadsheet size={18} />}
                            {isGenerating ? "Generating ECR..." : "Generate ECR File"}
                        </button>
                        <p className="text-xs text-muted text-center leading-relaxed">
                            Generates the standard text file format required by the EPFO unified portal.
                        </p>
                    </div>

                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                        <h3 className="title-md mb-4 flex items-center gap-2">
                            <Building2 className="text-warning" size={20} /> ESIC Actions
                        </h3>
                        <button className="btn btn-secondary w-100 flex-center gap-2 mb-3">
                            <Download size={18} /> ESIC Return Template
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
