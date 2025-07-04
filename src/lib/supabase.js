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
    console.log('Supabase client created successfully');
  } else {
    console.log('Using demo mode with localStorage fallback');
  }
} catch (error) {
  console.warn('Supabase connection failed, using localStorage fallback:', error);
}

// Enhanced fallback database functions using localStorage
const fallbackDB = {
  from: (table) => ({
    select: (columns = '*') => {
      const selectQuery = {
        eq: (column, value) => ({
          single: () => ({
            then: (callback) => {
              try {
                const data = JSON.parse(localStorage.getItem(table) || '[]');
                const filtered = data.filter(item => item[column] == value);
                const result = filtered.length > 0 ? filtered[0] : null;
                callback({ data: result, error: result ? null : { message: 'No data found' } });
                return { catch: (errorCallback) => {} };
              } catch (error) {
                callback({ data: null, error: error });
                return { catch: (errorCallback) => errorCallback(error) };
              }
            }
          }),
          then: (callback) => {
            try {
              const data = JSON.parse(localStorage.getItem(table) || '[]');
              const filtered = data.filter(item => item[column] == value);
              callback({ data: filtered, error: null });
              return { catch: (errorCallback) => {} };
            } catch (error) {
              callback({ data: [], error: error });
              return { catch: (errorCallback) => errorCallback(error) };
            }
          }
        }),
        order: (column, options = {}) => ({
          then: (callback) => {
            try {
              const data = JSON.parse(localStorage.getItem(table) || '[]');
              const sorted = [...data].sort((a, b) => {
                const aVal = a[column];
                const bVal = b[column];
                if (options.ascending === false) {
                  return bVal > aVal ? 1 : -1;
                }
                return aVal > bVal ? 1 : -1;
              });
              callback({ data: sorted, error: null });
              return { catch: (errorCallback) => {} };
            } catch (error) {
              callback({ data: [], error: error });
              return { catch: (errorCallback) => errorCallback(error) };
            }
          }
        }),
        then: (callback) => {
          try {
            const data = JSON.parse(localStorage.getItem(table) || '[]');
            callback({ data, error: null });
            return { catch: (errorCallback) => {} };
          } catch (error) {
            callback({ data: [], error: error });
            return { catch: (errorCallback) => errorCallback(error) };
          }
        }
      };
      return selectQuery;
    },
    insert: (data) => ({
      select: () => ({
        then: (callback) => {
          try {
            const existing = JSON.parse(localStorage.getItem(table) || '[]');
            const newData = Array.isArray(data) ? data : [data];
            const withIds = newData.map(item => ({
              ...item,
              id: item.id || Date.now() + Math.random(),
              created_at: item.created_at || new Date().toISOString()
            }));
            const updated = [...existing, ...withIds];
            localStorage.setItem(table, JSON.stringify(updated));
            callback({ data: withIds, error: null });
            return { catch: (errorCallback) => {} };
          } catch (error) {
            callback({ data: null, error: error });
            return { catch: (errorCallback) => errorCallback(error) };
          }
        }
      }),
      then: (callback) => {
        try {
          const existing = JSON.parse(localStorage.getItem(table) || '[]');
          const newData = Array.isArray(data) ? data : [data];
          const withIds = newData.map(item => ({
            ...item,
            id: item.id || Date.now() + Math.random(),
            created_at: item.created_at || new Date().toISOString()
          }));
          const updated = [...existing, ...withIds];
          localStorage.setItem(table, JSON.stringify(updated));
          callback({ data: withIds, error: null });
          return { catch: (errorCallback) => {} };
        } catch (error) {
          callback({ data: null, error: error });
          return { catch: (errorCallback) => errorCallback(error) };
        }
      }
    }),
    update: (data) => ({
      eq: (column, value) => ({
        select: () => ({
          then: (callback) => {
            try {
              const existing = JSON.parse(localStorage.getItem(table) || '[]');
              const updated = existing.map(item => 
                item[column] == value ? { ...item, ...data, updated_at: new Date().toISOString() } : item
              );
              localStorage.setItem(table, JSON.stringify(updated));
              const result = updated.filter(item => item[column] == value);
              callback({ data: result, error: null });
              return { catch: (errorCallback) => {} };
            } catch (error) {
              callback({ data: null, error: error });
              return { catch: (errorCallback) => errorCallback(error) };
            }
          }
        }),
        then: (callback) => {
          try {
            const existing = JSON.parse(localStorage.getItem(table) || '[]');
            const updated = existing.map(item => 
              item[column] == value ? { ...item, ...data, updated_at: new Date().toISOString() } : item
            );
            localStorage.setItem(table, JSON.stringify(updated));
            const result = updated.filter(item => item[column] == value);
            callback({ data: result, error: null });
            return { catch: (errorCallback) => {} };
          } catch (error) {
            callback({ data: null, error: error });
            return { catch: (errorCallback) => errorCallback(error) };
          }
        }
      })
    }),
    delete: () => ({
      eq: (column, value) => ({
        then: (callback) => {
          try {
            const existing = JSON.parse(localStorage.getItem(table) || '[]');
            const filtered = existing.filter(item => item[column] != value);
            localStorage.setItem(table, JSON.stringify(filtered));
            callback({ data: [], error: null });
            return { catch: (errorCallback) => {} };
          } catch (error) {
            callback({ data: null, error: error });
            return { catch: (errorCallback) => errorCallback(error) };
          }
        }
      })
    })
  }),
  auth: {
    signUp: ({ email, password }) => ({
      then: (callback) => {
        try {
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
          return { catch: (errorCallback) => {} };
        } catch (error) {
          callback({ data: null, error: error });
          return { catch: (errorCallback) => errorCallback(error) };
        }
      }
    }),
    signInWithPassword: ({ email, password }) => ({
      then: (callback) => {
        try {
          const users = JSON.parse(localStorage.getItem('supabase_users') || '[]');
          const user = users.find(u => u.email === email && u.password === password);
          if (user) {
            const { password: _, ...userData } = user;
            localStorage.setItem('supabase_session', JSON.stringify(userData));
            callback({ data: { user: userData }, error: null });
          } else {
            callback({ data: null, error: { message: 'Invalid credentials' } });
          }
          return { catch: (errorCallback) => {} };
        } catch (error) {
          callback({ data: null, error: error });
          return { catch: (errorCallback) => errorCallback(error) };
        }
      }
    }),
    signOut: () => ({
      then: (callback) => {
        try {
          localStorage.removeItem('supabase_session');
          callback({ error: null });
          return { catch: (errorCallback) => {} };
        } catch (error) {
          callback({ error: error });
          return { catch: (errorCallback) => errorCallback(error) };
        }
      }
    }),
    getSession: () => {
      try {
        const session = localStorage.getItem('supabase_session');
        return Promise.resolve({
          data: { session: session ? { user: JSON.parse(session) } : null },
          error: null
        });
      } catch (error) {
        return Promise.resolve({
          data: { session: null },
          error: error
        });
      }
    }
  }
};

const finalSupabase = supabase || fallbackDB;

// Initialize demo data
const initDemoData = () => {
  try {
    if (!localStorage.getItem('reservation_sections_db')) {
      localStorage.setItem('reservation_sections_db', JSON.stringify([]));
    }
    if (!localStorage.getItem('users_db')) {
      localStorage.setItem('users_db', JSON.stringify([]));
    }
    if (!localStorage.getItem('reservations_db')) {
      localStorage.setItem('reservations_db', JSON.stringify([]));
    }
    if (!localStorage.getItem('reservationSections')) {
      localStorage.setItem('reservationSections', JSON.stringify([]));
    }
    console.log('Demo data initialized');
  } catch (error) {
    console.error('Error initializing demo data:', error);
  }
};

// Initialize on load
if (typeof window !== 'undefined') {
  initDemoData();
}

export default finalSupabase;