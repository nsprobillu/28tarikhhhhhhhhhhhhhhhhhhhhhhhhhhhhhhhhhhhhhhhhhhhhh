import React, { useState } from 'react';
import { Send, X, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

interface ForwardModalProps {
  isOpen: boolean;
  onClose: () => void;
  domain: string;
}

export function ForwardModal({ isOpen, onClose, domain }: ForwardModalProps) {
  const [forwardTo, setForwardTo] = useState('');
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
        `${import.meta.env.VITE_API_URL}/domains/forward`,
        { domain, forwardTo },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onClose();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to set up email forwarding');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Send className="w-6 h-6 mr-2 text-[#4A90E2]" />
            Set Up Email Forwarding
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
              Forward emails from @{domain} to:
            </label>
            <input
              type="email"
              value={forwardTo}
              onChange={(e) => setForwardTo(e.target.value)}
              placeholder="your@email.com"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-[#4A90E2] focus:border-transparent"
              required
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              All emails sent to any address @{domain} will be forwarded to the specified email address.
            </p>
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
              {isLoading ? 'Setting up...' : 'Set Up Forwarding'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}