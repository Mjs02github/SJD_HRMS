import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// API Configuration
export const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('sjd_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('sjd_token');
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const res = await api.get('/auth/me');
                if (res.data.success) {
                    setUser(res.data.user);
                } else {
                    localStorage.removeItem('sjd_token');
                }
            } catch (err) {
                localStorage.removeItem('sjd_token');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const login = async (email, password, isEmployee = false) => {
        const endpoint = isEmployee ? '/auth/employee-login' : '/auth/login';
        const res = await api.post(endpoint, { email, password });
        if (res.data.success) {
            localStorage.setItem('sjd_token', res.data.token);

            // If employee, set the company_ids to an array so logic is uniform
            let userData = res.data.user;
            if (userData.role === 'employee' && userData.company_id) {
                userData.company_ids = [userData.company_id];
            }

            setUser(userData);
            return userData;
        }
        return null;
    };

    const logout = () => {
        localStorage.removeItem('sjd_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
