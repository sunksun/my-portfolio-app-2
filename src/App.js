// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/Login';
import RegisterAdmin from './components/RegisterAdmin';
import Dashboard from './components/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import UserManagement from './components/UserManagement';
import Signup from './components/Signup';
import AdminDashboard from './components/AdminDashboard';
import UserStatus from './components/UserStatus';
import UserRole from './components/UserRole';
import TemplateEdit from './components/TemplateEdit';
import TemplateStyle from './components/TemplateStyle';
import CategoryManagement from './components/CategoryManagement';
import AuditLog from './components/AuditLog';
import Notification from './components/Notification';
import EmailManagement from './components/EmailManagement';
import ExportImport from './components/ExportImport';
import UserProfile from './components/UserProfile';
import EducationManagement from './components/EducationManagement';
import WorkManagement from './components/WorkManagement';
import PortfolioBuilder from './components/PortfolioBuilder';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Signup />} />
            <Route path="/register-admin" element={<RegisterAdmin />} />
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute requiredRole="user">
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin-dashboard" 
              element={
                <PrivateRoute requiredRole="admin">
                  <AdminDashboard />
                </PrivateRoute>
              } 
            />
            <Route path="/" element={<Login />} />
            <Route path="/dashboard/user-management" element={<UserManagement />} />
            <Route path="/dashboard/user-status" element={
              <PrivateRoute requiredRole="admin">
                <UserStatus />
              </PrivateRoute>
            } />
            <Route path="/dashboard/user-role" element={
              <PrivateRoute requiredRole="admin">
                <UserRole />
              </PrivateRoute>
            } />
            <Route path="/admin/template-edit" element={
              <PrivateRoute requiredRole="admin">
                <TemplateEdit />
              </PrivateRoute>
            } />
            <Route path="/admin/template-style" element={
              <PrivateRoute requiredRole="admin">
                <TemplateStyle />
              </PrivateRoute>
            } />
            <Route path="/admin/category-management" element={
              <PrivateRoute requiredRole="admin">
                <CategoryManagement />
              </PrivateRoute>
            } />
            <Route path="/admin/audit-log" element={
              <PrivateRoute requiredRole="admin">
                <AuditLog />
              </PrivateRoute>
            } />
            <Route path="/admin/notification" element={
              <PrivateRoute requiredRole="admin">
                <Notification />
              </PrivateRoute>
            } />
            <Route path="/admin/email-management" element={
              <PrivateRoute requiredRole="admin">
                <EmailManagement />
              </PrivateRoute>
            } />
            <Route path="/admin/export-import" element={
              <PrivateRoute requiredRole="admin">
                <ExportImport />
              </PrivateRoute>
            } />
            <Route path="/dashboard/profile" element={
              <PrivateRoute requiredRole="user">
                <UserProfile />
              </PrivateRoute>
            } />
            <Route path="/dashboard/education" element={
              <PrivateRoute requiredRole="user">
                <EducationManagement />
              </PrivateRoute>
            } />
            <Route path="/dashboard/works" element={
              <PrivateRoute requiredRole="user">
                <WorkManagement />
              </PrivateRoute>
            } />
            <Route path="/dashboard/portfolio" element={
              <PrivateRoute requiredRole="user">
                <PortfolioBuilder />
              </PrivateRoute>
            } />
            {/* <Route path="/register-user" element={<RegisterAdmin />} /> */}
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;