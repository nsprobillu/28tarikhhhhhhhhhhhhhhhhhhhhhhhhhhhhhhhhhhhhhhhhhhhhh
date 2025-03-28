import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Plus, Trash2, RefreshCw, Mail, Clock, QrCode, 
  AlertTriangle, X, ChevronLeft, ChevronRight, Loader,
  Shield, Info, Check, Globe, Send, Share
} from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { EmailSearch } from '../components/EmailSearch';
import { DeleteConfirmation } from '../components/DeleteConfirmation';
import { CopyButton } from '../components/CopyButton';
import { CaptchaVerification } from '../components/CaptchaVerification';
import { QRCodeSVG } from 'qrcode.react';
import { CustomDomainModal } from '../components/CustomDomainModal';
import { ComposeModal } from '../components/ComposeModal';
import { SentEmailsModal } from '../components/SentEmailsModal';
import { ForwardModal } from '../components/ForwardModal';

// **Storage Keys for Persistence**
const STORAGE_KEYS = {
  ITEMS_PER_PAGE: 'boomlify_items_per_page',
  SEARCH_TERM: 'boomlify_search_term',
  CURRENT_PAGE: 'boomlify_current_page',
  EMAILS_CACHE: 'boomlify_emails_cache',
  EMAILS_CACHE_TIMESTAMP: 'boomlify_emails_cache_timestamp',
  RETURNING_FROM_EMAIL_VIEW: 'boomlify_returning_from_email_view',
  MESSAGES_CACHE: 'boomlify_messages_cache',
  MESSAGES_CACHE_TIMESTAMP: 'boomlify_messages_cache_timestamp',
  DOMAINS_CACHE: 'boomlify_domains_cache',
  DOMAINS_CACHE_TIMESTAMP: 'boomlify_domains_cache_timestamp',
};

// **Cache Expiration Time (2 hours)**
const CACHE_EXPIRY = 120 * 60 * 1000;

// **Interfaces**
interface ReceivedEmail {
  subject: string;
  received_at: string;
}

interface TempEmail {
  id: string;
  email: string;
  created_at: string;
  expires_at: string;
  lastEmail?: ReceivedEmail | null;
}

interface Domain {
  id: string;
  domain: string;
}

interface CustomMessage {
  id: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
  is_active: boolean;
  dismissed: boolean;
}

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

