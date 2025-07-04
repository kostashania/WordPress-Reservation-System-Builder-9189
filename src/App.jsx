import React, { useState, useEffect } from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

// Components
import Login from './components/Auth/Login'
import Register from './components/Auth/Register'
import Dashboard from './components/Dashboard/Dashboard'
import Builder from './components/Builder/Builder'

// Hooks
import { useSupabaseAuth } from './hooks/useSupabaseAuth'

// Styles
import './App.css'

function App() {
  const { user, loading } = useSupabaseAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <AnimatePresence mode="wait">
          <Routes>
            {/* Auth Routes */}
            <Route 
              path="/login" 
              element={!user ? <Login /> : <Navigate to="/dashboard" replace />} 
            />
            <Route 
              path="/register" 
              element={!user ? <Register /> : <Navigate to="/dashboard" replace />} 
            />

            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={user ? <Dashboard /> : <Navigate to="/login" replace />} 
            />
            <Route 
              path="/builder/:id?" 
              element={user ? <Builder /> : <Navigate to="/login" replace />} 
            />

            {/* Default Route */}
            <Route 
              path="/" 
              element={<Navigate to={user ? "/dashboard" : "/login"} replace />} 
            />
          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  )
}

export default App