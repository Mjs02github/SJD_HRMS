import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import EmployeeDashboard from './pages/EmployeeDashboard';

import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeList from './pages/Employees/EmployeeList';
import AttendanceReport from './pages/Attendance/AttendanceReport';
import LeaveManagement from './pages/Attendance/LeaveManagement';
import PayrollProcessing from './pages/Payroll/PayrollProcessing';
import TaskManagement from './pages/Tasks/TaskManagement';
import DPRViews from './pages/Tasks/DPRViews';
import PfEsicReturns from './pages/Returns/PfEsicReturns';
import GpsTracking from './pages/Tracking/GpsTracking';
import Settings from './pages/Settings/Settings';

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
        {/* Real routes */}
        <Route path="employees" element={<EmployeeList />} />
        <Route path="attendance" element={<AttendanceReport />} />
        <Route path="gps" element={<GpsTracking />} />
        <Route path="leaves" element={<LeaveManagement />} />
        <Route path="payroll" element={<PayrollProcessing />} />
        <Route path="pf-esic" element={<PfEsicReturns />} />
        <Route path="tasks" element={<TaskManagement />} />
        <Route path="dprs" element={<DPRViews />} />
        <Route path="settings" element={<Settings />} />
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
