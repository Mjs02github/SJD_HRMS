import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import EmployeeDashboard from './pages/EmployeeDashboard';

// Placeholder views for components not yet built
const AdminDashboard = () => <div className="app-content"><h2>Admin Dashboard</h2><p>Overview stats will go here</p></div>;
const Layout = ({ children }) => (
  <div className="app-layout">
    <aside className="app-sidebar">
      {/* Sidebar navigation here */}
      <div style={{ padding: '2rem' }}>
        <h2 className="text-gradient">SJD HRMS</h2>
      </div>
    </aside>
    <main className="app-main">
      <header className="app-header">
        <div>{/* Company Switcher will go here for admins */}</div>
        <div>{/* Profile menu */}</div>
      </header>
      {children}
    </main>
  </div>
);

// PrivateRoute wrapper
const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex-center" style={{ height: '100vh' }}><div className="spinner spinner-primary"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Admin/HR Routes */}
      <Route path="/admin" element={
        <PrivateRoute roles={['super_admin', 'hr', 'manager']}>
          <AdminDashboard />
        </PrivateRoute>
      } />

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
