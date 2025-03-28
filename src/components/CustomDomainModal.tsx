import React, { useState } from 'react';
import { Globe, AlertTriangle, X } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

interface CustomDomainModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CustomDomainModal({ isOpen, onClose }: CustomDomainModalProps) {
  const [domain, setDomain] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuthStore();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/domains/add`,
        { domain },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onClose();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to add domain');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Globe className="w-6 h-6 mr-2 text-[#4A90E2]" />
            Add Custom Domain
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 p-3 rounded flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Domain Name
            </label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-[#4A90E2] focus:border-transparent"
              required
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Required DNS Records:</h3>
            <div className="space-y-2 text-sm text-blue-700">
              <p>1. Add MX record pointing to mail.boomlify.com</p>
              <p>2. Add TXT record for SPF verification</p>
              <p>3. Add DKIM record for email authentication</p>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-[#4A90E2] text-white rounded-lg hover:bg-[#357ABD] transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Adding...' : 'Add Domain'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}