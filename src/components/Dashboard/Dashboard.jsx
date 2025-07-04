import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit3, FiTrash2, FiCopy, FiDownload, FiLogOut, FiEye } from 'react-icons/fi';
import { DB } from '../../schema/database';

const Dashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadSections();
  }, [user]);

  const loadSections = () => {
    const userSections = DB.getUserSections(user.id);
    setSections(userSections);
  };

  const handleDelete = (sectionId) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      DB.deleteSection(sectionId);
      loadSections();
    }
  };

  const handleDuplicate = (section) => {
    const newSection = DB.addSection({
      name: `${section.name} (Copy)`,
      settings: section.settings
    }, user.id);
    
    loadSections();
  };

  const handleExport = (section) => {
    const dataStr = JSON.stringify(section, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `${section.name.replace(/\s+/g, '_')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
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
          </div>
          <button
            onClick={onLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <FiLogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          <button
            onClick={() => navigate('/builder')}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-medium"
          >
            <FiPlus className="h-5 w-5" />
            <span>Create New Section</span>
          </button>

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

        {/* Sections Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredSections.length === 0 ? (
            <div className="col-span-full text-center py-12">
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
                  <FiPlus className="h-4 w-4" />
                  <span>Create Section</span>
                </button>
              )}
            </div>
          ) : (
            filteredSections.map((section) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {section.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Created {new Date(section.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => navigate(`/preview/${section.id}`)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Preview"
                      >
                        <FiEye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/builder/${section.id}`)}
                        className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <FiEdit3 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {section.settings.buttonStyle}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      {section.settings.backgroundType}
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDuplicate(section)}
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                      <FiCopy className="h-4 w-4" />
                      <span>Copy</span>
                    </button>
                    <button
                      onClick={() => handleExport(section)}
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                    >
                      <FiDownload className="h-4 w-4" />
                      <span>Export</span>
                    </button>
                    <button
                      onClick={() => handleDelete(section.id)}
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                    >
                      <FiTrash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;