// **QRModal Component**
function QRModal({ isOpen, onClose, email }: QRModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-auto">
        <h3 className="text-lg font-bold text-gray-900 mb-4 break-all">
          QR Code for {email}
        </h3>
        <div className="flex justify-center mb-4">
          <QRCodeSVG
            value={email}
            size={Math.min(window.innerWidth - 80, 200)}
            className="w-full max-w-[200px]"
          />
        </div>
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-[#4A90E2] text-white rounded-lg hover:bg-[#357ABD] transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

// **Dashboard Component**
export function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const { isDark } = useThemeStore();

  // **State Declarations**
  const [currentPage, setCurrentPage] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_PAGE);
    return saved ? parseInt(saved, 10) : 1;
  });
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ITEMS_PER_PAGE);
    return saved ? parseInt(saved, 10) : 10;
  });
  const [totalEmails, setTotalEmails] = useState(0);
  const [pageJumpInput, setPageJumpInput] = useState('');
  const [pageJumpError, setPageJumpError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [tempEmails, setTempEmails] = useState<TempEmail[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.SEARCH_TERM) || '';
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; emailId: string; email: string }>({
    isOpen: false,
    emailId: '',
    email: ''
  });
  const [qrModal, setQRModal] = useState<{ isOpen: boolean; email: string }>({
    isOpen: false,
    email: ''
  });
  const [messages, setMessages] = useState<CustomMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [captchaRequired, setCaptchaRequired] = useState(false);
  const [captchaSiteKey, setCaptchaSiteKey] = useState('');
  const [captchaResponse, setCaptchaResponse] = useState('');
  const [customDomainModal, setCustomDomainModal] = useState(false);
  const [composeModal, setComposeModal] = useState(false);
  const [sentEmailsModal, setSentEmailsModal] = useState(false);
  const [forwardModal, setForwardModal] = useState({ isOpen: false, domain: '' });

  // **Cache Management Functions for Emails**
  const getCachedEmails = () => {
    try {
      const cachedData = localStorage.getItem(STORAGE_KEYS.EMAILS_CACHE);
      const timestamp = localStorage.getItem(STORAGE_KEYS.EMAILS_CACHE_TIMESTAMP);
      if (cachedData && timestamp) {
        const age = Date.now() - parseInt(timestamp, 10);
        if (age < CACHE_EXPIRY) {
          return JSON.parse(cachedData);
        }
      }
    } catch (error) {
      console.error('Error reading email cache:', error);
    }
    return null;
  };

  const updateEmailCache = (emails: TempEmail[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.EMAILS_CACHE, JSON.stringify(emails));
      localStorage.setItem(STORAGE_KEYS.EMAILS_CACHE_TIMESTAMP, Date.now().toString());
    } catch (error) {
      console.error('Error updating email cache:', error);
    }
  };

  const invalidateEmailCache = () => {
    localStorage.removeItem(STORAGE_KEYS.EMAILS_CACHE);
    localStorage.removeItem(STORAGE_KEYS.EMAILS_CACHE_TIMESTAMP);
  };

  // **Cache Management Functions for Messages**
  const getCachedMessages = () => {
    try {
      const cachedData = localStorage.getItem(STORAGE_KEYS.MESSAGES_CACHE);
      const timestamp = localStorage.getItem(STORAGE_KEYS.MESSAGES_CACHE_TIMESTAMP);
      if (cachedData && timestamp) {
        const age = Date.now() - parseInt(timestamp, 10);
        if (age < CACHE_EXPIRY) {
          return JSON.parse(cachedData);
        }
      }
    } catch (error) {
      console.error('Error reading messages cache:', error);
    }
    return null;
  };

  const updateMessagesCache = (messages: CustomMessage[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.MESSAGES_CACHE, JSON.stringify(messages));
      localStorage.setItem(STORAGE_KEYS.MESSAGES_CACHE_TIMESTAMP, Date.now().toString());
    } catch (error) {
      console.error('Error updating messages cache:', error);
    }
  };

  const invalidateMessagesCache = () => {
    localStorage.removeItem(STORAGE_KEYS.MESSAGES_CACHE);
    localStorage.removeItem(STORAGE_KEYS.MESSAGES_CACHE_TIMESTAMP);
  };

  // **Cache Management Functions for Domains**
  const getCachedDomains = () => {
    try {
      const cachedData = localStorage.getItem(STORAGE_KEYS.DOMAINS_CACHE);
      const timestamp = localStorage.getItem(STORAGE_KEYS.DOMAINS_CACHE_TIMESTAMP);
      if (cachedData && timestamp) {
        const age = Date.now() - parseInt(timestamp, 10);
        if (age < CACHE_EXPIRY) {
          return JSON.parse(cachedData);
        }
      }
    } catch (error) {
      console.error('Error reading domains cache:', error);
    }
    return null;
  };

  const updateDomainsCache = (domains: Domain[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.DOMAINS_CACHE, JSON.stringify(domains));
      localStorage.setItem(STORAGE_KEYS.DOMAINS_CACHE_TIMESTAMP, Date.now().toString());
    } catch (error) {
      console.error('Error updating domains cache:', error);
    }
  };

  const invalidateDomainsCache = () => {
    localStorage.removeItem(STORAGE_KEYS.DOMAINS_CACHE);
    localStorage.removeItem(STORAGE_KEYS.DOMAINS_CACHE_TIMESTAMP);
  };

  // **Effect Hooks**
  useEffect(() => {
    const isReturning = localStorage.getItem(STORAGE_KEYS.RETURNING_FROM_EMAIL_VIEW) === 'true';
    if (isReturning) {
      const cachedEmails = getCachedEmails();
      if (cachedEmails) {
        setTempEmails(cachedEmails);
        setIsLoading(false);
      }
      localStorage.removeItem(STORAGE_KEYS.RETURNING_FROM_EMAIL_VIEW);
    } else {
      fetchEmails();
    }
  }, [currentPage, itemsPerPage, searchTerm]);

  useEffect(() => {
    const cachedDomains = getCachedDomains();
    if (cachedDomains) {
      setDomains(cachedDomains);
      if (cachedDomains.length > 0 && !selectedDomain) {
        setSelectedDomain(cachedDomains[0].id);
      }
    } else {
      fetchDomains();
    }
  }, []);

  useEffect(() => {
    const cachedMessages = getCachedMessages();
    if (cachedMessages) {
      setMessages(cachedMessages);
    } else {
      fetchMessages();
    }
  }, [token]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ITEMS_PER_PAGE, itemsPerPage.toString());
  }, [itemsPerPage]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SEARCH_TERM, searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_PAGE, currentPage.toString());
  }, [currentPage]);

  // **API Functions**
  const fetchEmails = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/emails`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm
        }
      });

      let emailsWithLastMessage: TempEmail[];
      if (response.data.metadata && response.data.data) {
        setTotalEmails(response.data.metadata.total);
        emailsWithLastMessage = await Promise.all(
          response.data.data.map(async (email: TempEmail) => {
            try {
              const lastEmailResponse = await axios.get(
                `${import.meta.env.VITE_API_URL}/emails/${email.id}/received?limit=1`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              const lastEmail = lastEmailResponse.data.data && lastEmailResponse.data.data.length > 0 
                ? lastEmailResponse.data.data[0] 
                : null;
              return { ...email, lastEmail };
            } catch (error) {
              return email;
            }
          })
        );
      } else {
        emailsWithLastMessage = await Promise.all(
          response.data.map(async (email: TempEmail) => {
            try {
              const lastEmailResponse = await axios.get(
                `${import.meta.env.VITE_API_URL}/emails/${email.id}/received?limit=1`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              const lastEmail = lastEmailResponse.data.data && lastEmailResponse.data.data.length > 0 
                ? lastEmailResponse.data.data[0] 
                : null;
              return { ...email, lastEmail };
            } catch (error) {
              return email;
            }
          })
        );
        setTotalEmails(emailsWithLastMessage.length);
      }
      setTempEmails(emailsWithLastMessage);
      updateEmailCache(emailsWithLastMessage);
    } catch (error) {
      console.error('Failed to fetch emails:', error);
      invalidateEmailCache();
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDomains = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/domains`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const fetchedDomains = response.data;
      setDomains(fetchedDomains);
      updateDomainsCache(fetchedDomains);
      if (fetchedDomains.length > 0 && !selectedDomain) {
        setSelectedDomain(fetchedDomains[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch domains:', error);
      invalidateDomainsCache();
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/messages`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const activeMessages = response.data.filter((msg: CustomMessage) => !msg.dismissed);
      setMessages(activeMessages);
      updateMessagesCache(activeMessages);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      invalidateMessagesCache();
    }
  };

  const createEmail = async () => {
    try {
      setError('');
      
      if (!selectedDomain) {
        setError('Please select a domain');
        return;
      }

      const selectedDomainObj = domains.find(d => d.id === selectedDomain);
      if (!selectedDomainObj) {
        setError('Invalid domain selected');
        return;
      }

      const inputUsername = newEmail.trim();
      if (inputUsername && !/^[a-zA-Z0-9]+$/.test(inputUsername)) {
        setError('Username can only contain letters and numbers');
        return;
      }

      const emailPrefix = inputUsername || Math.random().toString(36).substring(2, 8);
      const fullEmail = `${emailPrefix}@${selectedDomainObj.domain}`;
      
      interface RequestData {
        email: string;
        domainId: string;
        captchaResponse?: string;
      }
      
      const requestData: RequestData = { 
        email: fullEmail, 
        domainId: selectedDomain 
      };
      
      if (captchaResponse) {
        requestData.captchaResponse = captchaResponse;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/emails/create`,
        requestData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newEmailData = {
        ...response.data,
        lastEmail: null
      };
      
      setTempEmails(prev => {
        const newList = [newEmailData, ...prev];
        updateEmailCache(newList);
        return newList;
      });
      setTotalEmails(prev => prev + 1);
      setNewEmail('');
      setCaptchaRequired(false);
      setCaptchaResponse('');
    } catch (error: any) {
      console.error('Create email error:', error);
      if (error.response?.data?.error === 'CAPTCHA_REQUIRED') {
        setCaptchaRequired(true);
        setCaptchaSiteKey(error.response?.data?.captchaSiteKey || import.meta.env.VITE_CAPTCHA_SITE_KEY_1);
        setError('You have reached the rate limit. Please complete the CAPTCHA to create more emails. If you don\'t see the CAPTCHA, click CREATE again.');
      } else {
        setError(error.response?.data?.error || 'Failed to create email');
      }
    }
  };

  const deleteEmail = async () => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/emails/delete/${deleteConfirmation.emailId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedEmails = tempEmails.filter(email => email.id !== deleteConfirmation.emailId);
      setTempEmails(updatedEmails);
      updateEmailCache(updatedEmails);
      setDeleteConfirmation({ isOpen: false, emailId: '', email: '' });
      setTotalEmails(prev => Math.max(0, prev - 1));
      if (currentPage > 1 && tempEmails.length === 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      console.error('Failed to delete email:', error);
      invalidateEmailCache();
    }
  };

  const handleDismissMessage = async (messageId: string) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/messages/${messageId}/dismiss`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedMessages = messages.filter(msg => msg.id !== messageId);
      setMessages(updatedMessages);
      updateMessagesCache(updatedMessages);
    } catch (error) {
      console.error('Failed to dismiss message:', error);
      invalidateMessagesCache();
    }
  };

  // **Handler Functions**
  const handleEmailView = (emailId: string) => {
    localStorage.setItem(STORAGE_KEYS.RETURNING_FROM_EMAIL_VIEW, 'true');
    navigate(`/dashboard/email/${emailId}`);
  };

  const confirmDelete = (id: string, email: string) => {
    setDeleteConfirmation({ isOpen: true, emailId: id, email });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchEmails();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleItemsPerPageChange = (newValue: number) => {
    setItemsPerPage(newValue);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handlePageJump = () => {
    const pageNum = parseInt(pageJumpInput, 10);
    if (isNaN(pageNum) || pageNum < 1 || pageNum > totalPages) {
      setPageJumpError(`Please enter a number between 1 and ${totalPages}`);
      return;
    }
    setCurrentPage(pageNum);
    setPageJumpInput('');
    setPageJumpError('');
  };

  const handlePageJumpInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setPageJumpInput(value);
      setPageJumpError('');
    }
  };

  const handlePageJumpKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handlePageJump();
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const totalPages = Math.ceil(totalEmails / itemsPerPage);

  // **Render**
  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="flex flex-col space-y-6 mb-6">
        <div className="flex justify-between items-center">
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Your Temporary Emails
          </h1>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`p-2 rounded-full transition-colors ${
              isDark 
                ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
            title="Refresh"
            aria-label="Refresh emails"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row w-full sm:w-auto space-y-4 sm:space-y-0 sm:space-x-2">
          <div className="flex w-full sm:w-auto">
            <input
              type="text"
              value={newEmail}
              onChange={(e) => {
                const alphanumericOnly = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
                setNewEmail(alphanumericOnly);
              }}
              placeholder="Enter username (optional)"
              className={`flex-1 sm:w-48 rounded-l-lg border-r-0 border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ${
                isDark ? 'bg-gray-700 text-white border-gray-600' : ''
              }`}
            />
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className={`rounded-r-lg border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ${
                isDark ? 'bg-gray-700 text-white border-gray-600' : ''
              }`}
            >
              {domains.map(domain => (
                <option key={domain.id} value={domain.id}>
                  @{domain.domain}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={createEmail}
            className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#4A90E2] hover:bg-[#357ABD] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 whitespace-nowrap"
          >
            <Plus className="h-5 w-5 mr-1 sm:mr-0 sm:hidden" />
            <span>Create</span>
          </button>
          {/* Premium Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCustomDomainModal(true)}
              className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 whitespace-nowrap"
            >
              <Globe className="h-5 w-5 mr-1 sm:mr-0 sm:hidden" />
              <span className="sm:hidden">Add Domain</span>
              <span className="hidden sm:inline">Add Custom Domain</span>
            </button>
            <button
              onClick={() => setComposeModal(true)}
              className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 whitespace-nowrap"
            >
              <Mail className="h-5 w-5 mr-1 sm:mr-0 sm:hidden" />
              <span>Compose</span>
            </button>
            <button
              onClick={() => setSentEmailsModal(true)}
              className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 whitespace-nowrap"
            >
              <Send className="h-5 w-5 mr-1 sm:mr-0 sm:hidden" />
              <span className="sm:hidden">Sent</span>
              <span className="hidden sm:inline">Sent Emails</span>
            </button>
          </div>
        </div>

        {captchaRequired && captchaSiteKey && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center text-blue-700 mb-3">
              <Shield className="w-5 h-5 mr-2" />
              <p>Please complete the CAPTCHA verification to continue.</p>
            </div>
            <CaptchaVerification 
              siteKey={captchaSiteKey} 
              onVerify={response => setCaptchaResponse(response)} 
              className="mt-2"
            />
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <EmailSearch searchTerm={searchTerm} onSearchChange={handleSearchChange} />
          </div>
          <div className="flex items-center">
            <select 
              value={itemsPerPage} 
              onChange={e => handleItemsPerPageChange(Number(e.target.value))}
              className={`rounded-lg border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ${
                isDark ? 'bg-gray-700 text-white border-gray-600' : ''
              }`}
            >
              <option value="5">5 per page</option>
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {messages.length > 0 && (
        <div className="mb-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start p-4 rounded-lg ${
                message.type === 'info' ? 'bg-blue-50 text-blue-800' :
                message.type === 'warning' ? 'bg-yellow-50 text-yellow-800' :
                message.type === 'success' ? 'bg-green-50 text-green-800' :
                'bg-red-50 text-red-800'
              }`}
            >
              <div className="flex-shrink-0 mr-3">
                {message.type === 'info' && <Info className="w-5 h-5" />}
                {message.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
                {message.type === 'success' && <Check className="w-5 h-5" />}
                {message.type === 'error' && <Shield className="w-5 h-5" />}
              </div>
              <div className="flex-1 mr-2">
                <p>{message.content}</p>
              </div>
              <button
                onClick={() => handleDismissMessage(message.id)}
                className="flex-shrink-0 ml-4 hover:opacity-75 transition-opacity"
                aria-label={`Dismiss ${message.type} message`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className={`flex justify-center items-center py-12 ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
          <Loader className="w-8 h-8 animate-spin mr-2" />
          <span>Loading emails...</span>
        </div>
      ) : tempEmails.length === 0 ? (
        <div className={`text-center py-12 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
          <Mail className={`mx-auto h-12 w-12 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
          <h3 className="mt-2 text-sm font-medium">No temporary emails</h3>
          <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {searchTerm ? 'No emails match your search.' : 'Get started by creating a new temporary email.'}
          </p>
        </div>
      ) : (
        <>
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} shadow overflow-hidden sm:rounded-lg`}>
            <ul className="divide-y divide-gray-200">
              {tempEmails.map((email, index) => (
                <div
                  key={email.id}
                  onClick={() => handleEmailView(email.id)}
                  className={`block transition-colors ${
                    index === 0 ? 'animate-highlight bg-blue-50 dark:bg-blue-900/30' : ''
                  } ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                          <p className={`text-sm font-medium truncate ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                            {email.email}
                          </p>
                          <CopyButton 
                            text={email.email} 
                            className="z-10"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          />
                        </div>
                        <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            Expires {formatDate(email.expires_at)}
                          </span>
                          {email.lastEmail && (
                            <span className="flex items-center">
                              <Mail className="w-4 h-4 mr-1" />
                              {email.lastEmail.subject}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 sm:mt-0 flex justify-end space-x-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setQRModal({ isOpen: true, email: email.email });
                          }}
                          className={`text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full ${
                            isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                          }`}
                          aria-label={`Show QR code for ${email.email}`}
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            confirmDelete(email.id, email.email);
                          }}
                          className={`text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full ${
                            isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                          }`}
                          aria-label={`Delete ${email.email}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setForwardModal({ isOpen: true, domain: email.email.split('@')[1] });
                          }}
                          className={`inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all`}
                          aria-label={`Forward ${email.email}`}
                        >
                          <Share className="w-4 h-4 mr-1" />
                          <span>Forward</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </ul>
          </div>

          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 space-y-4 sm:space-y-0">
              <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                Showing {Math.min(1 + (currentPage - 1) * itemsPerPage, totalEmails)} - {Math.min(currentPage * itemsPerPage, totalEmails)} of {totalEmails}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1 || isLoading}
                  className={`p-2 rounded-md ${
                    currentPage === 1 || isLoading
                      ? 'opacity-50 cursor-not-allowed' 
                      : isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                  } transition-colors`}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={pageJumpInput}
                    onChange={handlePageJumpInputChange}
                    onKeyPress={handlePageJumpKeyPress}
                    disabled={isLoading}
                    placeholder={currentPage.toString()}
                    className={`w-16 px-2 py-1 text-center rounded-md border ${
                      isDark 
                        ? 'bg-gray-700 text-white border-gray-600 focus:border-indigo-500' 
                        : 'bg-white text-gray-700 border-gray-300 focus:border-indigo-300'
                    } focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ${
                      pageJumpError ? 'border-red-500' : ''
                    }`}
                    aria-label="Jump to page"
                  />
                  <span className={`${isDark ? 'text-white' : 'text-gray-700'}`}>
                    / {totalPages}
                  </span>
                  <button
                    onClick={handlePageJump}
                    disabled={isLoading || !pageJumpInput}
                    className={`px-3 py-1 rounded-md text-sm ${
                      isLoading || !pageJumpInput
                        ? 'opacity-50 cursor-not-allowed bg-gray-400'
                        : isDark 
                          ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    } transition-colors`}
                    aria-label="Go to page"
                  >
                    Go
                  </button>
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages || isLoading}
                  className={`p-2 rounded-md ${
                    currentPage === totalPages || isLoading
                      ? 'opacity-50 cursor-not-allowed' 
                      : isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                  } transition-colors`}
                  aria-label="Next page"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              {pageJumpError && (
                <div className="text-sm text-red-500 mt-2 sm:mt-0">
                  {pageJumpError}
                </div>
              )}
            </div>
          )}
        </>
      )}

      <DeleteConfirmation
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, emailId: '', email: '' })}
        onConfirm={deleteEmail}
        itemName={deleteConfirmation.email}
      />

      <QRModal
        isOpen={qrModal.isOpen}
        onClose={() => setQRModal({ isOpen: false, email: '' })}
        email={qrModal.email}
      />

      <CustomDomainModal
        isOpen={customDomainModal}
        onClose={() => setCustomDomainModal(false)}
      />

      <ComposeModal
        isOpen={composeModal}
        onClose={() => setComposeModal(false)}
        tempEmailId={undefined}
      />

      <SentEmailsModal
        isOpen={sentEmailsModal}
        onClose={() => setSentEmailsModal(false)}
      />

      <ForwardModal
        isOpen={forwardModal.isOpen}
        onClose={() => setForwardModal({ isOpen: false, domain: '' })}
        domain={forwardModal.domain}
      />
    </div>
  );
}