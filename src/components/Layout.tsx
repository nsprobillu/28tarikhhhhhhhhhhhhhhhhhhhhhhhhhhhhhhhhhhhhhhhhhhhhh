import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Mail, Settings, LogOut, User, Moon, Sun, Menu, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChangeEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/change-password`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Password changed successfully');
      setTimeout(onClose, 2000);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-auto">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Change Password</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4A90E2] focus:ring focus:ring-[#4A90E2] focus:ring-opacity-50"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4A90E2] focus:ring focus:ring-[#4A90E2] focus:ring-opacity-50"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4A90E2] focus:ring focus:ring-[#4A90E2] focus:ring-opacity-50"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">{success}</p>}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-[#4A90E2] text-white rounded-lg hover:bg-[#357ABD] transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ChangeEmailModal({ isOpen, onClose }: ChangeEmailModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    setIsLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/change-email`,
        { currentPassword, newEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Email changed successfully. Please check your new email for verification.');
      setTimeout(onClose, 2000);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to change email');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-auto">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Change Email</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4A90E2] focus:ring focus:ring-[#4A90E2] focus:ring-opacity-50"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">New Email</label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4A90E2] focus:ring focus:ring-[#4A90E2] focus:ring-opacity-50"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">{success}</p>}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-[#4A90E2] text-white rounded-lg hover:bg-[#357ABD] transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Changing...' : 'Change Email'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function Layout() {
  const { user, logout, token, isAuthenticated } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [changePasswordModal, setChangePasswordModal] = useState(false);
  const [changeEmailModal, setChangeEmailModal] = useState(false);
  const [emailCount, setEmailCount] = useState(0);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    const fetchEmailCount = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/emails`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEmailCount(response.data.metadata?.total || 0);
      } catch (error) {
        console.error('Failed to fetch email count:', error);
      }
    };

    if (isAuthenticated) {
      fetchEmailCount();
    }
  }, [token, isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showProfileMenu && !(event.target as Element).closest('.profile-menu')) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu]);

  return (
    <div className={`min-h-screen ${isDark ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <nav className={`${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm relative z-50`}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center">
                <img src="https://boomlify.com/vite.svg" alt="Boomlify" className="h-6 w-6" />
                <span className={`ml-2 text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Boomlify
                </span>
              </Link>
            </div>

            {/* Desktop menu */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full ${isDark ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              {/* Profile Menu */}
              <div className="relative profile-menu">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className={`flex items-center space-x-2 p-2 rounded-lg ${
                    isDark ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  } transition-colors`}
                >
                  <User className="w-5 h-5" />
                  <span className="hidden sm:inline">{user?.email}</span>
                </button>

                {showProfileMenu && (
                  <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 ${isDark ? 'bg-gray-800' : 'bg-white'} ring-1 ring-black ring-opacity-5 z-50`}>
                    <div className={`block w-full text-left px-4 py-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Total Addresses: {emailCount}
                    </div>
                    <button
                      onClick={() => {
                        setChangePasswordModal(true);
                        setShowProfileMenu(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      <Settings className="w-4 h-4 inline mr-2" />
                      Change Password
                    </button>
                    <button
                      onClick={() => {
                        setChangeEmailModal(true);
                        setShowProfileMenu(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      <Mail className="w-4 h-4 inline mr-2" />
                      Change Email
                    </button>
                    <button
                      onClick={handleLogout}
                      className={`block w-full text-left px-4 py-2 text-sm ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      <LogOut className="w-4 h-4 inline mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>

              {/* Admin link */}
              {user?.isAdmin && (
                <Link
                  to="/dashboard/admin"
                  className={`flex items-center ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  <Settings className="h-5 w-5" />
                  <span className="ml-2">Admin</span>
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden absolute top-16 inset-x-0 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
        >
          <div className="px-4 py-2 space-y-1">
            <button
              onClick={toggleTheme}
              className={`w-full flex items-center px-3 py-4 text-base font-medium ${
                isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              } border-b border-gray-700`}
            >
              {isDark ? <Sun className="h-5 w-5 mr-2" /> : <Moon className="h-5 w-5 mr-2" />}
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </button>
            <button
              onClick={() => {
                setChangePasswordModal(true);
                setIsMenuOpen(false);
              }}
              className={`w-full flex items-center px-3 py-4 text-base font-medium ${
                isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              } border-b border-gray-700`}
            >
              <Settings className="h-5 w-5 mr-2" />
              Change Password
            </button>
            <button
              onClick={() => {
                setChangeEmailModal(true);
                setIsMenuOpen(false);
              }}
              className={`w-full flex items-center px-3 py-4 text-base font-medium ${
                isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              } border-b border-gray-700`}
            >
              <Mail className="h-5 w-5 mr-2" />
              Change Email
            </button>
            {user?.isAdmin && (
              <Link
                to="/dashboard/admin"
                className={`block px-3 py-4 text-base font-medium ${
                  isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                } border-b border-gray-700`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Settings className="h-5 w-5 inline mr-2" />
                Admin Panel
              </Link>
            )}
            <button
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
              className={`w-full flex items-center px-3 py-4 text-base font-medium ${
                isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              } border-b border-gray-700`}
            >
              <LogOut className="h-5 w-5 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      {/* Change Password Modal */}
      {changePasswordModal && (
        <ChangePasswordModal
          isOpen={changePasswordModal}
          onClose={() => setChangePasswordModal(false)}
        />
      )}

      {/* Change Email Modal */}
      {changeEmailModal && (
        <ChangeEmailModal
          isOpen={changeEmailModal}
          onClose={() => setChangeEmailModal(false)}
        />
      )}
    </div>
  );
}