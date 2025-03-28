import React, { useState, useEffect } from 'react';
import { 
  Users, Mail, Activity, Shield, RefreshCw, 
  Search, CheckCircle, AlertTriangle, Database,
  Zap, Globe, Info, User, Clock, FileText, Cpu,
  Map, Link as LinkIcon, Monitor as MonitorIcon,
  Bookmark, Loader
} from 'lucide-react';
import axios from 'axios';

interface Stats {
  users: {
    total: number;
    today: number;
  };
  tempEmails: {
    total: number;
    active: number;
  };
  receivedEmails: {
    total: number;
    today: number;
  };
  requests?: {
    total: number;
    today: number;
    uniqueIps: number;
  };
}

interface RecentUser {
  id: string;
  email: string;
  created_at: string;
  last_login: string | null;
  email_count: number;
}

interface TopUser {
  id: string;
  email: string;
  email_count: number;
  received_count: number;
}

interface TempEmailLookupResult {
  tempEmail: string;
  ownerEmail: string;
  created_at: string;
  expires_at: string;
  isActive: boolean;
}

interface IpStats {
  totalRequests: number;
  topPaths: Array<{request_path: string, count: number}>;
  firstSeen: string;
  lastSeen: string;
  avgResponseTime: number;
associatedUsers: {
  id: string;
  email: string;
  emailCount: number;
}[];
  errorRate: string;
  geoInfo: {
    country: string;
    city: string;
    region: string;
  } | null;
}

interface IpLookupResult {
  ip: string;
  stats: IpStats;
  recentRequests: any[];
  associatedUsers: any[];
}

interface RequestLookupResult {
  request: {
    id: string;
    request_id: string;
    client_ip: string;
    user_id: string | null;
    request_path: string;
    request_method: string;
    status_code: number;
    response_time: number;
    user_agent: string;
    referer: string;
    created_at: string;
    geo_country: string;
    geo_city: string;
    geo_region: string;
    is_bot: boolean;
  };
  userInfo: any | null;
}

