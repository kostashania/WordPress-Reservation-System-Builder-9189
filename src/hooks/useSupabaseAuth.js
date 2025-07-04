import { useState, useEffect } from 'react'
import supabase from '../lib/supabase'
import bcrypt from 'bcryptjs'

export const useSupabaseAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        loadUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        if (session?.user) {
          await loadUserProfile(session.user.id)
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('table_reservation.users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setUser(data)
    } catch (error) {
      console.error('Error loading user profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (userData) => {
    try {
      const { email, username, password } = userData
      
      // Check if user already exists in our custom users table
      const { data: existingUser } = await supabase
        .from('table_reservation.users')
        .select('id')
        .or(`email.eq.${email},username.eq.${username}`)
        .single()

      if (existingUser) {
        throw new Error('Username or email already exists')
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            role: 'user'
          }
        }
      })

      if (authError) throw authError

      // Create user profile in our custom table
      const passwordHash = await bcrypt.hash(password, 10)
      
      const { data: profileData, error: profileError } = await supabase
        .from('table_reservation.users')
        .insert({
          id: authData.user.id,
          email,
          username,
          password_hash: passwordHash,
          role: 'user'
        })
        .select()
        .single()

      if (profileError) throw profileError

      return { user: profileData, session: authData.session }
    } catch (error) {
      throw error
    }
  }

  const signIn = async (credentials) => {
    try {
      const { username, password } = credentials
      
      // First, get user by username to find email
      const { data: userData, error: userError } = await supabase
        .from('table_reservation.users')
        .select('email, password_hash, is_active')
        .eq('username', username)
        .single()

      if (userError || !userData) {
        throw new Error('Invalid username or password')
      }

      if (!userData.is_active) {
        throw new Error('Account is deactivated')
      }

      // Verify password
      const passwordValid = await bcrypt.compare(password, userData.password_hash)
      if (!passwordValid) {
        throw new Error('Invalid username or password')
      }

      // Sign in with Supabase Auth using email
      const { data, error } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password
      })

      if (error) throw error

      // Update last login
      await supabase
        .from('table_reservation.users')
        .update({ last_login: new Date().toISOString() })
        .eq('email', userData.email)

      return data
    } catch (error) {
      throw error
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      setSession(null)
    } catch (error) {
      throw error
    }
  }

  const updateProfile = async (updates) => {
    try {
      if (!user?.id) throw new Error('No user logged in')

      const { data, error } = await supabase
        .from('table_reservation.users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error
      setUser(data)
      return data
    } catch (error) {
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