import {useState, useEffect} from 'react'
import supabase from '../lib/supabase'

export const useSupabaseAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)

  useEffect(() => {
    let mounted = true

    // Check for stored user first (for demo admins)
    const checkStoredUser = () => {
      try {
        const storedUser = localStorage.getItem('currentUser')
        if (storedUser) {
          const userData = JSON.parse(storedUser)
          if (mounted) {
            setUser(userData)
            setLoading(false)
            return true
          }
        }
      } catch (error) {
        console.error('Error checking stored user:', error)
      }
      return false
    }

    // Check stored user first
    if (checkStoredUser()) {
      return
    }

    // Set a maximum timeout for loading
    const maxLoadingTime = setTimeout(() => {
      if (mounted) {
        console.warn('Auth loading timeout - proceeding without auth')
        setLoading(false)
      }
    }, 5000) // 5 seconds max

    // Get initial session with timeout
    const getInitialSession = async () => {
      try {
        console.log('Getting initial session...')
        // Use Promise.race to add timeout
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Session timeout')), 3000)
        )

        const {data: {session}, error} = await Promise.race([
          sessionPromise,
          timeoutPromise
        ])

        if (!mounted) return

        if (error) {
          console.error('Error getting session:', error)
          setLoading(false)
          return
        }

        console.log('Session retrieved:', session ? 'Found' : 'None')
        setSession(session)
        if (session?.user) {
          await loadUserProfile(session.user.id)
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error)
        if (mounted) {
          // Create a fallback offline mode
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes with timeout protection
    let authSubscription
    try {
      const {data: {subscription}} = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (!mounted) return
          console.log('Auth state changed:', event)
          setSession(session)
          if (session?.user) {
            await loadUserProfile(session.user.id)
          } else {
            setUser(null)
            setLoading(false)
          }
        }
      )
      authSubscription = subscription
    } catch (error) {
      console.error('Error setting up auth listener:', error)
      setLoading(false)
    }

    return () => {
      mounted = false
      clearTimeout(maxLoadingTime)
      if (authSubscription) {
        authSubscription.unsubscribe()
      }
    }
  }, [])

  const loadUserProfile = async (userId) => {
    try {
      console.log('Loading user profile for:', userId)
      // Add timeout for profile loading
      const profilePromise = supabase
        .from('table_reservation.users')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile timeout')), 2000)
      )

      const {data, error} = await Promise.race([
        profilePromise,
        timeoutPromise
      ])

      if (error && error.code !== 'PGRST116') {
        console.warn('Profile loading failed, using auth data:', error)
        throw error
      }

      if (data) {
        console.log('User profile loaded from database')
        setUser(data)
      } else {
        console.log('Creating basic profile from auth data')
        await createBasicProfile(userId)
      }
    } catch (error) {
      console.warn('Profile loading failed, creating fallback:', error)
      await createBasicProfile(userId)
    } finally {
      setLoading(false)
    }
  }

  const createBasicProfile = async (userId) => {
    try {
      const {data: {user: authUser}} = await supabase.auth.getUser()
      if (authUser) {
        const basicUser = {
          id: authUser.id,
          email: authUser.email,
          username: authUser.user_metadata?.username || authUser.email?.split('@')[0] || `user_${Date.now()}`,
          role: 'user'
        }
        console.log('Created basic user profile:', basicUser)
        setUser(basicUser)
      }
    } catch (error) {
      console.error('Failed to create basic profile:', error)
      // Even if this fails, we can still work in offline mode
      setUser({
        id: 'offline_user',
        email: 'offline@example.com',
        username: 'Offline User',
        role: 'user'
      })
    }
  }

  const signUp = async (userData) => {
    try {
      const {email, username, password} = userData
      console.log('Signing up user:', {email, username})

      // Create auth user with timeout
      const signUpPromise = supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            role: 'user'
          }
        }
      })

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Signup timeout')), 10000)
      )

      const {data: authData, error: authError} = await Promise.race([
        signUpPromise,
        timeoutPromise
      ])

      if (authError) {
        console.error('Auth signup error:', authError)
        throw authError
      }

      if (!authData.user) {
        throw new Error('Failed to create user account')
      }

      // Try to create user profile (non-blocking)
      try {
        await supabase
          .from('table_reservation.users')
          .insert({
            id: authData.user.id,
            email,
            username,
            role: 'user'
          })
      } catch (profileError) {
        console.warn('Could not create user profile, continuing:', profileError)
      }

      return {user: authData.user, session: authData.session}
    } catch (error) {
      console.error('Signup error:', error)
      throw error
    }
  }

  const signIn = async (credentials) => {
    try {
      const {username, password} = credentials
      console.log('Signing in user:', username)

      let email = username
      // Try to find email by username (with timeout)
      if (!username.includes('@')) {
        try {
          const lookupPromise = supabase
            .from('table_reservation.users')
            .select('email')
            .eq('username', username)
            .maybeSingle()

          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Lookup timeout')), 1000)
          )

          const {data: userData} = await Promise.race([
            lookupPromise,
            timeoutPromise
          ])

          if (userData?.email) {
            email = userData.email
          }
        } catch (error) {
          console.warn('Username lookup failed, using as email:', error)
          email = username
        }
      }

      // Sign in with timeout
      const signInPromise = supabase.auth.signInWithPassword({
        email,
        password
      })

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Sign in timeout')), 10000)
      )

      const {data, error} = await Promise.race([
        signInPromise,
        timeoutPromise
      ])

      if (error) {
        console.error('Sign in error:', error)
        throw new Error('Invalid username or password')
      }

      // Update last login (non-blocking)
      try {
        await supabase
          .from('table_reservation.users')
          .update({last_login: new Date().toISOString()})
          .eq('id', data.user.id)
      } catch (error) {
        console.warn('Could not update last login:', error)
      }

      return data
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      // Clear stored user first
      localStorage.removeItem('currentUser')
      
      const {error} = await supabase.auth.signOut()
      if (error) throw error
      
      setUser(null)
      setSession(null)
    } catch (error) {
      console.error('Sign out error:', error)
      // Force local logout even if server logout fails
      localStorage.removeItem('currentUser')
      setUser(null)
      setSession(null)
      throw error
    }
  }

  const updateProfile = async (updates) => {
    try {
      if (!user?.id) throw new Error('No user logged in')

      const {data, error} = await supabase
        .from('table_reservation.users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        console.warn('Could not update profile in database:', error)
        // Update local state anyway
        setUser({...user, ...updates})
        return {...user, ...updates}
      }

      setUser(data)
      return data
    } catch (error) {
      console.error('Update profile error:', error)
      throw error
    }
  }

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile
  }
}