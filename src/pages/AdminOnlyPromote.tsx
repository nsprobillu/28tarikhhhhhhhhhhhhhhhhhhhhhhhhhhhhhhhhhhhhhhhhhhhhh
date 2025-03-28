import React, { useState, useEffect } from 'react';
import {
  Mail, Search, Filter, Shield, Send, X, AlertTriangle,
  RefreshCw, Check, Settings, Users, Clock, Calendar,
  ChevronDown, ChevronUp, Download, Share2, Star
} from 'lucide-react';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  created_at: string;
  last_login: string | null;
  last_activity_at: string | null;
  email_count: number;
  received_email_count: number;
  custom_domain_count: number;
}

interface SMTPSettings {
  host: string;
  port: number;
  username: string;
  password: string;
  from_email: string;
  from_name: string;
}

interface PaginationMetadata {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export function AdminOnlyPromote() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState<PaginationMetadata>({
    total: 0,
    page: 1,
    limit: 50,
    pages: 1
  });

  // Advanced Filters
  const [filters, setFilters] = useState({
    emailCountMin: '',
    emailCountMax: '',
    dateStart: '',
    dateEnd: '',
    isActive: '',
    hasCustomDomain: '',
    sortBy: 'created_at',
    sortOrder: 'desc' as 'asc' | 'desc'
  });

  // SMTP Settings
  const [smtpSettings, setSmtpSettings] = useState<SMTPSettings>({
    host: '',
    port: 587,
    username: '',
    password: '',
    from_email: '',
    from_name: ''
  });

  // Email Content
  const [emailContent, setEmailContent] = useState({
    subject: '',
    body: ''
  });

  useEffect(() => {
    const storedAuth = sessionStorage.getItem('adminAuth');
    if (storedAuth === import.meta.env.VITE_ADMIN_PASSPHRASE) {
      setIsAuthorized(true);
      fetchUsers();
    }
  }, []);

