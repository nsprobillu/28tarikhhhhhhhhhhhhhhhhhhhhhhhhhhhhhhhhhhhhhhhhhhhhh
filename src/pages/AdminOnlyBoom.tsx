import React, { useState, useEffect } from 'react';
import {
  Mail,
  RefreshCw,
  Loader,
  ExternalLink,
  Search,
  Filter,
  Calendar,
  Globe,
  X,
  AlertTriangle,
  Download,
  Archive,
  Flag,
  Plus,
  Check,
  ChevronDown
} from 'lucide-react';
import axios from 'axios';

interface Email {
  id: string;
  from_email: string;
  from_name: string;
  subject: string;
  body_html: string;
  body_text: string;
  received_at: string;
  temp_email: string;
}

interface FilterOptions {
  startDate: string;
  endDate: string;
  domain: string;
  blockedSenders: string[];
  blockedSubjects: string[];
  blockedKeywords: string[];
}

interface BlockListModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'sender' | 'subject' | 'keyword';
  items: string[];
  onAdd: (item: string) => void;
  onRemove: (item: string) => void;
}

interface CustomMessage {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  is_active: boolean;
  created_at: string;
  dismiss_count: number;
}

interface PaginationMetadata {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// Set the admin passphrase directly to match backend expectations
const ADMIN_PASSPHRASE = import.meta.env.VITE_ADMIN_PASSPHRASE || '';

function BlockListModal({ isOpen, onClose, type, items, onAdd, onRemove }: BlockListModalProps) {
  const [newItem, setNewItem] = useState('');

  if (!isOpen) return null;

  const handleAdd = () => {
    if (newItem.trim()) {
      onAdd(newItem.trim().toLowerCase());
      setNewItem('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-4">
          Manage Blocked {type.charAt(0).toUpperCase() + type.slice(1)}s
        </h2>

        <div className="flex mb-4">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder={`Enter ${type} to block...`}
            className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-l focus:outline-none"
          />
          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700"
          >
            Add
          </button>
        </div>

        <div className="max-h-60 overflow-y-auto mb-4">
          {items.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No blocked {type}s</p>
          ) : (
            <ul className="space-y-2">
              {items.map((item, index) => (
                <li key={index} className="flex items-center justify-between bg-gray-700 p-2 rounded">
                  <span className="text-white">{item}</span>
                  <button
                    onClick={() => onRemove(item)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full bg-gray-700 text-white py-2 rounded hover:bg-gray-600"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export function AdminOnlyBoom() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [emails, setEmails] = useState<Email[]>([]);
  const [filteredEmails, setFilteredEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    startDate: '',
    endDate: '',
    domain: '',
    blockedSenders: [],
    blockedSubjects: [],
    blockedKeywords: []
  });
  const [domains, setDomains] = useState<string[]>([]);
  const [blockListModal, setBlockListModal] = useState<{
    isOpen: boolean;
    type: 'sender' | 'subject' | 'keyword';
  } | null>(null);
  const [messages, setMessages] = useState<CustomMessage[]>([]);
  const [newMessage, setNewMessage] = useState({ message: '', type: 'info' as const });
  const [messageSuccess, setMessageSuccess] = useState('');
  const [pagination, setPagination] = useState<PaginationMetadata>({
    total: 0,
    page: 1,
    limit: 100,
    pages: 1
  });

  const fetchEmails = async (page = 1, append = false) => {
    try {
      setIsLoading(!append);
      if (append) setIsLoadingMore(true);
      setError(null);

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/emails/admin/all`, {
        headers: {
          'Admin-Access': ADMIN_PASSPHRASE
        },
        params: {
          page: page,
          limit: 100
        }
      });

      // Handle paginated response
      if (response.data && response.data.data && response.data.metadata) {
        const newEmails = response.data.data;
        setPagination(response.data.metadata);
        
        if (append) {
          setEmails(prev => [...prev, ...newEmails]);
          applyFilters([...emails, ...newEmails]);
        } else {
          setEmails(newEmails);
          applyFilters(newEmails);
        }
      } else {
        // Handle non-paginated response
        const emailsData = response.data || [];
        setEmails(emailsData);
        setPagination({
          total: emailsData.length,
          page: 1,
          limit: emailsData.length,
          pages: 1
        });
        applyFilters(emailsData);
      }

      // Extract unique domains
      const allEmails = append ? [...emails, ...(response.data.data || response.data)] : (response.data.data || response.data);
      const uniqueDomains = Array.from(new Set(allEmails.map((email: Email) => {
        const parts = email.temp_email.split('@');
        return parts.length > 1 ? parts[1] : null;
      }).filter(Boolean)));
      
      setDomains(uniqueDomains as string[]);
      
    } catch (err: any) {
      console.error('Failed to fetch emails:', err);
      setError(err.response?.data?.error || 'Failed to fetch emails');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const loadMoreEmails = () => {
    if (pagination.page < pagination.pages) {
      fetchEmails(pagination.page + 1, true);
    }
  };

  useEffect(() => {
    const storedAuth = sessionStorage.getItem('adminAuth');
    if (storedAuth === ADMIN_PASSPHRASE) {
      setIsAuthorized(true);
      fetchEmails();
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh && isAuthorized) {
      interval = setInterval(() => fetchEmails(1, false), 30000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, isAuthorized]);

  useEffect(() => {
    applyFilters(emails);
  }, [searchTerm, filterOptions]);

  useEffect(() => {
    if (isAuthorized) {
      fetchMessages();
    }
  }, [isAuthorized]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/messages/admin/all`, 
        { 
          headers: { 
            'Admin-Access': ADMIN_PASSPHRASE
          } 
        }
      );
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleCreateMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/messages`,
        newMessage,
        { 
          headers: { 
            'Admin-Access': ADMIN_PASSPHRASE
          } 
        }
      );
      setMessageSuccess('Message created successfully');
      setNewMessage({ message: '', type: 'info' });
      fetchMessages();
      setTimeout(() => setMessageSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to create message:', error);
      setError('Failed to create message');
    }
  };

  const handleToggleMessage = async (messageId: string, currentStatus: boolean) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/messages/${messageId}`,
        { is_active: !currentStatus },
        { 
          headers: { 
            'Admin-Access': ADMIN_PASSPHRASE
          } 
        }
      );
      fetchMessages();
    } catch (error) {
      console.error('Failed to update message:', error);
      setError('Failed to update message status');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/messages/${messageId}`,
        { 
          headers: { 
            'Admin-Access': ADMIN_PASSPHRASE
          } 
        }
      );
      fetchMessages();
    } catch (error) {
      console.error('Failed to delete message:', error);
      setError('Failed to delete message');
    }
  };

  const applyFilters = (emailsToFilter: Email[]) => {
    let filtered = [...emailsToFilter];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(email => 
        email.subject?.toLowerCase().includes(searchLower) ||
        email.from_email.toLowerCase().includes(searchLower) ||
        email.from_name.toLowerCase().includes(searchLower) ||
        email.temp_email.toLowerCase().includes(searchLower)
      );
    }

    if (filterOptions.startDate) {
      filtered = filtered.filter(email => 
        new Date(email.received_at) >= new Date(filterOptions.startDate)
      );
    }
    if (filterOptions.endDate) {
      filtered = filtered.filter(email => 
        new Date(email.received_at) <= new Date(filterOptions.endDate)
      );
    }

    if (filterOptions.domain) {
      filtered = filtered.filter(email => 
        email.temp_email.endsWith(filterOptions.domain)
      );
    }

    if (filterOptions.blockedSenders.length > 0) {
      filtered = filtered.filter(email => 
        !filterOptions.blockedSenders.some(sender => 
          email.from_email.toLowerCase().includes(sender) ||
          email.from_name.toLowerCase().includes(sender)
        )
      );
    }

    if (filterOptions.blockedSubjects.length > 0) {
      filtered = filtered.filter(email => 
        !filterOptions.blockedSubjects.some(subject => 
          email.subject.toLowerCase().includes(subject)
        )
      );
    }

    if (filterOptions.blockedKeywords.length > 0) {
      filtered = filtered.filter(email => 
        !filterOptions.blockedKeywords.some(keyword => 
          email.subject.toLowerCase().includes(keyword) ||
          email.body_text.toLowerCase().includes(keyword)
        )
      );
    }

    setFilteredEmails(filtered);
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (passphrase === ADMIN_PASSPHRASE) {
      sessionStorage.setItem('adminAuth', passphrase);
      setIsAuthorized(true);
      fetchEmails();
    } else {
      setError('Invalid passphrase');
    }
  };

  const resetFilters = () => {
    setFilterOptions({
      startDate: '',
      endDate: '',
      domain: '',
      blockedSenders: [],
      blockedSubjects: [],
      blockedKeywords: []
    });
    setSearchTerm('');
  };

  // Fixed handleBlockListAdd function
  const handleBlockListAdd = (item: string, type: 'sender' | 'subject' | 'keyword') => {
    setFilterOptions(prev => {
      const key = type === 'sender' ? 'blockedSenders' : 
                type === 'subject' ? 'blockedSubjects' : 
                'blockedKeywords';
      
      return {
        ...prev,
        [key]: [...prev[key], item]
      };
    });
  };

  // Fixed handleBlockListRemove function
  const handleBlockListRemove = (item: string, type: 'sender' | 'subject' | 'keyword') => {
    setFilterOptions(prev => {
      const key = type === 'sender' ? 'blockedSenders' : 
                type === 'subject' ? 'blockedSubjects' : 
                'blockedKeywords';
      
      return {
        ...prev,
        [key]: prev[key].filter(i => i !== item)
      };
    });
  };

  const handleEmailAction = async (email: Email, action: 'archive' | 'spam' | 'delete') => {
    try {
      setFilteredEmails(prev => prev.filter(e => e.id !== email.id));

      if (selectedEmail?.id === email.id) {
        setSelectedEmail(null);
      }

      await axios.post(
        `${import.meta.env.VITE_API_URL}/emails/admin/${action}/${email.id}`,
        {},
        {
          headers: {
            'Admin-Access': ADMIN_PASSPHRASE
          }
        }
      );
    } catch (error) {
      console.error(`Failed to ${action} email:`, error);
      fetchEmails();
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <form onSubmit={handleAuth} className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">Admin Access Required</h1>
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

  if (isLoading && !emails.length) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Custom Messages</h2>

          <form onSubmit={handleCreateMessage} className="bg-gray-800 p-6 rounded-lg mb-8">
            <h3 className="text-xl font-semibold mb-4">Create New Message</h3>

            {messageSuccess && (
              <div className="mb-4 bg-green-500/10 border border-green-500 text-green-500 p-3 rounded">
                {messageSuccess}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea
                  value={newMessage.message}
                  onChange={(e) => setNewMessage({ ...newMessage, message: e.target.value })}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded px-4 py-2 focus:outline-none focus:border-blue-500"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={newMessage.type}
                  onChange={(e) => setNewMessage({ ...newMessage, type: e.target.value as any })}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded px-4 py-2 focus:outline-none focus:border-blue-500"
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="success">Success</option>
                  <option value="error">Error</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white rounded-lg px-6 py-3 hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Message
              </button>
            </div>
          </form>

          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`bg-gray-800 p-4 rounded-lg border ${
                  message.type === 'info' ? 'border-blue-500' :
                  message.type === 'warning' ? 'border-yellow-500' :
                  message.type === 'success' ? 'border-green-500' :
                  'border-red-500'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="mb-2">{message.message}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>Type: {message.type}</span>
                      <span>Created: {new Date(message.created_at).toLocaleDateString()}</span>
                      <span>Dismissed: {message.dismiss_count} times</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleToggleMessage(message.id, message.is_active)}
                      className={`p-2 rounded-lg ${
                        message.is_active ? 'bg-green-600' : 'bg-gray-600'
                      } hover:opacity-80 transition-opacity`}
                      title={message.is_active ? 'Deactivate' : 'Activate'}
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteMessage(message.id)}
                      className="p-2 rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
                      title="Delete"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {messages.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No messages found</p>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-800 pt-12">
          <div className="flex flex-col space-y-4 mb-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Admin Email Monitor</h1>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2 rounded-lg ${showFilters ? 'bg-blue-600' : 'bg-gray-700'} hover:opacity-80 transition-colors`}
                  title="Toggle filters"
                >
                  <Filter className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`p-2 rounded-lg ${autoRefresh ? 'bg-green-600' : 'bg-gray-700'} hover:opacity-80 transition-colors`}
                  title={autoRefresh ? 'Auto-refresh on' : 'Auto-refresh off'}
                >
                  <RefreshCw className={`w-5 h-5 ${autoRefresh ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            <div className="flex flex-col space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search emails by subject, sender, or recipient..."
                  className="w-full bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
                />
              </div>

              {showFilters && (
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={filterOptions.startDate}
                        onChange={(e) => setFilterOptions({ ...filterOptions, startDate: e.target.value })}
                        className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">End Date</label>
                      <input
                        type="date"
                        value={filterOptions.endDate}
                        onChange={(e) => setFilterOptions({ ...filterOptions, endDate: e.target.value })}
                        className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Domain</label>
                      <select
                        value={filterOptions.domain}
                        onChange={(e) => setFilterOptions({ ...filterOptions, domain: e.target.value })}
                        className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                      >
                        <option value="">All Domains</option>
                        {domains.map((domain) => (
                          <option key={domain} value={domain}>@{domain}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <button
                      onClick={() => setBlockListModal({ isOpen: true, type: 'sender' })}
                      className="flex items-center justify-center px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Blocked Senders ({filterOptions.blockedSenders.length})
                    </button>
                    <button
                      onClick={() => setBlockListModal({ isOpen: true, type: 'subject' })}
                      className="flex items-center justify-center px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Blocked Subjects ({filterOptions.blockedSubjects.length})
                    </button>
                    <button
                      onClick={() => setBlockListModal({ isOpen: true, type: 'keyword' })}
                      className="flex items-center justify-center px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Blocked Keywords ({filterOptions.blockedKeywords.length})
                    </button>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={resetFilters}
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reset Filters
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-gray-800 rounded-lg p-4 h-[calc(100vh-16rem)] flex flex-col">
              <div className="overflow-y-auto flex-grow">
                {filteredEmails.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Mail className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>{emails.length === 0 ? 'No emails received yet' : 'No emails match your filters'}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredEmails.map((email) => (
                      <div
                        key={email.id}
                        onClick={() => setSelectedEmail(email)}
                        className={`p-4 rounded-lg cursor-pointer transition-colors ${
                          selectedEmail?.id === email.id
                            ? 'bg-blue-900'
                            : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-blue-300 truncate">{email.temp_email}</p>
                            <h3 className="font-medium truncate">{email.subject || 'No Subject'}</h3>
                          </div>
                          <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                            {new Date(email.received_at).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-400">
                          <div className="flex-1 truncate">
                            <span className="font-medium">{email.from_name}</span>
                            <span className="mx-1">•</span>
                            <span className="text-gray-500">{email.from_email}</span>
                          </div>
                          <div className="flex space-x-2 ml-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEmailAction(email, 'archive');
                              }}
                              className="text-gray-400 hover:text-white"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEmailAction(email, 'spam');
                              }}
                              className="text-gray-400 hover:text-red-400"
                            >
                              <Flag className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEmailAction(email, 'delete');
                              }}
                              className="text-gray-400 hover:text-red-400"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Load More Button - shows only when there are more pages to load */}
              {pagination.page < pagination.pages && (
                <div className="mt-4 pt-2 border-t border-gray-700">
                  <button
                    onClick={loadMoreEmails}
                    disabled={isLoadingMore}
                    className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors"
                  >
                    {isLoadingMore ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <span>Load More</span>
                        <ChevronDown className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Emails count indicator */}
              <div className="mt-2 text-center text-sm text-gray-500">
                Showing {filteredEmails.length} of {pagination.total} emails
              </div>
            </div>

            <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6 h-[calc(100vh-16rem)] overflow-y-auto">
              {selectedEmail ? (
                <div>
                  <div className="border-b border-gray-700 pb-4 mb-4">
                    <div className="flex justify-between items-start mb-2">
                      <h2 className="text-xl font-semibold">
                        {selectedEmail.subject || 'No Subject'}
                      </h2>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEmailAction(selectedEmail, 'archive')}
                          className="p-2 rounded hover:bg-gray-700"
                          title="Archive"
                        >
                          <Archive className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEmailAction(selectedEmail, 'spam')}
                          className="p-2 rounded hover:bg-gray-700"
                          title="Mark as spam"
                        >
                          <Flag className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEmailAction(selectedEmail, 'delete')}
                          className="p-2 rounded hover:bg-gray-700"
                          title="Delete"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-400">
                      <p>To: {selectedEmail.temp_email}</p>
                      <p>From: {selectedEmail.from_name} &lt;{selectedEmail.from_email}&gt;</p>
                      <p>Received: {new Date(selectedEmail.received_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="prose prose-invert max-w-none">
                    {selectedEmail.body_html ? (
                      <div dangerouslySetInnerHTML={{
                        __html: selectedEmail.body_html
                      }} />
                    ) : (
                      <pre className="whitespace-pre-wrap font-sans">
                        {selectedEmail.body_text}
                      </pre>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <Mail className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Select an email to view its contents</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Block List Modal */}
      {blockListModal && (
        <BlockListModal
          isOpen={blockListModal.isOpen}
          onClose={() => setBlockListModal(null)}
          type={blockListModal.type}
          items={
            blockListModal.type === 'sender' ? filterOptions.blockedSenders :
            blockListModal.type === 'subject' ? filterOptions.blockedSubjects :
            filterOptions.blockedKeywords
          }
          onAdd={(item) => handleBlockListAdd(item, blockListModal.type)}
          onRemove={(item) => handleBlockListRemove(item, blockListModal.type)}
        />
      )}
    </div>
  );
}