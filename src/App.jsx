import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import Builder from './components/Builder/Builder';
import AdminDashboard from './components/Admin/AdminDashboard';
import UserManagement from './components/Admin/UserManagement';

// Schema
import { DB, initializeDB } from './schema/database';

// Styles
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize database
    initializeDB();
    
    // Check for existing user session
    const currentUser = DB.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    DB.setCurrentUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    DB.clearCurrentUser();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const isAdmin = user?.role === 'admin';

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <AnimatePresence mode="wait">
          <Routes>
            {/* Auth Routes */}
            <Route 
              path="/login" 
              element={
                !user ? (
                  <Login onLogin={handleLogin} />
                ) : (
                  <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace />
                )
              } 
            />
            <Route 
              path="/register" 
              element={
                !user ? (
                  <Register onLogin={handleLogin} />
                ) : (
                  <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace />
                )
              } 
            />

            {/* User Routes */}
            <Route 
              path="/dashboard" 
              element={
                user && !isAdmin ? (
                  <Dashboard user={user} onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route 
              path="/builder/:id?" 
              element={
                user && !isAdmin ? (
                  <Builder user={user} onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />

            {/* Admin Routes */}
            <Route 
              path="/admin" 
              element={
                user && isAdmin ? (
                  <AdminDashboard user={user} onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                user && isAdmin ? (
                  <UserManagement user={user} onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />

            {/* Default Route */}
            <Route 
              path="/" 
              element={
                <Navigate to={
                  user ? (isAdmin ? "/admin" : "/dashboard") : "/login"
                } replace />
              } 
            />
          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  );
}

export default App;