import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import supabase from '../lib/supabase';

const { FiPlus, FiEdit3, FiTrash2, FiCopy, FiDownload, FiUpload, FiLogOut, FiCalendar, FiEye, FiDatabase, FiRefreshCw } = FiIcons;

const Dashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dbStatus, setDbStatus] = useState('checking');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkDatabaseConnection();
    loadSections();
  }, [user]);

  const checkDatabaseConnection = async () => {
    try {
      const { data, error } = await supabase.from('reservation_sections_db9x8k7m2q').select('count', { count: 'exact' });
      if (!error) {
        setDbStatus('connected');
        console.log('Database connected');
      } else {
        setDbStatus('localStorage');
        console.log('Database error, using localStorage:', error);
      }
    } catch (error) {
      setDbStatus('localStorage');
      console.log('Database connection failed, using localStorage:', error);
    }
  };

  const loadSections = async () => {
    setIsLoading(true);
    try {
      // Try Supabase first
      const { data, error } = await supabase
        .from('reservation_sections_db9x8k7m2q')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (data && !error) {
        console.log('Loaded from Supabase:', data);
        setSections(data);
        setIsLoading(false);
        return;
      }
      
      console.log('Supabase query error:', error);
    } catch (supabaseError) {
      console.log('Supabase error:', supabaseError);
    }
    
    // Fallback to localStorage
    console.log('Loading from localStorage');
    const savedSections = localStorage.getItem('reservationSections');
    if (savedSections) {
      const allSections = JSON.parse(savedSections);
      const userSections = allSections.filter(section => 
        section.userId === user.id || section.user_id === user.id
      );
      setSections(userSections);
    } else {
      setSections([]);
    }
    setIsLoading(false);
  };

  const refreshSections = () => {
    loadSections();
  };

  const deleteSectionHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      try {
        // Try Supabase first
        const { error } = await supabase
          .from('reservation_sections_db9x8k7m2q')
          .delete()
          .eq('id', id);
          
        if (!error) {
          setSections(sections.filter(section => section.id !== id));
          return;
        }
      } catch (error) {
        console.error('Supabase delete error:', error);
      }
      
      // Fallback to localStorage
      const savedSections = localStorage.getItem('reservationSections');
      if (savedSections) {
        const allSections = JSON.parse(savedSections);
        const updatedSections = allSections.filter(section => section.id !== id);
        localStorage.setItem('reservationSections', JSON.stringify(updatedSections));
        setSections(sections.filter(section => section.id !== id));
      }
    }
  };

  const duplicateSection = async (section) => {
    try {
      const newSection = {
        name: `${section.name} (Copy)`,
        settings: section.settings,
        user_id: user.id
      };

      try {
        // Try Supabase first
        const { data, error } = await supabase
          .from('reservation_sections_db9x8k7m2q')
          .insert([newSection])
          .select()
          .single();
          
        if (!error && data) {
          setSections([data, ...sections]);
          return;
        }
      } catch (supabaseError) {
        console.error('Supabase duplicate error:', supabaseError);
      }
      
      // Fallback to localStorage
      const fallbackSection = {
        ...newSection,
        id: Date.now(),
        userId: user.id,
        created_at: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      
      const savedSections = localStorage.getItem('reservationSections');
      const allSections = savedSections ? JSON.parse(savedSections) : [];
      allSections.push(fallbackSection);
      localStorage.setItem('reservationSections', JSON.stringify(allSections));
      setSections([fallbackSection, ...sections]);
    } catch (error) {
      console.error('Error duplicating section:', error);
    }
  };

  const exportSection = (section) => {
    const dataStr = JSON.stringify(section, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `${section.name.replace(/\s+/g, '_')}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importSection = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const importedSection = JSON.parse(e.target.result);
          const newSection = {
            name: `${importedSection.name} (Imported)`,
            settings: importedSection.settings,
            user_id: user.id
          };

          try {
            // Try Supabase first
            const { data, error } = await supabase
              .from('reservation_sections_db9x8k7m2q')
              .insert([newSection])
              .select()
              .single();
              
            if (!error && data) {
              setSections([data, ...sections]);
              return;
            }
          } catch (supabaseError) {
            console.error('Supabase import error:', supabaseError);
          }
          
          // Fallback to localStorage
          const fallbackSection = {
            ...newSection,
            id: Date.now(),
            userId: user.id,
            created_at: new Date().toISOString(),
            createdAt: new Date().toISOString()
          };
          
          const savedSections = localStorage.getItem('reservationSections');
          const allSections = savedSections ? JSON.parse(savedSections) : [];
          allSections.push(fallbackSection);
          localStorage.setItem('reservationSections', JSON.stringify(allSections));
          setSections([fallbackSection, ...sections]);
        } catch (error) {
          alert('Error importing section. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
    event.target.value = '';
  };

  const filteredSections = sections.filter(section =>
    section.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {user.username}!</p>
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiDatabase} className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500">
                  Database: 
                  <span className={`ml-1 ${dbStatus === 'connected' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {dbStatus === 'connected' ? 'Supabase Connected' : 'LocalStorage Fallback'}
                  </span>
                </span>
              </div>
              <button
                onClick={refreshSections}
                className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                title="Refresh sections"
              >
                <SafeIcon icon={FiRefreshCw} className="h-3 w-3" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <SafeIcon icon={FiLogOut} className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </motion.div>

        {/* Actions Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          <button
            onClick={() => navigate('/builder')}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium"
          >
            <SafeIcon icon={FiPlus} className="h-5 w-5" />
            <span>Create New Section</span>
          </button>

          <div className="flex space-x-2">
            <label className="flex items-center space-x-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors cursor-pointer">
              <SafeIcon icon={FiUpload} className="h-4 w-4" />
              <span>Import</span>
              <input
                type="file"
                accept=".json"
                onChange={importSection}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex-1">
            <input
              type="text"
              placeholder="Search sections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading sections...</p>
          </div>
        ) : (
          /* Sections Grid */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredSections.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <SafeIcon icon={FiCalendar} className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'No matching sections' : 'No sections yet'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm 
                    ? 'Try adjusting your search terms.' 
                    : 'Create your first table reservation section to get started.'
                  }
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => navigate('/builder')}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <SafeIcon icon={FiPlus} className="h-4 w-4" />
                    <span>Create Section</span>
                  </button>
                )}
              </div>
            ) : (
              filteredSections.map((section) => (
                <motion.div
                  key={section.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{section.name}</h3>
                        <p className="text-sm text-gray-500">
                          Created {new Date(section.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => navigate(`/builder/${section.id}`)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Preview"
                        >
                          <SafeIcon icon={FiEye} className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/builder/${section.id}`)}
                          className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <SafeIcon icon={FiEdit3} className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {section.settings?.buttonStyle || 'Default'}
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        {section.settings?.backgroundType || 'Color'}
                      </span>
                      {section.settings?.enableEmailNotifications && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                          Email Enabled
                        </span>
                      )}
                      {section.settings?.enableRecaptcha && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                          reCAPTCHA
                        </span>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => duplicateSection(section)}
                        className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                      >
                        <SafeIcon icon={FiCopy} className="h-4 w-4" />
                        <span>Copy</span>
                      </button>
                      <button
                        onClick={() => exportSection(section)}
                        className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                      >
                        <SafeIcon icon={FiDownload} className="h-4 w-4" />
                        <span>Export</span>
                      </button>
                      <button
                        onClick={() => deleteSectionHandler(section.id)}
                        className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                      >
                        <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;