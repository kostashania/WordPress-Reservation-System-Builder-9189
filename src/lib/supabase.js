import { createClient } from '@supabase/supabase-js'

// Demo Supabase configuration - replace with your actual project details
const SUPABASE_URL = 'https://your-project-id.supabase.co'
const SUPABASE_ANON_KEY = 'your-anon-key-here'

// For demo purposes, we'll use localStorage as fallback
let supabase = null;

try {
  if (SUPABASE_URL !== 'https://your-project-id.supabase.co' && SUPABASE_ANON_KEY !== 'your-anon-key-here') {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
  }
} catch (error) {
  console.warn('Supabase connection failed, using localStorage fallback:', error);
}

// Fallback database functions using localStorage
const fallbackDB = {
  from: (table) => ({
    select: (columns = '*') => ({
      eq: (column, value) => ({
        then: (callback) => {
          const data = JSON.parse(localStorage.getItem(table) || '[]');
          const filtered = data.filter(item => item[column] === value);
          callback({ data: filtered, error: null });
          return { catch: () => {} };
        }
      }),
      then: (callback) => {
        const data = JSON.parse(localStorage.getItem(table) || '[]');
        callback({ data, error: null });
        return { catch: () => {} };
      }
    }),
    insert: (data) => ({
      then: (callback) => {
        const existing = JSON.parse(localStorage.getItem(table) || '[]');
        const newData = Array.isArray(data) ? data : [data];
        const withIds = newData.map(item => ({
          ...item,
          id: item.id || Date.now() + Math.random(),
          created_at: item.created_at || new Date().toISOString()
        }));
        localStorage.setItem(table, JSON.stringify([...existing, ...withIds]));
        callback({ data: withIds, error: null });
        return { catch: () => {} };
      }
    }),
    update: (data) => ({
      eq: (column, value) => ({
        then: (callback) => {
          const existing = JSON.parse(localStorage.getItem(table) || '[]');
          const updated = existing.map(item => 
            item[column] === value ? { ...item, ...data, updated_at: new Date().toISOString() } : item
          );
          localStorage.setItem(table, JSON.stringify(updated));
          callback({ data: updated.filter(item => item[column] === value), error: null });
          return { catch: () => {} };
        }
      })
    }),
    delete: () => ({
      eq: (column, value) => ({
        then: (callback) => {
          const existing = JSON.parse(localStorage.getItem(table) || '[]');
          const filtered = existing.filter(item => item[column] !== value);
          localStorage.setItem(table, JSON.stringify(filtered));
          callback({ data: [], error: null });
          return { catch: () => {} };
        }
      })
    })
  }),
  auth: {
    signUp: ({ email, password }) => ({
      then: (callback) => {
        const users = JSON.parse(localStorage.getItem('supabase_users') || '[]');
        const newUser = {
          id: Date.now().toString(),
          email,
          created_at: new Date().toISOString(),
          user_metadata: {}
        };
        users.push({ ...newUser, password }); // In real app, never store plain passwords
        localStorage.setItem('supabase_users', JSON.stringify(users));
        callback({ data: { user: newUser }, error: null });
        return { catch: () => {} };
      }
    }),
    signInWithPassword: ({ email, password }) => ({
      then: (callback) => {
        const users = JSON.parse(localStorage.getItem('supabase_users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
          const { password: _, ...userData } = user;
          localStorage.setItem('supabase_session', JSON.stringify(userData));
          callback({ data: { user: userData }, error: null });
        } else {
          callback({ data: null, error: { message: 'Invalid credentials' } });
        }
        return { catch: () => {} };
      }
    }),
    signOut: () => ({
      then: (callback) => {
        localStorage.removeItem('supabase_session');
        callback({ error: null });
        return { catch: () => {} };
      }
    }),
    getSession: () => {
      const session = localStorage.getItem('supabase_session');
      return Promise.resolve({
        data: { session: session ? { user: JSON.parse(session) } : null },
        error: null
      });
    }
  }
};

export default supabase || fallbackDB;

// Initialize demo data
const initDemoData = () => {
  if (!localStorage.getItem('reservation_sections_db')) {
    localStorage.setItem('reservation_sections_db', JSON.stringify([]));
  }
  if (!localStorage.getItem('users_db')) {
    localStorage.setItem('users_db', JSON.stringify([]));
  }
  if (!localStorage.getItem('reservations_db')) {
    localStorage.setItem('reservations_db', JSON.stringify([]));
  }
};

// Initialize on load
if (typeof window !== 'undefined') {
  initDemoData();
}