export function Monitor() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [loginForm, setLoginForm] = useState({
    email: '',
    adminKey: ''
  });
  
  // Temp email lookup state
  const [tempEmailLookup, setTempEmailLookup] = useState('');
  const [lookupResult, setLookupResult] = useState<TempEmailLookupResult | null>(null);
  const [isLookupLoading, setIsLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [lookupSuccess, setLookupSuccess] = useState(false);

  // IP lookup state
  const [ipAddress, setIpAddress] = useState('');
  const [ipLookupResult, setIpLookupResult] = useState<IpLookupResult | null>(null);
  const [isIpLookupLoading, setIsIpLookupLoading] = useState(false);
  const [ipLookupError, setIpLookupError] = useState('');
  const [ipLookupSuccess, setIpLookupSuccess] = useState(false);

  // Request ID lookup state
  const [requestId, setRequestId] = useState('');
  const [requestLookupResult, setRequestLookupResult] = useState<RequestLookupResult | null>(null);
  const [isRequestLookupLoading, setIsRequestLookupLoading] = useState(false);
  const [requestLookupError, setRequestLookupError] = useState('');
  const [requestLookupSuccess, setRequestLookupSuccess] = useState(false);

  useEffect(() => {
    const storedAuth = sessionStorage.getItem('adminAuth');
    if (storedAuth === import.meta.env.VITE_ADMIN_PASSPHRASE) {
      setIsAuthorized(true);
      fetchAllData();
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh && isAuthorized) {
      interval = setInterval(fetchAllData, 30000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, isAuthorized]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (passphrase === import.meta.env.VITE_ADMIN_PASSPHRASE) {
      sessionStorage.setItem('adminAuth', passphrase);
      setIsAuthorized(true);
      fetchAllData();
    } else {
      setError('Invalid passphrase');
    }
  };

  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        { 
          email: loginForm.email,
          password: 'placeholder'
        },
        {
          headers: {
            'Admin-Access': loginForm.adminKey
          }
        }
      );

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError('Invalid credentials');
    }
  };

  // Temp email lookup function
  const handleTempEmailLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempEmailLookup) {
      setLookupError('Please enter a temporary email address');
      return;
    }
    
    setIsLookupLoading(true);
    setLookupError('');
    setLookupSuccess(false);
    setLookupResult(null);
    
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/monitor/lookup-temp-email`,
        { 
          params: { email: tempEmailLookup },
          headers: { 'Admin-Access': import.meta.env.VITE_ADMIN_PASSPHRASE }
        }
      );
      
      if (response.data) {
        setLookupResult(response.data);
        setLookupSuccess(true);
      } else {
        setLookupError('No user found for this temporary email');
      }
    } catch (error: any) {
      console.error('Lookup failed:', error);
      setLookupError(error.response?.data?.error || 'Failed to lookup email owner');
    } finally {
      setIsLookupLoading(false);
    }
  };

  // IP lookup function
  const handleIpLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ipAddress) {
      setIpLookupError('Please enter an IP address');
      return;
    }
    
    setIsIpLookupLoading(true);
    setIpLookupError('');
    setIpLookupSuccess(false);
    setIpLookupResult(null);
    
    try {
      // Fixed endpoint URL to match the backend
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/monitor/lookup-ip`,
        { 
          params: { ip: ipAddress },
          headers: { 'Admin-Access': import.meta.env.VITE_ADMIN_PASSPHRASE }
        }
      );
      
      if (response.data) {
        setIpLookupResult(response.data);
        setIpLookupSuccess(true);
      } else {
        setIpLookupError('No activity found for this IP address');
      }
    } catch (error: any) {
      console.error('IP lookup failed:', error);
      setIpLookupError(error.response?.data?.error || 'Failed to lookup IP activity');
    } finally {
      setIsIpLookupLoading(false);
    }
  };

  // Request ID lookup function
  const handleRequestLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestId) {
      setRequestLookupError('Please enter a request ID');
      return;
    }
    
    setIsRequestLookupLoading(true);
    setRequestLookupError('');
    setRequestLookupSuccess(false);
    setRequestLookupResult(null);
    
    try {
      // Fixed endpoint URL to match the backend
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/monitor/lookup-request`,
        { 
          params: { requestId: requestId },
          headers: { 'Admin-Access': import.meta.env.VITE_ADMIN_PASSPHRASE }
        }
      );
      
      if (response.data) {
        setRequestLookupResult(response.data);
        setRequestLookupSuccess(true);
      } else {
        setRequestLookupError('No request found with this ID');
      }
    } catch (error: any) {
      console.error('Request ID lookup failed:', error);
      setRequestLookupError(error.response?.data?.error || 'Failed to lookup request');
    } finally {
      setIsRequestLookupLoading(false);
    }
  };

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchStats(),
        fetchRecentUsers(),
        fetchTopUsers()
      ]);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/monitor/stats`,
        { headers: { 'Admin-Access': import.meta.env.VITE_ADMIN_PASSPHRASE } }
      );
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchRecentUsers = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/monitor/recent-users`,
        { headers: { 'Admin-Access': import.meta.env.VITE_ADMIN_PASSPHRASE } }
      );
      setRecentUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch recent users:', error);
    }
  };

  const fetchTopUsers = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/monitor/top-users`,
        { headers: { 'Admin-Access': import.meta.env.VITE_ADMIN_PASSPHRASE } }
      );
      setTopUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch top users:', error);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <form onSubmit={handleAuth} className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
          <div className="flex items-center justify-center mb-6">
            <Shield className="w-12 h-12 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-6 text-center">
            Monitor Access Required
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
            Access Monitor
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">System Monitor</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-2 rounded-lg ${
                autoRefresh ? 'bg-green-600' : 'bg-gray-700'
              } hover:opacity-80 transition-colors`}
              title={autoRefresh ? 'Auto-refresh on' : 'Auto-refresh off'}
            >
              <RefreshCw className={`w-5 h-5 ${autoRefresh ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={fetchAllData}
              className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                'Refresh Data'
              )}
            </button>
          </div>
        </div>

        {/* Lookup Forms Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Temp Email Lookup Form */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Temporary Email Lookup</h2>
            <form onSubmit={handleTempEmailLookup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Enter Temporary Email Address
                </label>
                <div className="flex">
                  <input
                    type="email"
                    value={tempEmailLookup}
                    onChange={(e) => setTempEmailLookup(e.target.value)}
                    className="flex-1 bg-gray-700 text-white border border-gray-600 rounded-l px-4 py-2 focus:outline-none focus:border-blue-500"
                    placeholder="example@tempmail.com"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 text-white rounded-r px-6 py-2 hover:bg-blue-700 transition-colors flex items-center"
                    disabled={isLookupLoading}
                  >
                    {isLookupLoading ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Search className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
              
              {lookupError && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded">
                  <AlertTriangle className="w-5 h-5 inline mr-2" />
                  {lookupError}
                </div>
              )}
              
              {lookupSuccess && lookupResult && (
                <div className="bg-green-500/10 border border-green-500 p-4 rounded">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <h3 className="font-bold">Lookup Result:</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    <div>
                      <p className="text-sm text-gray-400">Temporary Email:</p>
                      <p className="font-mono">{lookupResult.tempEmail}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Owner's Email:</p>
                      <p className="font-mono text-green-400 font-bold">{lookupResult.ownerEmail}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Created:</p>
                      <p>{new Date(lookupResult.created_at).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Expires:</p>
                      <p>{new Date(lookupResult.expires_at).toLocaleString()}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-400">Status:</p>
                      <p className={lookupResult.isActive ? "text-green-500" : "text-red-500"}>
                        {lookupResult.isActive ? "Active" : "Expired"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* IP Address Lookup Form */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">IP Address Lookup</h2>
            <form onSubmit={handleIpLookup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Enter IP Address
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={ipAddress}
                    onChange={(e) => setIpAddress(e.target.value)}
                    className="flex-1 bg-gray-700 text-white border border-gray-600 rounded-l px-4 py-2 focus:outline-none focus:border-blue-500"
                    placeholder="192.168.1.1"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 text-white rounded-r px-6 py-2 hover:bg-blue-700 transition-colors flex items-center"
                    disabled={isIpLookupLoading}
                  >
                    {isIpLookupLoading ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Search className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
              
              {ipLookupError && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded">
                  <AlertTriangle className="w-5 h-5 inline mr-2" />
                  {ipLookupError}
                </div>
              )}
              
              {ipLookupSuccess && ipLookupResult && (
                <div className="bg-green-500/10 border border-green-500 p-4 rounded overflow-auto max-h-80">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <h3 className="font-bold">IP Lookup Results for {ipLookupResult.ip}:</h3>
                  </div>
                  
                  {/* Display IP stats */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-400">Statistics:</p>
                    <div className="bg-gray-700/50 p-3 rounded mt-1">
                      <p>Total Requests: {ipLookupResult.stats.totalRequests}</p>
                      <p>First Seen: {new Date(ipLookupResult.stats.firstSeen).toLocaleString()}</p>
                      <p>Last Seen: {new Date(ipLookupResult.stats.lastSeen).toLocaleString()}</p>
                      <p>Avg Response Time: {ipLookupResult.stats.avgResponseTime}ms</p>
                      <p>Error Rate: {ipLookupResult.stats.errorRate}</p>
                      
                      {ipLookupResult.stats.geoInfo && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-400">Location:</p>
                          <p>{ipLookupResult.stats.geoInfo.city}, {ipLookupResult.stats.geoInfo.region}, {ipLookupResult.stats.geoInfo.country}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Top paths */}
                  {ipLookupResult.stats.topPaths && ipLookupResult.stats.topPaths.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-400">Top Paths:</p>
                      <div className="bg-gray-700/50 p-3 rounded mt-1">
                        {ipLookupResult.stats.topPaths.map((path, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span className="font-mono text-xs truncate">{path.request_path}</span>
                            <span className="ml-2">{path.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Associated users */}
                  {ipLookupResult.associatedUsers && ipLookupResult.associatedUsers.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-400">Associated Users:</p>
                      <div className="bg-gray-700/50 p-3 rounded mt-1">
                        {ipLookupResult.associatedUsers.map((user, idx) => (
                          <div key={idx} className="mb-2">
                            <p className="font-semibold">{user.email}</p>
                            <p className="text-xs text-gray-400">ID: {user.id}</p>
                            <p className="text-xs text-gray-400">Emails: {user.emailCount}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Recent requests */}
                  {ipLookupResult.recentRequests && ipLookupResult.recentRequests.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-400">Recent Requests:</p>
                      <div className="bg-gray-700/50 p-3 rounded mt-1 max-h-40 overflow-y-auto">
                        {ipLookupResult.recentRequests.map((req, idx) => (
                          <div key={idx} className="text-xs mb-2 pb-2 border-b border-gray-600">
                            <div className="flex justify-between">
                              <span className="font-mono">{req.request_method} {req.request_path}</span>
                              <span className={req.status_code < 400 ? "text-green-500" : "text-red-500"}>
                                {req.status_code}
                              </span>
                            </div>
                            <div className="text-gray-400 mt-1">
                              {new Date(req.created_at).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>

          {/* Request ID Lookup Form */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Request ID Lookup</h2>
            <form onSubmit={handleRequestLookup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Enter Request ID
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={requestId}
                    onChange={(e) => setRequestId(e.target.value)}
                    className="flex-1 bg-gray-700 text-white border border-gray-600 rounded-l px-4 py-2 focus:outline-none focus:border-blue-500"
                    placeholder="request-123456"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 text-white rounded-r px-6 py-2 hover:bg-blue-700 transition-colors flex items-center"
                    disabled={isRequestLookupLoading}
                  >
                    {isRequestLookupLoading ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Search className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
              
              {requestLookupError && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded">
                  <AlertTriangle className="w-5 h-5 inline mr-2" />
                  {requestLookupError}
                </div>
              )}
              
              {requestLookupSuccess && requestLookupResult && (
                <div className="bg-green-500/10 border border-green-500 p-4 rounded">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <h3 className="font-bold">Request Details:</h3>
                  </div>
                  
                  <div className="space-y-3 mt-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm text-gray-400">Request ID:</p>
                        <p className="font-mono">{requestLookupResult.request.request_id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Timestamp:</p>
                        <p>{new Date(requestLookupResult.request.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-700/50 p-3 rounded">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-sm text-gray-400">Method:</p>
                          <p className="font-semibold">{requestLookupResult.request.request_method}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Status:</p>
                          <p className={requestLookupResult.request.status_code < 400 ? "text-green-500" : "text-red-500"}>
                            {requestLookupResult.request.status_code}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-400">Endpoint:</p>
                        <p className="font-mono">{requestLookupResult.request.request_path}</p>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-400">IP Address:</p>
                        <p>{requestLookupResult.request.client_ip}</p>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-400">Response Time:</p>
                        <p>{requestLookupResult.request.response_time}ms</p>
                      </div>
                    </div>
                    
                    {requestLookupResult.userInfo && (
                      <div className="bg-blue-500/10 border border-blue-500 p-3 rounded">
                        <p className="text-sm text-gray-400">User:</p>
                        <p className="font-semibold">{requestLookupResult.userInfo.email || 'Unknown'}</p>
                        <p className="text-xs text-gray-400 mt-1">User ID: {requestLookupResult.request.user_id}</p>
                      </div>
                    )}
                    
                    <div>
                      <p className="text-sm text-gray-400">User Agent:</p>
                      <p className="text-sm break-all">{requestLookupResult.request.user_agent}</p>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* User Login Form */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Access User Account</h2>
            <form onSubmit={handleUserLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  User Email
                </label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded px-4 py-2 focus:outline-none focus:border-blue-500"
                  placeholder="Enter user email"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Admin Key
                </label>
                <input
                  type="password"
                  value={loginForm.adminKey}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, adminKey: e.target.value }))}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded px-4 py-2 focus:outline-none focus:border-blue-500"
                  placeholder="Enter admin key"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white rounded-lg px-6 py-3 hover:bg-blue-700 transition-colors"
              >
                Access Account
              </button>
            </form>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Users</h3>
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Total Users:</span>
                  <span className="text-2xl font-bold">{stats.users.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>New Today:</span>
                  <span className="text-xl text-green-500">+{stats.users.today}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Temporary Emails</h3>
                <Mail className="w-6 h-6 text-purple-500" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Total Created:</span>
                  <span className="text-2xl font-bold">{stats.tempEmails.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Currently Active:</span>
                  <span className="text-xl text-blue-500">{stats.tempEmails.active}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Received Emails</h3>
                <Activity className="w-6 h-6 text-yellow-500" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Total Received:</span>
                  <span className="text-2xl font-bold">{stats.receivedEmails.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Today:</span>
                  <span className="text-xl text-green-500">+{stats.receivedEmails.today}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Users Table */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Recent Registrations</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users..."
                className="bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-left border-b border-gray-700">
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Registered</th>
                  <th className="pb-3">Last Login</th>
                  <th className="pb-3">Email Count</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers
                  .filter(user => 
                    user.email.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map(user => (
                    <tr key={user.id} className="border-b border-gray-700">
                      <td className="py-3">{user.email}</td>
                      <td className="py-3">{new Date(user.created_at).toLocaleString()}</td>
                      <td className="py-3">
                        {user.last_login 
                          ? new Date(user.last_login).toLocaleString()
                          : 'Never'
                        }
                      </td>
                      <td className="py-3">{user.email_count}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Users */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-6">Top Users by Email Usage</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {topUsers.map(user => (
              <div key={user.id} className="bg-gray-700 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium truncate">{user.email}</span>
                  <span className="text-blue-400">{user.email_count} emails</span>
                </div>
                <div className="text-sm text-gray-400">
                  Received emails: {user.received_count}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
