import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Home             from './pages/Home';
import Login            from './pages/Login';
import Register         from './pages/Register';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AdminDashboard   from './pages/AdminDashboard';
import ApplyLeave       from './pages/ApplyLeave';
import LeaveHistory     from './pages/LeaveHistory';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/"         element={<Home />}     />
          <Route path="/login"    element={<Login />}    />
          <Route path="/register" element={<Register />} />

          {/* Employee — ProtectedRoute handles DashboardLayout + role guard */}
          <Route path="/dashboard" element={
            <ProtectedRoute role="employee"><EmployeeDashboard /></ProtectedRoute>
          } />
          <Route path="/apply-leave" element={
            <ProtectedRoute role="employee"><ApplyLeave /></ProtectedRoute>
          } />
          <Route path="/leave-history" element={
            <ProtectedRoute role="employee"><LeaveHistory /></ProtectedRoute>
          } />

          {/* Admin */}
          <Route path="/admin" element={
            <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
