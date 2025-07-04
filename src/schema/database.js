// Simple localStorage-based database schema
export const DB_KEYS = {
  USERS: 'trb_users',
  SECTIONS: 'trb_sections',
  CURRENT_USER: 'trb_current_user'
};

// User schema
export const createUser = (userData) => ({
  id: Date.now().toString(),
  username: userData.username,
  email: userData.email,
  password: userData.password,
  role: userData.role || 'user',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

// Section schema
export const createSection = (sectionData, userId) => ({
  id: Date.now().toString(),
  name: sectionData.name,
  userId: userId,
  settings: sectionData.settings || getDefaultSettings(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isActive: true
});

// Default settings schema
export const getDefaultSettings = () => ({
  // Content
  title: 'Reserve Your Table',
  subtitle: 'Book your perfect dining experience',
  buttonText: 'Make Reservation',
  
  // Colors
  titleColor: '#1f2937',
  subtitleColor: '#6b7280',
  buttonColor: '#3b82f6',
  buttonTextColor: '#ffffff',
  backgroundColor: '#ffffff',
  
  // Layout
  alignment: 'center',
  padding: 'large',
  maxWidth: '800px',
  
  // Button
  buttonStyle: 'modern',
  buttonSize: 'medium',
  buttonRadius: 8,
  
  // Background
  backgroundType: 'color',
  backgroundImage: '',
  
  // Form
  showDatePicker: true,
  showTimePicker: true,
  showGuestCount: true,
  showSpecialRequests: true,
  
  // Effects
  shadow: 'medium',
  borderRadius: 12,
  animation: 'fadeIn'
});

// Database operations
export const DB = {
  // Users
  getUsers: () => JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]'),
  saveUsers: (users) => localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users)),
  
  addUser: (userData) => {
    const users = DB.getUsers();
    const newUser = createUser(userData);
    users.push(newUser);
    DB.saveUsers(users);
    return newUser;
  },
  
  findUser: (username, password) => {
    const users = DB.getUsers();
    return users.find(u => u.username === username && u.password === password);
  },
  
  userExists: (username, email) => {
    const users = DB.getUsers();
    return users.some(u => u.username === username || u.email === email);
  },
  
  // Sections
  getSections: () => JSON.parse(localStorage.getItem(DB_KEYS.SECTIONS) || '[]'),
  saveSections: (sections) => localStorage.setItem(DB_KEYS.SECTIONS, JSON.stringify(sections)),
  
  getUserSections: (userId) => {
    const sections = DB.getSections();
    return sections.filter(s => s.userId === userId);
  },
  
  addSection: (sectionData, userId) => {
    const sections = DB.getSections();
    const newSection = createSection(sectionData, userId);
    sections.push(newSection);
    DB.saveSections(sections);
    return newSection;
  },
  
  updateSection: (sectionId, updates) => {
    const sections = DB.getSections();
    const index = sections.findIndex(s => s.id === sectionId);
    if (index !== -1) {
      sections[index] = { ...sections[index], ...updates, updatedAt: new Date().toISOString() };
      DB.saveSections(sections);
      return sections[index];
    }
    return null;
  },
  
  deleteSection: (sectionId) => {
    const sections = DB.getSections();
    const filtered = sections.filter(s => s.id !== sectionId);
    DB.saveSections(filtered);
    return filtered.length !== sections.length;
  },
  
  getSection: (sectionId) => {
    const sections = DB.getSections();
    return sections.find(s => s.id === sectionId);
  },
  
  // Current user
  getCurrentUser: () => JSON.parse(localStorage.getItem(DB_KEYS.CURRENT_USER) || 'null'),
  setCurrentUser: (user) => localStorage.setItem(DB_KEYS.CURRENT_USER, JSON.stringify(user)),
  clearCurrentUser: () => localStorage.removeItem(DB_KEYS.CURRENT_USER)
};

// Initialize admin user
export const initializeDB = () => {
  const users = DB.getUsers();
  if (users.length === 0) {
    // Create admin user
    DB.addUser({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin'
    });
  }
};