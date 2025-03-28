import React, { useState, useEffect } from 'react';
import { Mail, Search, Trash2, X, AlertTriangle, Loader } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

interface SentEmail {
  id: string;
  to: string;
  subject: string;
  sent_at: string;
  status: 'delivered' | 'failed';
}

interface SentEmailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SentEmailsModal({ isOpen, onClose }: SentEmailsModalProps) {
  const [sentEmails, setSentEmails] = useState<SentEmail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { token } = useAuthStore();

  useEffect(() => {
    if (isOpen) {
      fetchSentEmails();
    }
  }, [isOpen]);

  const fetchSentEmails = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/emails/sent`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSentEmails(response.data);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to fetch sent emails');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/emails/sent/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSentEmails(emails => emails.filter(email => email.id !== id));
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to delete email');
    }
  };

  if (!isOpen) return null;

  const filteredEmails = sentEmails.filter(email =>
    email.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Mail className="w-6 h-6 mr-2 text-[#4A90E2]" />
            Sent Emails
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search sent emails..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A90E2] focus:border-transparent"
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 p-3 rounded flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader className="w-8 h-8 animate-spin text-[#4A90E2]" />
            </div>
          ) : filteredEmails.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No sent emails found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEmails.map((email) => (
                <div
                  key={email.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 truncate">{email.subject}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="truncate">To: {email.to}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(email.sent_at).toLocaleString()}</span>
                      <span className="mx-2">•</span>
                      <span className={email.status === 'delivered' ? 'text-green-600' : 'text-red-600'}>
                        {email.status}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(email.id)}
                    className="ml-4 p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}