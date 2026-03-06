import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import EmployeeDashboard from './pages/EmployeeDashboard';

import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';

// PrivateRoute wrapper for simple pages without layout (like redirect)
const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex-center" style={{ height: '100vh' }}><div className="spinner spinner-primary"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Admin/HR Routes inside AdminLayout */}
      <Route path="/admin" element={
        <PrivateRoute roles={['super_admin', 'hr', 'manager']}>
          <AdminLayout />
        </PrivateRoute>
      }>
        <Route index element={<AdminDashboard />} />
        {/* Placeholder routes for future development */}
        <Route path="companies" element={<div className="app-content"><h2>Companies Management</h2></div>} />
        <Route path="employees" element={<div className="app-content"><h2>Employee Management</h2></div>} />
        <Route path="attendance" element={<div className="app-content"><h2>Attendance Management</h2></div>} />
        <Route path="gps" element={<div className="app-content"><h2>GPS Tracking</h2></div>} />
        <Route path="leaves" element={<div className="app-content"><h2>Leave Management</h2></div>} />
        <Route path="payroll" element={<div className="app-content"><h2>Payroll Processing</h2></div>} />
        <Route path="pf-esic" element={<div className="app-content"><h2>PF & ESIC Returns</h2></div>} />
        <Route path="tasks" element={<div className="app-content"><h2>Task Management</h2></div>} />
        <Route path="dprs" element={<div className="app-content"><h2>Daily Progress Reports</h2></div>} />
        <Route path="settings" element={<div className="app-content"><h2>Settings</h2></div>} />
      </Route>

      {/* Employee Routes */}
      <Route path="/employee" element={
        <PrivateRoute roles={['employee']}>
          <EmployeeDashboard />
        </PrivateRoute>
      } />

      {/* Root redirect based on role */}
      <Route path="/" element={
        <PrivateRoute>
          <RoleBasedRedirect />
        </PrivateRoute>
      } />
    </Routes>
  );
}

const RoleBasedRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'employee') {
    return <Navigate to="/employee" replace />;
  }
  return <Navigate to="/admin" replace />;
};

export default App;
