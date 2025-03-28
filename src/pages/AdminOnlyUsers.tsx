import React, { useState, useEffect } from 'react';
import {
  Shield, AlertTriangle, Ban, Check, RefreshCw, Search,
  Clock, Globe, User, Activity, Lock, X, Info, Database,
  ChevronDown, ChevronUp, ExternalLink, Plus
} from 'lucide-react';
import axios from 'axios';

interface IpBehavior {
  id: string;
  ip_address: string;
  behavior_type: string;
  severity: number;
  details: any;
  detected_at: string;
  status: string;
}

interface BlockedIp {
  ip_address: string;
  reason: string;
  blocked_at: string;
  expires_at?: string;
}

interface IpStats {
  totalRequests: number;
  topPaths: Array<{request_path: string, count: number}>;
  firstSeen: string;
  lastSeen: string;
  avgResponseTime: number;
  errorRate: string;
  geoInfo: {
    country: string;
    city: string;
    region: string;
  } | null;
}

export function AdminOnlyUsers() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [ipBehaviors, setIpBehaviors] = useState<IpBehavior[]>([]);
  const [blockedIps, setBlockedIps] = useState<BlockedIp[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [blockDuration, setBlockDuration] = useState('24h');
  const [selectedIp, setSelectedIp] = useState('');
  const [ipStats, setIpStats] = useState<Record<string, IpStats>>({});
  const [expandedIp, setExpandedIp] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [manualBlockIp, setManualBlockIp] = useState('');
  const [showManualBlock, setShowManualBlock] = useState(false);

  useEffect(() => {
    const storedAuth = sessionStorage.getItem('adminAuth');
    if (storedAuth === import.meta.env.VITE_ADMIN_PASSPHRASE) {
      setIsAuthorized(true);
      fetchData();
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh && isAuthorized) {
      interval = setInterval(fetchData, 30000);
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
      fetchData();
    } else {
      setError('Invalid passphrase');
    }
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const timestamp = new Date().getTime();
      
      const behaviorsResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/monitor/ip-behaviors?_t=${timestamp}`,
        { headers: { 'Admin-Access': import.meta.env.VITE_ADMIN_PASSPHRASE } }
      );
      
      const behaviors = behaviorsResponse.data || [];
      setIpBehaviors(behaviors);

      const blockedResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/monitor/blocked-ips?_t=${timestamp}`,
        { headers: { 'Admin-Access': import.meta.env.VITE_ADMIN_PASSPHRASE } }
      );
      
      const blocked = blockedResponse.data || [];
      setBlockedIps(blocked);

      const uniqueIps = new Set([
        ...behaviors.map(b => b.ip_address),
        ...blocked.map(b => b.ip_address)
      ]);

      const statsPromises = Array.from(uniqueIps).map(async ip => {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/monitor/lookup-ip`,
            {
              params: { ip },
              headers: { 'Admin-Access': import.meta.env.VITE_ADMIN_PASSPHRASE }
            }
          );
          return { ip, stats: response.data.stats };
        } catch (error) {
          console.error(`Failed to fetch stats for IP ${ip}:`, error);
          return { ip, stats: null };
        }
      });

      const statsResults = await Promise.all(statsPromises);
      const newIpStats: Record<string, IpStats> = {};
      statsResults.forEach(result => {
        if (result.stats) {
          newIpStats[result.ip] = result.stats;
        }
      });
      setIpStats(newIpStats);

    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      setError(error.response?.data?.error || 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlockIp = async (ip: string) => {
    if (!blockReason) {
      setError('Please provide a reason for blocking');
      return;
    }

    try {
      setError('');
      await axios.post(
        `${import.meta.env.VITE_API_URL}/monitor/block-ip`,
        {
          ip,
          reason: blockReason,
          duration: blockDuration
        },
        { headers: { 'Admin-Access': import.meta.env.VITE_ADMIN_PASSPHRASE } }
      );

      setBlockReason('');
      setSelectedIp('');
      await fetchData();
    } catch (error: any) {
      console.error('Failed to block IP:', error);
      setError(error.response?.data?.error || 'Failed to block IP');
    }
  };

  const handleUnblockIp = async (ip: string) => {
    try {
      setError('');
      await axios.post(
        `${import.meta.env.VITE_API_URL}/monitor/unblock-ip`,
        { ip },
        { headers: { 'Admin-Access': import.meta.env.VITE_ADMIN_PASSPHRASE } }
      );

      await fetchData();
    } catch (error: any) {
      console.error('Failed to unblock IP:', error);
      setError(error.response?.data?.error || 'Failed to unblock IP');
    }
  };

  const toggleIpDetails = (ip: string) => {
    setExpandedIp(expandedIp === ip ? null : ip);
  };

  const handleManualBlock = () => {
    if (!manualBlockIp) {
      setError('Please enter an IP address');
      return;
    }
    setSelectedIp(manualBlockIp);
    setBlockReason('Manual block');
    setManualBlockIp('');
    setShowManualBlock(false);
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
          <h1 className="text-2xl font-bold">IP Management</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowManualBlock(true)}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <Ban className="w-5 h-5 mr-2" />
              Block IP Manually
            </button>
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
              onClick={fetchData}
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

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {showManualBlock && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-8 rounded-lg w-full max-w-md border border-gray-700 shadow-2xl">
              <h3 className="text-2xl font-bold mb-6 flex items-center">
                <Ban className="w-6 h-6 text-red-500 mr-2" />
                Block IP Address
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    IP Address to Block
                  </label>
                  <input
                    type="text"
                    value={manualBlockIp}
                    onChange={(e) => setManualBlockIp(e.target.value)}
                    className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                    placeholder="Enter IP address (e.g. 192.168.1.1)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Block Duration
                  </label>
                  <select
                    value={blockDuration}
                    onChange={(e) => setBlockDuration(e.target.value)}
                    className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                  >
                    <option value="1h">1 Hour</option>
                    <option value="24h">24 Hours</option>
                    <option value="7d">7 Days</option>
                    <option value="30d">30 Days</option>
                    <option value="permanent">Permanent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Block Reason
                  </label>
                  <textarea
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                    placeholder="Enter reason for blocking this IP"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowManualBlock(false)}
                    className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleManualBlock}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center font-medium"
                  >
                    <Ban className="w-5 h-5 mr-2" />
                    Block IP
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by IP address..."
              className="w-full bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Suspicious IP Behaviors</h2>
            <div className="space-y-4">
              {ipBehaviors
                .filter(behavior => 
                  behavior.ip_address.includes(searchTerm)
                )
                .map((behavior) => (
                  <div key={behavior.id} className="bg-gray-700 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-mono">{behavior.ip_address}</p>
                        <p className="text-sm text-gray-400">
                          Type: {behavior.behavior_type}
                        </p>
                        <p className="text-sm text-gray-400">
                          Severity: {behavior.severity}
                        </p>
                        <p className="text-sm text-gray-400">
                          Detected: {new Date(behavior.detected_at).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedIp(behavior.ip_address);
                          setBlockReason(behavior.behavior_type);
                        }}
                        className="p-2 rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
                      >
                        <Ban className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Blocked IPs</h2>
            <div className="space-y-4">
              {blockedIps
                .filter(ip => 
                  ip.ip_address.includes(searchTerm)
                )
                .map((blockedIp) => (
                  <div key={blockedIp.ip_address} className="bg-gray-700 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-mono">{blockedIp.ip_address}</p>
                        <p className="text-sm text-gray-400">
                          Reason: {blockedIp.reason}
                        </p>
                        <p className="text-sm text-gray-400">
                          Blocked: {new Date(blockedIp.blocked_at).toLocaleString()}
                        </p>
                        {blockedIp.expires_at && (
                          <p className="text-sm text-gray-400">
                            Expires: {new Date(blockedIp.expires_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleUnblockIp(blockedIp.ip_address)}
                        className="p-2 rounded-lg bg-green-600 hover:bg-green-700 transition-colors"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {selectedIp && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Block IP Address</h3>
              <p className="font-mono mb-4">{selectedIp}</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Block Reason
                  </label>
                  <input
                    type="text"
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                    placeholder="Enter reason for blocking"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Block Duration
                  </label>
                  <select
                    value={blockDuration}
                    onChange={(e) => setBlockDuration(e.target.value)}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                  >
                    <option value="1h">1 Hour</option>
                    <option value="24h">24 Hours</option>
                    <option value="7d">7 Days</option>
                    <option value="30d">30 Days</option>
                    <option value="permanent">Permanent</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setSelectedIp('')}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleBlockIp(selectedIp)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Block IP
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}