  const fetchUsers = async (page = pagination.page) => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/emails/admin/users`,
        {
          headers: { 'Admin-Access': import.meta.env.VITE_ADMIN_PASSPHRASE },
          params: {
            page,
            limit: pagination.limit,
            search: searchTerm,
            ...filters
          }
        }
      );

      setUsers(response.data.data);
      setPagination(response.data.metadata);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setError('Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (passphrase === import.meta.env.VITE_ADMIN_PASSPHRASE) {
      sessionStorage.setItem('adminAuth', passphrase);
      setIsAuthorized(true);
      fetchUsers();
    } else {
      setError('Invalid passphrase');
    }
  };

  const handleSendEmails = async () => {
    if (selectedUsers.size === 0) {
      setError('Please select at least one user');
      return;
    }

    if (!emailContent.subject || !emailContent.body) {
      setError('Please provide both subject and body for the email');
      return;
    }

    if (!smtpSettings.host || !smtpSettings.username || !smtpSettings.password) {
      setError('Please provide all SMTP settings');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/emails/admin/bulk-send`,
        {
          userIds: Array.from(selectedUsers),
          email: emailContent,
          smtp: smtpSettings
        },
        {
          headers: {
            'Admin-Access': import.meta.env.VITE_ADMIN_PASSPHRASE
          }
        }
      );

      setSuccess(`Successfully sent emails to ${selectedUsers.size} users. ${response.data.succeeded} succeeded, ${response.data.failed} failed.`);
      setSelectedUsers(new Set());
      setEmailContent({ subject: '', body: '' });
    } catch (error: any) {
      console.error('Failed to send emails:', error);
      setError(error.response?.data?.error || 'Failed to send emails');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map(user => user.id)));
    }
  };

  const handleExportUsers = () => {
    const csv = [
      ['Email', 'Created At', 'Last Login', 'Last Activity', 'Email Count', 'Received Emails', 'Custom Domains'],
      ...users.map(user => [
        user.email,
        new Date(user.created_at).toLocaleString(),
        user.last_login ? new Date(user.last_login).toLocaleString() : 'Never',
        user.last_activity_at ? new Date(user.last_activity_at).toLocaleString() : 'Never',
        user.email_count,
        user.received_email_count,
        user.custom_domain_count
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <form onSubmit={handleAuth} className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
          <div className="flex items-center justify-center mb-6">
            <Shield className="w-12 h-12 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-6 text-center">
            Admin Access Required
          </h1>
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4">
              {error}
            </div>
          )}
          <input
            type="password"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            className="w-full bg-gray-700 text-white border border-gray-600 rounded px-4 py-2 mb-4 focus:outline-none focus:border-blue-500"
            placeholder="Enter passphrase"
            autoFocus
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded py-2 hover:bg-blue-700 transition-colors"
          >
            Access Admin Panel
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">User Management & Bulk Email</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleExportUsers}
              className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <Download className="w-5 h-5 mr-2" />
              Export Users
            </button>
            <button
              onClick={() => fetchUsers()}
              className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Refresh
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-500/10 border border-green-500 text-green-500 p-4 rounded-lg flex items-center">
            <Check className="w-5 h-5 mr-2" />
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Selection Panel */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Select Recipients
            </h2>

            <div className="space-y-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    fetchUsers(1);
                  }}
                  placeholder="Search users..."
                  className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center text-gray-300 hover:text-white"
              >
                <Filter className="w-4 h-4 mr-2" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>

              {showFilters && (
                <div className="space-y-4 bg-gray-700 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm mb-2">Min Email Count</label>
                      <input
                        type="number"
                        value={filters.emailCountMin}
                        onChange={(e) => setFilters({
                          ...filters,
                          emailCountMin: e.target.value
                        })}
                        className="w-full bg-gray-600 text-white px-3 py-2 rounded"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-2">Max Email Count</label>
                      <input
                        type="number"
                        value={filters.emailCountMax}
                        onChange={(e) => setFilters({
                          ...filters,
                          emailCountMax: e.target.value
                        })}
                        className="w-full bg-gray-600 text-white px-3 py-2 rounded"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-2">Start Date</label>
                      <input
                        type="date"
                        value={filters.dateStart}
                        onChange={(e) => setFilters({
                          ...filters,
                          dateStart: e.target.value
                        })}
                        className="w-full bg-gray-600 text-white px-3 py-2 rounded"
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-2">End Date</label>
                      <input
                        type="date"
                        value={filters.dateEnd}
                        onChange={(e) => setFilters({
                          ...filters,
                          dateEnd: e.target.value
                        })}
                        className="w-full bg-gray-600 text-white px-3 py-2 rounded"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm mb-2">Activity Status</label>
                      <select
                        value={filters.isActive}
                        onChange={(e) => setFilters({
                          ...filters,
                          isActive: e.target.value
                        })}
                        className="w-full bg-gray-600 text-white px-3 py-2 rounded"
                      >
                        <option value="">All Users</option>
                        <option value="true">Active Users</option>
                        <option value="false">Inactive Users</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm mb-2">Custom Domain</label>
                      <select
                        value={filters.hasCustomDomain}
                        onChange={(e) => setFilters({
                          ...filters,
                          hasCustomDomain: e.target.value
                        })}
                        className="w-full bg-gray-600 text-white px-3 py-2 rounded"
                      >
                        <option value="">All Users</option>
                        <option value="true">With Custom Domain</option>
                        <option value="false">Without Custom Domain</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm mb-2">Sort By</label>
                      <select
                        value={filters.sortBy}
                        onChange={(e) => setFilters({
                          ...filters,
                          sortBy: e.target.value
                        })}
                        className="w-full bg-gray-600 text-white px-3 py-2 rounded"
                      >
                        <option value="created_at">Registration Date</option>
                        <option value="last_login">Last Login</option>
                        <option value="last_activity_at">Last Activity</option>
                        <option value="email_count">Email Count</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm mb-2">Sort Order</label>
                      <select
                        value={filters.sortOrder}
                        onChange={(e) => setFilters({
                          ...filters,
                          sortOrder: e.target.value as 'asc' | 'desc'
                        })}
                        className="w-full bg-gray-600 text-white px-3 py-2 rounded"
                      >
                        <option value="desc">Descending</option>
                        <option value="asc">Ascending</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        setFilters({
                          emailCountMin: '',
                          emailCountMax: '',
                          dateStart: '',
                          dateEnd: '',
                          isActive: '',
                          hasCustomDomain: '',
                          sortBy: 'created_at',
                          sortOrder: 'desc'
                        });
                        fetchUsers(1);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      Reset Filters
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                {selectedUsers.size === users.length ? 'Deselect All' : 'Select All'}
              </button>
              <span className="text-sm text-gray-400">
                {selectedUsers.size} users selected
              </span>
            </div>

            <div className="max-h-[400px] overflow-y-auto border border-gray-700 rounded-lg">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center p-4 hover:bg-gray-700 border-b border-gray-700 last:border-0"
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.has(user.id)}
                    onChange={() => {
                      const newSelected = new Set(selectedUsers);
                      if (newSelected.has(user.id)) {
                        newSelected.delete(user.id);
                      } else {
                        newSelected.add(user.id);
                      }
                      setSelectedUsers(newSelected);
                    }}
                    className="mr-4"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{user.email}</span>
                      <div className="flex items-center space-x-2">
                        {user.custom_domain_count > 0 && (
                          <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded">
                            {user.custom_domain_count} Domains
                          </span>
                        )}
                        <span className="bg-green-500/20 text-green-300 text-xs px-2 py-1 rounded">
                          {user.email_count} Emails
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-400 flex items-center mt-1">
                      <Calendar className="w-4 h-4 mr-1" />
                      Joined: {new Date(user.created_at).toLocaleDateString()}
                      <Clock className="w-4 h-4 ml-4 mr-1" />
                      Last active: {user.last_activity_at ? new Date(user.last_activity_at).toLocaleDateString() : 'Never'}
                    </div>
                  </div>
                </div>
              ))}

              {users.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No users found</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={() => fetchUsers(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-400">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => fetchUsers(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Email Composition Panel */}
          <div className="space-y-8">
            {/* SMTP Settings */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                SMTP Settings
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2">SMTP Host</label>
                  <input
                
                    type="text"
                    value={smtpSettings.host}
                    onChange={(e) => setSmtpSettings({
                      ...smtpSettings,
                      host: e.target.value
                    })}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                    placeholder="smtp.example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">SMTP Port</label>
                  <input
                    type="number"
                    value={smtpSettings.port}
                    onChange={(e) => setSmtpSettings({
                      ...smtpSettings,
                      port: parseInt(e.target.value) || 587
                    })}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">Username</label>
                  <input
                    type="text"
                    value={smtpSettings.username}
                    onChange={(e) => setSmtpSettings({
                      ...smtpSettings,
                      username: e.target.value
                    })}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">Password</label>
                  <input
                    type="password"
                    value={smtpSettings.password}
                    onChange={(e) => setSmtpSettings({
                      ...smtpSettings,
                      password: e.target.value
                    })}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">From Email</label>
                  <input
                    type="email"
                    value={smtpSettings.from_email}
                    onChange={(e) => setSmtpSettings({
                      ...smtpSettings,
                      from_email: e.target.value
                    })}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">From Name</label>
                  <input
                    type="text"
                    value={smtpSettings.from_name}
                    onChange={(e) => setSmtpSettings({
                      ...smtpSettings,
                      from_name: e.target.value
                    })}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Email Content */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Email Content
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2">Subject</label>
                  <input
                    type="text"
                    value={emailContent.subject}
                    onChange={(e) => setEmailContent({
                      ...emailContent,
                      subject: e.target.value
                    })}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">Body (HTML Supported)</label>
                  <textarea
                    value={emailContent.body}
                    onChange={(e) => setEmailContent({
                      ...emailContent,
                      body: e.target.value
                    })}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                    rows={10}
                    placeholder="<p>Your HTML content here...</p>"
                  />
                </div>
              </div>
            </div>

            {/* Send Button */}
            <button
              onClick={handleSendEmails}
              disabled={isLoading || selectedUsers.size === 0}
              className="w-full bg-blue-600 text-white rounded-lg px-6 py-3 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Send to {selectedUsers.size} Users
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}