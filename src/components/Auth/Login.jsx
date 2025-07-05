import React, {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {motion} from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'
import {useSupabaseAuth} from '../../hooks/useSupabaseAuth'

const {FiUser, FiLock, FiEye, FiEyeOff} = FiIcons

const Login = () => {
  const navigate = useNavigate()
  const {signIn, loading} = useSupabaseAuth()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Check for hardcoded admin credentials first
      if ((formData.username === 'admin' || formData.username === 'adminreserv') && 
          formData.password === '1234567') {
        // Create a mock admin user for demo
        const adminUser = {
          id: formData.username === 'admin' ? 'admin_001' : 'adminreserv_001',
          username: formData.username,
          email: formData.username === 'admin' ? 'admin@demo.com' : 'adminreserv@demo.com',
          role: 'admin'
        }
        
        // Store in localStorage for persistence
        localStorage.setItem('currentUser', JSON.stringify(adminUser))
        
        setTimeout(() => {
          navigate('/dashboard')
          setIsLoading(false)
        }, 1000)
        return
      }

      // Try Supabase authentication
      await signIn(formData)
      navigate('/dashboard')
    } catch (err) {
      console.error('Login error:', err)
      setError(err.message || 'Login failed. Please check your credentials and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{opacity: 0, y: 20}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.5}}
        className="max-w-md w-full space-y-8"
      >
        <div>
          <motion.div
            initial={{scale: 0}}
            animate={{scale: 1}}
            transition={{delay: 0.2, type: "spring", stiffness: 200}}
            className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
          >
            <SafeIcon icon={FiUser} className="h-8 w-8 text-white" />
          </motion.div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Table Reservation Builder
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to create beautiful reservation sections
          </p>
        </div>

        <motion.form
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          transition={{delay: 0.3}}
          className="mt-8 space-y-6"
          onSubmit={handleSubmit}
        >
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="sr-only">Username or Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SafeIcon icon={FiUser} className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="appearance-none rounded-lg relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Username or Email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SafeIcon icon={FiLock} className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none rounded-lg relative block w-full px-3 py-3 pl-10 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <SafeIcon
                    icon={showPassword ? FiEyeOff : FiEye}
                    className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors"
                  />
                </button>
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{scale: 1.02}}
            whileTap={{scale: 0.98}}
            type="submit"
            disabled={isLoading || loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isLoading || loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              'Sign In'
            )}
          </motion.button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Don't have an account? Register
            </button>
          </div>
        </motion.form>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Demo Credentials</h4>
          <div className="text-blue-700 text-sm space-y-1">
            <p><strong>Admin:</strong> admin / 1234567</p>
            <p><strong>Admin 2:</strong> adminreserv / 1234567</p>
            <p><strong>Or register</strong> a new user account</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Login