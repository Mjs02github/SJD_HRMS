import React, { useState } from 'react';
import {
    Settings as SettingsIcon,
    Save,
    BellRing,
    Shield,
    Building,
    CreditCard
} from 'lucide-react';

export default function Settings() {
    const [activeTab, setActiveTab] = useState('general');

    const tabs = [
        { id: 'general', label: 'General Info', icon: Building },
        { id: 'security', label: 'Security & Auth', icon: Shield },
        { id: 'notifications', label: 'Notifications', icon: BellRing },
        { id: 'billing', label: 'Plan & Billing', icon: CreditCard },
    ];

    return (
        <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div className="flex-between mb-6">
                <div>
                    <h1 className="title-lg mb-1 flex items-center gap-2">
                        <SettingsIcon className="text-primary" size={32} /> Organization Settings
                    </h1>
                    <p className="subtitle">Manage your company profile, preferences, and billing</p>
                </div>
                <button className="btn btn-primary flex items-center gap-2">
                    <Save size={18} /> Save Changes
                </button>
            </div>

            <div className="grid" style={{ gridTemplateColumns: '250px 1fr', gap: '2rem', alignItems: 'flex-start' }}>

                {/* Vertical Navigation Tabs */}
                <div className="glass-card" style={{ padding: '0.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '0.5rem',
                                    fontWeight: 500,
                                    transition: 'all 0.2s',
                                    background: activeTab === tab.id ? 'var(--primary-main)' : 'transparent',
                                    color: activeTab === tab.id ? 'white' : 'var(--text-main)',
                                    border: 'none',
                                    cursor: 'pointer',
                                    textAlign: 'left'
                                }}
                                className={activeTab !== tab.id ? "hover:bg-slate-100" : ""}
                            >
                                <tab.icon size={18} /> {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Settings Content Area */}
                <div className="glass-card" style={{ padding: '2rem', minHeight: '500px' }}>
                    {activeTab === 'general' && (
                        <div className="animate-fade-in">
                            <h2 className="title-md mb-6 border-b pb-4">General Information</h2>
                            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div className="input-group">
                                    <label className="input-label">Company Name</label>
                                    <input type="text" className="input-field" defaultValue="SJD Enterprises Pvt Ltd" />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Registration Number (CIN)</label>
                                    <input type="text" className="input-field" defaultValue="U72900MH2026PTC123456" />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Official Email</label>
                                    <input type="email" className="input-field" defaultValue="hr@sjdenterprises.com" />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Contact Phone</label>
                                    <input type="tel" className="input-field" defaultValue="+91 98765 43210" />
                                </div>
                                <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                                    <label className="input-label">Registered Office Address</label>
                                    <textarea className="input-field" rows="3" defaultValue="123 Corporate Park, Andheri East, Mumbai, Maharashtra 400069"></textarea>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="animate-fade-in">
                            <h2 className="title-md mb-6 border-b pb-4">Security & Authentication</h2>
                            <div className="mb-6 pb-6 border-b">
                                <h3 className="text-md font-bold text-main mb-2">Two-Factor Authentication (2FA)</h3>
                                <p className="text-sm text-muted mb-4">Require all admins and HR staff to log in using an authenticator app.</p>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                                    <input type="checkbox" style={{ transform: 'scale(1.2)' }} />
                                    <span className="font-medium text-main">Enforce 2FA for Admins</span>
                                </label>
                            </div>
                            <div className="mb-6">
                                <h3 className="text-md font-bold text-main mb-2">Password Policy</h3>
                                <p className="text-sm text-muted mb-4">Set rules for employee password creation and expiration.</p>
                                <div className="grid" style={{ gap: '1rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                                        <input type="checkbox" defaultChecked style={{ transform: 'scale(1.2)' }} />
                                        <span className="text-main">Require uppercase and special characters</span>
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                                        <input type="checkbox" defaultChecked style={{ transform: 'scale(1.2)' }} />
                                        <span className="text-main">Force password reset every 90 days for employees</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="animate-fade-in">
                            <h2 className="title-md mb-6 border-b pb-4">Alerts & Notifications</h2>
                            <p className="text-sm text-muted mb-6">Choose how the system communicates with employees and admins.</p>

                            <div className="grid" style={{ gap: '1.5rem' }}>
                                <div className="flex-between p-4 rounded-lg bg-slate-50 border border-slate-200">
                                    <div>
                                        <h4 className="font-bold text-main mb-1">Email Payslips Automatically</h4>
                                        <p className="text-sm text-muted">Send PDF payslips to employees when payroll is processed.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-main"></div>
                                    </label>
                                </div>

                                <div className="flex-between p-4 rounded-lg bg-slate-50 border border-slate-200">
                                    <div>
                                        <h4 className="font-bold text-main mb-1">Leave Request Alerts</h4>
                                        <p className="text-sm text-muted">Notify HR admins via email when a new leave request is submitted.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-main"></div>
                                    </label>
                                </div>

                                <div className="flex-between p-4 rounded-lg bg-slate-50 border border-slate-200">
                                    <div>
                                        <h4 className="font-bold text-main mb-1">Daily Attendance Summary</h4>
                                        <p className="text-sm text-muted">Receive an automated email at 10 AM summarizing absent employees.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" />
                                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-main"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'billing' && (
                        <div className="animate-fade-in flex-center flex-col h-full text-center text-muted p-8">
                            <CreditCard size={48} className="mb-4 text-slate-300" />
                            <h3 className="title-md mb-2 text-main">Premium Enterprise Plan</h3>
                            <p className="mb-6">Your subscription is active and renews on Jan 1, 2027.</p>
                            <button className="btn btn-secondary">View Invoice History</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
