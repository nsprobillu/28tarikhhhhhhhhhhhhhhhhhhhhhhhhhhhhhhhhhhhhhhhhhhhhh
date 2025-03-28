import React, { useState, useEffect } from 'react';
import { Plus, Check, X, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

interface CustomMessage {
  id: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
  is_active: boolean;
  created_at: string;
  dismiss_count: number;
}

export function Messages() {
  const { token } = useAuthStore();
  const [messages, setMessages] = useState<CustomMessage[]>([]);
  const [newMessage, setNewMessage] = useState({ content: '', type: 'info' as const });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/messages/admin/all`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      setError('Failed to fetch messages');
    }
  };

  const handleCreateMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/messages`,
        newMessage,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Message created successfully');
      setNewMessage({ content: '', type: 'info' });
      fetchMessages();
      setTimeout(() => setSuccess(''), 3000);
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
        { headers: { Authorization: `Bearer ${token}` } }
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
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchMessages();
    } catch (error) {
      console.error('Failed to delete message:', error);
      setError('Failed to delete message');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Custom Messages
      </h1>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Create New Message</h2>

        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/50 border border-red-500 text-red-600 dark:text-red-400 p-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 dark:bg-green-900/50 border border-green-500 text-green-600 dark:text-green-400 p-3 rounded">
            {success}
          </div>
        )}

        <form onSubmit={handleCreateMessage} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Message
            </label>
            <textarea
              value={newMessage.content}
              onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
              className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type
            </label>
            <select
              value={newMessage.type}
              onChange={(e) => setNewMessage({ ...newMessage, type: e.target.value as any })}
              className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
        </form>
      </div>

      <div className="space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 ${
              message.type === 'info' ? 'border-blue-500' :
              message.type === 'warning' ? 'border-yellow-500' :
              message.type === 'success' ? 'border-green-500' :
              'border-red-500'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-gray-900 dark:text-white mb-2">{message.content}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>Type: {message.type}</span>
                  <span>Created: {new Date(message.created_at).toLocaleDateString()}</span>
                  <span>Dismissed: {message.dismiss_count} times</span>
                  <span className={message.is_active ? 'text-green-500' : 'text-red-500'}>
                    {message.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => handleToggleMessage(message.id, message.is_active)}
                  className={`p-2 rounded-lg ${
                    message.is_active ? 'bg-green-600' : 'bg-gray-600'
                  } text-white hover:opacity-80 transition-opacity`}
                  title={message.is_active ? 'Deactivate' : 'Activate'}
                >
                  <Check className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDeleteMessage(message.id)}
                  className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                  title="Delete"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {messages.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No messages found</p>
          </div>
        )}
      </div>
    </div>
  );
}