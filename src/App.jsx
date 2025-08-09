import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated, isAdmin, isEmployee } from './utils/auth';

// Layout
import Layout from './components/Layout/Layout';

// Pages
import Login from './pages/Login';
import EmployeeDashboard from './pages/Employee/EmployeeDashboard';
import VehicleRequestForm from './pages/Employee/VehicleRequestForm';
import AdminDashboard from './pages/Admin/AdminDashboard';
import RequestManagement from './pages/Admin/RequestManagement';

// Protected Route Components
const ProtectedRoute = ({ children, requiredRole }) => {
  const authenticated = isAuthenticated();
  const userIsAdmin = isAdmin();
  const userIsEmployee = isEmployee();

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole === 'admin' && !userIsAdmin) {
    return <Navigate to="/employee" replace />;
  }

  if (requiredRole === 'employee' && !userIsEmployee) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const authenticated = isAuthenticated();
  
  if (authenticated) {
    return <Navigate to={isAdmin() ? "/admin" : "/employee"} replace />;
  }
  
  return children;
};

function App() {
  useEffect(() => {
    // Set page title
    document.title = 'Vehicle Requisition Management System';
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />

          {/* Protected Routes with Layout */}
          <Route path="/" element={<Layout />}>
            {/* Root Redirect */}
            <Route index element={
              <Navigate to={
                isAuthenticated() 
                  ? (isAdmin() ? '/admin' : '/employee')
                  : '/login'
              } replace />
            } />

            {/* Employee Routes */}
            <Route path="/employee" element={
              <ProtectedRoute requiredRole="employee">
                <EmployeeDashboard />
              </ProtectedRoute>
            } />
            <Route path="/employee/request" element={
              <ProtectedRoute requiredRole="employee">
                <VehicleRequestForm />
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/requests" element={
              <ProtectedRoute requiredRole="admin">
                <RequestManagement />
              </ProtectedRoute>
            } />
            {/* Placeholder for Vehicle Management - would be implemented similarly */}
            <Route path="/admin/vehicles" element={
              <ProtectedRoute requiredRole="admin">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                    <div className="text-blue-500 text-6xl mb-4">🚗</div>
                    <h2 className="text-2xl font-bold text-blue-900 mb-2">Vehicle Management</h2>
                    <p className="text-blue-800 mb-4">
                      This section is under development. Vehicle management functionality will be available soon.
                    </p>
                    <p className="text-blue-700 text-sm">
                      Currently, vehicles can be managed directly through the database or API.
                    </p>
                  </div>
                </div>
              </ProtectedRoute>
            } />

            {/* 404 Route */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h1>
                  <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
                  <button
                    onClick={() => window.history.back()}
                    className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            } />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;