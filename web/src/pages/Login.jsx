import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Building2, UserCircle, LogIn, Lock, Mail } from 'lucide-react';
import './Login.css'; // Creating scoped CSS just for login

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginType, setLoginType] = useState('admin'); // 'admin' | 'employee'
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const isEmployee = loginType === 'employee';
            await login(email, password, isEmployee);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-glass-card animate-fade-in">
                <div className="login-header">
                    <div className="login-logo-container">
                        {loginType === 'admin' ? (
                            <Building2 className="login-logo text-primary" size={40} />
                        ) : (
                            <UserCircle className="login-logo text-secondary" size={40} />
                        )}
                    </div>
                    <h1 className="title-lg text-gradient">SJD HRMS</h1>
                    <p className="subtitle">Enterprise Resource Management</p>
                </div>

                <div className="login-type-toggle">
                    <button
                        type="button"
                        className={`toggle-btn ${loginType === 'admin' ? 'active-admin' : ''}`}
                        onClick={() => { setLoginType('admin'); setError(''); }}
                    >
                        HR / Admin
                    </button>
                    <button
                        type="button"
                        className={`toggle-btn ${loginType === 'employee' ? 'active-employee' : ''}`}
                        onClick={() => { setLoginType('employee'); setError(''); }}
                    >
                        Employee
                    </button>
                </div>

                {error && <div className="login-error">{error}</div>}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <label className="input-label">
                            {loginType === 'employee' ? 'Email or Emp Code' : 'Email Address'}
                        </label>
                        <div className="input-wrapper">
                            <Mail className="input-icon" size={18} />
                            <input
                                type={loginType === 'employee' ? 'text' : 'email'}
                                className="input-field with-icon"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={loginType === 'employee' ? 'EMP001 or email@company.com' : 'admin@sjd.com'}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Password</label>
                        <div className="input-wrapper">
                            <Lock className="input-icon" size={18} />
                            <input
                                type="password"
                                className="input-field with-icon"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={`btn btn-primary login-submit ${loginType === 'employee' ? 'btn-employee' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? <div className="spinner"></div> : (
                            <>
                                <LogIn size={20} />
                                Sign In securely
                            </>
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <p>Secure Enterprise Portal &copy; {new Date().getFullYear()}</p>
                </div>
            </div>
        </div>
    );
}
