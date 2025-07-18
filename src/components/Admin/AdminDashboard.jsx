import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUsers, FiList, FiBarChart, FiLogOut, FiSettings } from 'react-icons/fi';
import { DB } from '../../schema/database';

const AdminDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSections: 0,
    activeSections: 0,
    recentUsers: []
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = () => {
    const users = DB.getUsers();
    const sections = DB.getSections();
    
    setStats({
      totalUsers: users.length,
      totalSections: sections.length,
      activeSections: sections.filter(s => s.isActive).length,
      recentUsers: users.slice(-5).reverse()
    });
  };

  const menuItems = [
    {
      id: 'users',
      label: 'User Management',
      icon: FiUsers,
      description: 'Manage registered users',
      path: '/admin/users',
      color: 'bg-blue-500'
    },
    {
      id: 'sections',
      label: 'Sections List',
      icon: FiList,
      description: 'View all reservation sections',
      path: '/admin/sections',
      color: 'bg-green-500'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: FiBarChart,
      description: 'View usage statistics',
      path: '/admin/analytics',
      color: 'bg-purple-500'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: FiSettings,
      description: 'System configuration',
      path: '/admin/settings',
      color: 'bg-orange-500'
    }
  ];

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: FiUsers,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total Sections',
      value: stats.totalSections,
      icon: FiList,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Active Sections',
      value: stats.activeSections,
      icon: FiBarChart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
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

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {statCards.map((stat) => (
            <div key={stat.title} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Menu Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {menuItems.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={() => navigate(item.path)}
            >
              <div className="p-6">
                <div className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center mb-4`}>
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.label}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;