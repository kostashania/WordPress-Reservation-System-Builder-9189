import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Builder from './components/Builder';
import AdminDashboard from './components/AdminDashboard';
import UserManagement from './components/UserManagement';
import SectionsList from './components/SectionsList';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('user');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Routes>
          <Route 
            path="/login" 
            element={
              isLoggedIn ? (
                <Navigate to={isAdmin ? "/admin" : "/dashboard"} />
              ) : (
                <Login 
                  onLogin={handleLogin} 
                  showRegister={showRegister}
                  setShowRegister={setShowRegister}
                />
              )
            } 
          />
          <Route 
            path="/register" 
            element={
              isLoggedIn ? (
                <Navigate to={isAdmin ? "/admin" : "/dashboard"} />
              ) : (
                <Register 
                  onRegister={handleLogin}
                  setShowRegister={setShowRegister}
                />
              )
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              isLoggedIn && !isAdmin ? (
                <Dashboard user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
          <Route 
            path="/builder/:id?" 
            element={
              isLoggedIn && !isAdmin ? (
                <Builder user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
          <Route 
            path="/admin" 
            element={
              isLoggedIn && isAdmin ? (
                <AdminDashboard user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              isLoggedIn && isAdmin ? (
                <UserManagement user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
          <Route 
            path="/admin/sections" 
            element={
              isLoggedIn && isAdmin ? (
                <SectionsList user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
          <Route path="/" element={<Navigate to={isLoggedIn ? (isAdmin ? "/admin" : "/dashboard") : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;