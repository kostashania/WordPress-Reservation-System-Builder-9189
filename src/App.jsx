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
  const [appInitialized, setAppInitialized] = useState(false)

  useEffect(() => {
    // Shorter delay and fallback initialization
    const timer = setTimeout(() => {
      setAppInitialized(true)
    }, 2000) // Reduced from 1000ms to ensure auth has time

    return () => clearTimeout(timer)
  }, [])

  // Force initialization if taking too long
  useEffect(() => {
    const forceInit = setTimeout(() => {
      if (!appInitialized) {
        console.warn('Forcing app initialization due to timeout')
        setAppInitialized(true)
      }
    }, 8000) // Force after 8 seconds

    return () => clearTimeout(forceInit)
  }, [appInitialized])

  if (loading && !appInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your workspace...</p>
          <div className="mt-4 text-xs text-gray-500">
            {loading ? 'Authenticating...' : 'Initializing...'}
          </div>
          <div className="mt-2 text-xs text-gray-400">
            If this takes too long, please refresh the page
          </div>
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