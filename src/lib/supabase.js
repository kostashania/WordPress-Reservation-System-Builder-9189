import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://smkhqyxtjrtavlzgjbqm.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNta2hxeXh0anJ0YXZsemdqYnFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NzM1MjgsImV4cCI6MjA2NjU0OTUyOH0.qsEvNlujeYTu1aTIy2ne_sbYzl9XW5Wv1VrxLoYkjD4'

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase environment variables')
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  }
})

// Test connection with timeout
const testConnection = async () => {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)
    
    const { error } = await supabase
      .from('table_reservation.users')
      .select('count', { count: 'exact', head: true })
      .abortSignal(controller.signal)
    
    clearTimeout(timeoutId)
    
    if (error) {
      console.warn('Supabase connection test failed:', error.message)
    } else {
      console.log('Supabase connected successfully')
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn('Supabase connection test timed out')
    } else {
      console.warn('Supabase connection test failed:', error.message)
    }
  }
}

testConnection()

export default supabase