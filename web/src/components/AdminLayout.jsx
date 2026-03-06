import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    LayoutDashboard,
    Building2,
    Users,
    CalendarCheck,
    MapPin,
    FileCheck2,
    Banknote,
    Briefcase,
    FileText,
    ListTodo,
    Settings,
    LogOut
} from 'lucide-react';
import './AdminLayout.css';

export default function AdminLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { name: 'Companies', path: '/admin/companies', icon: Building2, roles: ['super_admin'] },
        { name: 'Employees', path: '/admin/employees', icon: Users },
        { name: 'Attendance', path: '/admin/attendance', icon: CalendarCheck },
        { name: 'GPS Tracking', path: '/admin/gps', icon: MapPin },
        { name: 'Leave Mgmt', path: '/admin/leaves', icon: FileCheck2 },
        { name: 'Payroll', path: '/admin/payroll', icon: Banknote },
        { name: 'PF & ESIC', path: '/admin/pf-esic', icon: Briefcase },
        { name: 'Tasks', path: '/admin/tasks', icon: ListTodo },
        { name: 'DPRs', path: '/admin/dprs', icon: FileText },
        { name: 'Settings', path: '/admin/settings', icon: Settings },
    ];

    // Filter items based on user role
    const filteredNavItems = navItems.filter(item =>
        !item.roles || item.roles.includes(user?.role)
    );

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <h2 className="text-gradient logo-text">SJD HRMS</h2>
                    <span className="role-badge badge badge-info">{user?.role?.replace('_', ' ')}</span>
                </div>

                <nav className="sidebar-nav">
                    {filteredNavItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            end={item.path === '/admin'}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        >
                            <item.icon className="nav-icon" size={20} />
                            <span>{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={handleLogout}>
                        <LogOut size={20} className="nav-icon" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="admin-main">
                {/* Top Header */}
                <header className="admin-header glass-panel">
                    <div className="header-left">
                        {/* Future: Company Switcher Dropdown here */}
                        <h3 className="text-muted font-medium">SJD Enterprise Portal</h3>
                    </div>
                    <div className="header-right">
                        <div className="user-profile">
                            <div className="user-avatar">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="user-info">
                                <span className="user-name">{user?.name}</span>
                                <span className="user-email">{user?.email}</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="admin-content-wrapper">
                    <Outlet />
                </div>
            </main>
        </div >
    );
}
