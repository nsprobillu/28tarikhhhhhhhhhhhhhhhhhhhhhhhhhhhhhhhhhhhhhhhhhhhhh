import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, Shield, Clock, Globe, CheckCircle, Zap, RefreshCw, Copy,
  Loader, Inbox, Trash2, Archive, Star, QrCode, AlertTriangle,
  ExternalLink, ArrowRight, Lock, Search, Filter, Download
} from 'lucide-react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { PublicLayout } from '../components/PublicLayout';
import { Helmet } from 'react-helmet-async';

// Storage keys
const STORAGE_KEYS = {
  TEMP_EMAIL: 'boomlify_temp_email',
  SELECTED_DOMAIN: 'boomlify_selected_domain'
};

// Pre-define static content for faster loading
const STATIC_CONTENT = {
  title: "Free Temporary Email Generator - Create Instant Disposable Email | Boomlify",
  description: "Generate free temporary email addresses instantly. No registration required. Protect your privacy with disposable email addresses that last up to 48 hours.",
  schema: {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Boomlify Temporary Email Generator",
    "applicationCategory": "Email Service",
    "description": "Generate free temporary email addresses instantly. No registration required. Protect your privacy with disposable email addresses that last up to 48 hours.",
    "operatingSystem": "All",
    "url": "https://boomlify.com/temp-mail-instant",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Instant email generation",
      "48-hour validity",
      "No registration required",
      "Spam protection",
      "Real-time email updates"
    ]
  }
};

interface Domain {
  id: string;
  domain: string;
}

interface TempEmail {
  id: string;
  email: string;
  created_at: string;
  expires_at: string;
}

interface ReceivedEmail {
  id: string;
  from_email: string;
  subject: string;
  body_html: string;
  body_text: string;
  received_at: string;
  temp_email: string;
}

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

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

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
      title={copied ? 'Copied!' : 'Copy to clipboard'}
    >
      {copied ? (
        <CheckCircle className="w-5 h-5 text-green-500" />
      ) : (
        <Copy className="w-5 h-5 text-gray-500" />
      )}
    </button>
  );
}

function EmptyInboxContent() {
  return (
    <article>
      <section>
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
          How to use temporary email?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-[#4A90E2]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-[#4A90E2] font-semibold">1</span>
            </div>
            <p className="text-gray-600">
              Copy email address from the top left corner
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-[#4A90E2]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-[#4A90E2] font-semibold">2</span>
            </div>
            <p className="text-gray-600">
              Use this to sign up on websites, social media, etc
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-[#4A90E2]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-[#4A90E2] font-semibold">3</span>
            </div>
            <p className="text-gray-600">
              Read incoming emails on this page on the left side
            </p>
          </div>
        </div>
      </section>

      <section className="prose max-w-none">
        <h2 className="text-2xl font-bold text-center mb-6">
          What is a Temporary Email Service?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Benefits of Temporary Email</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Shield className="w-5 h-5 text-[#4A90E2] mr-2" />
                <span>Protect your primary email from spam</span>
              </li>
              <li className="flex items-center">
                <Lock className="w-5 h-5 text-[#4A90E2] mr-2" />
                <span>Maintain privacy when signing up</span>
              </li>
              <li className="flex items-center">
                <Filter className="w-5 h-5 text-[#4A90E2] mr-2" />
                <span>Avoid marketing emails and newsletters</span>
              </li>
              <li className="flex items-center">
                <Search className="w-5 h-5 text-[#4A90E2] mr-2" />
                <span>Test services without risk</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Key Features</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Clock className="w-5 h-5 text-[#4A90E2] mr-2" />
                <span>48-hour email validity</span>
              </li>
              <li className="flex items-center">
                <Zap className="w-5 h-5 text-[#4A90E2] mr-2" />
                <span>Instant email generation</span>
              </li>
              <li className="flex items-center">
                <Download className="w-5 h-5 text-[#4A90E2] mr-2" />
                <span>Attachment support</span>
              </li>
              <li className="flex items-center">
                <RefreshCw className="w-5 h-5 text-[#4A90E2] mr-2" />
                <span>Auto-refresh inbox</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Additional SEO Content */}
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Common Uses for Temporary Email</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-bold mb-2">For Personal Use</h4>
              <ul className="space-y-2">
                <li>Sign up for free trials</li>
                <li>Register on forums</li>
                <li>Download free resources</li>
                <li>Test online services</li>
              </ul>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-bold mb-2">For Business Use</h4>
              <ul className="space-y-2">
                <li>Test email marketing campaigns</li>
                <li>Verify email notifications</li>
                <li>Create test accounts</li>
                <li>QA testing</li>
              </ul>
            </div>
          </div>
        </div>

        {/* SEO Keywords Section (Hidden from view but visible to search engines) */}
        <div className="sr-only">
          <h2>Free Temporary Email Generator</h2>
          <p>
            Create disposable email addresses instantly with our free temporary email generator.
            Perfect for protecting your privacy, avoiding spam, and testing services.
            No registration required, instant access, and 48-hour validity.
          </p>
          <ul>
            <li>Temporary email service</li>
            <li>Disposable email address</li>
            <li>Temp mail generator</li>
            <li>Anonymous email</li>
            <li>Fake email generator</li>
            <li>10 minute mail</li>
            <li>Throwaway email</li>
            <li>Temporary inbox</li>
            <li>Spam prevention</li>
            <li>Email privacy protection</li>
          </ul>
        </div>
      </section>
    </article>
  );
}

export function TempMailInstant() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [tempEmail, setTempEmail] = useState<TempEmail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [receivedEmails, setReceivedEmails] = useState<ReceivedEmail[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<ReceivedEmail | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [error, setError] = useState('');
  const [qrModal, setQRModal] = useState({ isOpen: false, email: '' });

  const isBot = () => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /bot|crawler|spider/i.test(userAgent);
  };

  useEffect(() => {
    const initializeService = async () => {
      try {
        setIsLoading(true);
        const domainsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/domains/public`);
        const availableDomains = domainsResponse.data;

        if (availableDomains && availableDomains.length > 0) {
          setDomains(availableDomains);
          setSelectedDomain(availableDomains[0]);

          const savedEmail = localStorage.getItem(STORAGE_KEYS.TEMP_EMAIL);
          if (savedEmail) {
            const emailData = JSON.parse(savedEmail);
            const expiryDate = new Date(emailData.expires_at);

            if (expiryDate > new Date()) {
              setTempEmail(emailData);
              fetchEmails(emailData.email);
              return;
            }
          }

          await generateEmail(availableDomains[0]);
        }
      } catch (error) {
        console.error('Service initialization error:', error);
        setError('Failed to initialize service');
      } finally {
        setIsLoading(false);
      }
    };

    initializeService();
  }, []);

  useEffect(() => {
    if (domains.length === 0) return;

    const loadEmail = async () => {
      setIsEmailLoading(true);
      try {
        const savedEmail = localStorage.getItem(STORAGE_KEYS.TEMP_EMAIL);
        if (savedEmail) {
          const emailData = JSON.parse(savedEmail);
          const expiryDate = new Date(emailData.expires_at);

          if (expiryDate > new Date()) {
            setTempEmail(emailData);
            await fetchEmails(emailData.email);
            return;
          }
        }
        await generateEmail(domains[0]);
      } catch (error) {
        console.error('Failed to load/generate email:', error);
        setError('Failed to initialize email');
      } finally {
        setIsEmailLoading(false);
      }
    };

    loadEmail();
  }, [domains]);

  const generateEmail = async (domain: Domain) => {
    if (!domain) {
      setError('No domain selected');
      return;
    }

    try {
      setIsEmailLoading(true);
      setError('');

      // Generate random string using only letters a-z
      const generateRandomLetters = (length: number) => {
        const letters = 'abcdefghijklmnopqrstuvwxyz';
        let result = '';
        for (let i = 0; i < length; i++) {
          result += letters.charAt(Math.floor(Math.random() * letters.length));
        }
        return result;
      };

      // Generate username with 8 random letters
      const randomPrefix = generateRandomLetters(8);
      const fullEmail = `${randomPrefix}@${domain.domain}`;

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/emails/public/create`,
        {
          email: fullEmail,
          domainId: domain.id
        }
      );

      if (!response.data) {
        throw new Error('Failed to create email');
      }

      // Save email and domain to localStorage
      localStorage.setItem(STORAGE_KEYS.TEMP_EMAIL, JSON.stringify(response.data));
      localStorage.setItem(STORAGE_KEYS.SELECTED_DOMAIN, JSON.stringify(domain));

      setTempEmail(response.data);
      setSelectedDomain(domain);
      setReceivedEmails([]);
      setSelectedEmail(null);
    } catch (error: any) {
      console.error('Failed to generate email:', error);
      setError(error.response?.data?.error || 'Failed to create email address');
    } finally {
      setIsEmailLoading(false);
    }
  };

  const fetchEmails = async (email: string) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/emails/public/${email}`);
      setReceivedEmails(response.data || []);
    } catch (error) {
      console.error('Failed to fetch emails:', error);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (autoRefresh && tempEmail?.email && !isBot()) {
      fetchEmails(tempEmail.email);
      interval = setInterval(() => fetchEmails(tempEmail.email), 10000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, tempEmail]);

  const handleDomainChange = (domainId: string) => {
    const newDomain = domains.find(d => d.id === domainId);
    if (!newDomain) return;
    setSelectedDomain(newDomain);
  };

  const handleChangeEmail = async () => {
    if (!selectedDomain) return;
    await generateEmail(selectedDomain);
  };

  if (error) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Free Temporary Email Generator
              </h1>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-xl mx-auto">
                <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-600">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <Helmet>
        <title>{STATIC_CONTENT.title}</title>
        <meta name="description" content={STATIC_CONTENT.description} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://boomlify.com/temp-mail-instant" />
        <script type="application/ld+json">
          {JSON.stringify(STATIC_CONTENT.schema)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <article>
            {/* Hero Section */}
            <section>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Free Temporary Email Generator
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Create disposable email addresses instantly. Protect your privacy and avoid spam with our secure temporary email service.
              </p>
            </section>

            {/* Email Generation Section */}
            <section className={`bg-white rounded-xl shadow-lg p-6 mb-8 ${isEmailLoading ? 'opacity-50' : ''}`}>
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-mono truncate">{tempEmail?.email}</span>
                    <CopyButton text={tempEmail?.email || ''} />
                    <button
                      onClick={() => setQRModal({ isOpen: true, email: tempEmail?.email || '' })}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      title="Show QR Code"
                    >
                      <QrCode className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                  <div className="flex items-center mt-2 text-gray-500 text-sm">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>Valid until {new Date(tempEmail?.expires_at || '').toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <select
                    value={selectedDomain?.id || ''}
                    onChange={(e) => handleDomainChange(e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#4A90E2] focus:border-transparent outline-none"
                  >
                    {domains.map((domain) => (
                      <option key={domain.id} value={domain.id}>
                        @{domain.domain}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleChangeEmail}
                    className="px-4 py-2 bg-[#4A90E2] text-white rounded-lg hover:bg-[#357ABD] transition-colors"
                    disabled={isEmailLoading}
                  >
                    {isEmailLoading ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <RefreshCw className="w-5 h-5 mr-2" />
                        Change Email
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    className={`p-2 rounded-lg ${
                      autoRefresh ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                    } hover:bg-opacity-75 transition-colors`}
                    title={autoRefresh ? 'Auto-refresh on' : 'Auto-refresh off'}
                  >
                    <RefreshCw className={`w-5 h-5 ${autoRefresh ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
              {isEmailLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50">
                  <Loader className="w-8 h-8 animate-spin text-[#4A90E2]" />
                </div>
              )}
            </section>

            {/* Inbox Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-900">
                    <Inbox className="w-5 h-5 mr-2" />
                    Inbox
                  </h2>
                  <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {receivedEmails.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Your inbox is empty</p>
                        <p className="text-sm">Emails will appear here automatically</p>
                      </div>
                    ) : (
                      receivedEmails.map((email) => (
                        <div
                          key={email.id}
                          onClick={() => setSelectedEmail(email)}
                          className={`p-4 rounded-lg cursor-pointer transition-colors ${
                            selectedEmail?.id === email.id
                              ? 'bg-[#4A90E2]/10'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium truncate flex-1 text-gray-900">
                              {email.subject || 'No Subject'}
                            </h3>
                            <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                              {new Date(email.received_at).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {email.from_email}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
                  <div className="max-h-[600px] overflow-y-auto">
                    {selectedEmail ? (
                      <div>
                        <div className="border-b pb-4 mb-4">
                          <h2 className="text-xl font-semibold mb-2 text-gray-900">
                            {selectedEmail.subject || 'No Subject'}
                          </h2>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>From: {selectedEmail.from_email}</span>
                            <span>{new Date(selectedEmail.received_at).toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="prose max-w-none">
                          {selectedEmail.body_html ? (
                            <div
                              dangerouslySetInnerHTML={{
                                __html: selectedEmail.body_html
                              }}
                            />
                          ) : (
                            <pre className="whitespace-pre-wrap font-sans text-gray-700">
                              {selectedEmail.body_text}
                            </pre>
                          )}
                        </div>
                      </div>
                    ) : (
                      <EmptyInboxContent />
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Comparison Banner - Moved here */}
            <section className="bg-gradient-to-r from-[#4A90E2] to-[#357ABD] text-white py-4 my-8 rounded-lg">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex flex-wrap justify-center gap-8">
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 mr-2" />
                      <span>Free: 48 hours</span>
                    </div>
                    <div className="flex items-center text-white/80">vs</div>
                    <div className="flex items-center">
                      <Star className="w-5 h-5 mr-2" />
                      <span>Registered: 3+ months</span>
                    </div>
                  </div>
                  <Link
                    to="/register"
                    className="bg-white text-[#4A90E2] px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center"
                  >
                    Register Free
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </div>
            </section>

            {/* Feature Comparison Table - Moved here */}
            <section className="bg-white rounded-xl shadow-lg p-8 mb-12">
              <h2 className="text-2xl font-bold text-center mb-8">
                Why Register for a Free Account?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center p-6 bg-gray-50 rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300">
                  <Clock className="w-12 h-12 text-[#4A90E2] mx-auto mb-4" />
                  <h3 className="text-lg font-bold mb-2">Extended Validity</h3>
                  <p className="text-gray-600 mb-4">Emails last 3+ months instead of 48 hours</p>
                  <div className="text-[#4A90E2] font-bold">Premium Feature</div>
                </div>

                <div className="text-center p-6 bg-gray-50 rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300">
                  <Mail className="w-12 h-12 text-[#4A90E2] mx-auto mb-4" />
                  <h3 className="text-lg font-bold mb-2">Unlimited Addresses</h3>
                  <p className="text-gray-600 mb-4">Create as many addresses as you need</p>
                  <div className="text-[#4A90E2] font-bold">Premium Feature</div>
                </div>

                <div className="text-center p-6 bg-gray-50 rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300">
                  <Shield className="w-12 h-12 text-[#4A90E2] mx-auto mb-4" />
                  <h3 className="text-lg font-bold mb-2">Custom Usernames</h3>
                  <p className="text-gray-600 mb-4">Choose your preferred email usernames</p>
                  <div className="text-[#4A90E2] font-bold">Premium Feature</div>
                </div>
              </div>

              <div className="text-center mt-8">
                <Link
                  to="/register"
                  className="inline-flex items-center bg-[#4A90E2] text-white px-8 py-3 rounded-lg hover:bg-[#357ABD] transition-colors"
                >
                  Create Free Account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <p className="mt-2 text-gray-500">No credit card required </p>
              </div>
            </section>

            {/* Ultimate Temporary Email Master Guide */}
            <article className="bg-white rounded-xl shadow-2xl p-8 my-12">
              <div className="max-w-7xl mx-auto">
                <h1 className="text-5xl font-bold text-gray-900 mb-8 text-center">
                  The Definitive 2024 Guide to Temporary Email Services: Privacy, Security & Beyond
                </h1>

                {/* Table of Contents (SEO-Friendly Anchor Links) */}
                <div className="mb-16 bg-blue-50 p-6 rounded-xl">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">In This Guide:</h2>
                  <ul className="columns-2 gap-8 text-blue-700">
                    <li><a href="#how-it-works">How Temporary Email Works</a></li>
                    <li><a href="#vs-proxy">Temp Mail vs VPN/Proxy</a></li>
                    <li><a href="#enterprise-uses">Enterprise Use Cases</a></li>
                    <li><a href="#email-forensics">Email Header Analysis</a></li>
                    <li><a href="#api-integration">API Development Guide</a></li>
                    <li><a href="#legal-guide">Global Legal Compliance</a></li>
                    <li><a href="#future-trends">Future of Disposable Emails</a></li>
                  </ul>
                </div>

                {/* Deep Technical Section */}
                <section id="how-it-works" className="mb-16">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Technical Architecture of Temp Mail Services</h2>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-bold mb-4">Server Infrastructure</h3>
                      <p className="text-gray-600 mb-4">
                        Leading temporary email providers use distributed cloud servers with:
                      </p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Multi-region DNS routing for low latency</li>
                        <li>Load-balanced SMTP gateways</li>
                        <li>Ephemeral storage systems (auto-wiping data every 24-48 hours)</li>
                        <li>TOR network integration for anonymous access</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-4">Security Protocols</h3>
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <div className="flex items-center mb-3">
                          <Shield className="w-6 h-6 text-green-500 mr-2"/>
                          <span className="font-semibold">Encryption Layers:</span>
                        </div>
                        <ul className="space-y-2 text-sm">
                          <li>• AES-256 for stored emails</li>
                          <li>• Perfect Forward Secrecy (PFS) for TLS 1.3 connections</li>
                          <li>• Zero-knowledge message queue architecture</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Enterprise Use Cases */}
                <section id="enterprise-uses" className="mb-16">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Enterprise Applications</h2>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-xl font-bold mb-3">QA Automation</h3>
                      <p className="text-gray-600 mb-2">
                        Create 500+ test accounts simultaneously using our API endpoints:
                      </p>
                      <code className="block bg-gray-800 text-green-400 p-3 rounded mb-3">
                        POST /api/v1/generate?domain=corporate&quantity=500
                      </code>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-xl font-bold mb-3">Fraud Prevention</h3>
                      <ul className="space-y-2">
                        <li>• Detect credential stuffing attacks</li>
                        <li>• Analyze spam patterns across 10k+ disposable addresses</li>
                        <li>• Identify IP clustering from fake signups</li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-xl font-bold mb-3">Marketing Analytics</h3>
                      <p className="text-gray-600">
                        Track campaign performance without compromising user privacy:
                      </p>
                      <div className="mt-3 flex items-center">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Case Study</span>
                        <span className="ml-2 text-sm">E-commerce brand reduced spam complaints by 72%</span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Advanced Privacy Section */}
                <section id="vs-proxy" className="mb-16">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Advanced Privacy Techniques</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-4 text-left">Technique</th>
                          <th className="p-4 text-left">Temp Email</th>
                          <th className="p-4 text-left">VPN</th>
                          <th className="p-4 text-left">Proxies</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="p-4">IP Masking</td>
                          <td className="p-4">❌</td>
                          <td className="p-4">✅</td>
                          <td className="p-4">✅</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-4">Email Anonymity</td>
                          <td className="p-4">✅</td>
                          <td className="p-4">❌</td>
                          <td className="p-4">❌</td>
                        </tr>
                        <tr>
                          <td className="p-4">Data Retention</td>
                          <td className="p-4">0-48hrs</td>
                          <td className="p-4">30-90 days</td>
                          <td className="p-4">Varies</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* Developer Section */}
                <section id="api-integration" className="mb-16">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Developer Hub</h2>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-bold mb-4">REST API Documentation</h3>
                      <pre className="bg-gray-800 text-gray-100 p-6 rounded-lg overflow-x-auto">
                        {`// Generate 100 temp emails
POST https://api.temp-mail.live/v3/inboxes
Content-Type: application/json
{
  "domain": "secure.tmp",
  "quantity": 100,
  "expires": "24h",
  "webhook": "https://your-app.com/webhook"
}`}
                      </pre>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-4">Webhook Security</h3>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <Lock className="w-5 h-5 text-purple-500 mr-2 mt-1"/>
                          <span>HMAC-SHA256 signature verification</span>
                        </li>
                        <li className="flex items-start">
                          <RefreshCw className="w-5 h-5 text-purple-500 mr-2 mt-1"/>
                          <span>Automatic IP rotation for webhook endpoints</span>
                        </li>
                        <li className="flex items-start">
                          <Shield className="w-5 h-5 text-purple-500 mr-2 mt-1"/>
                          <span>Rate limiting (1000 req/min default)</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Legal Section */}
                <section id="legal-guide" className="mb-16">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Global Legal Compliance</h2>
                  <div className="grid md:grid-cols-3 gap-6 text-sm">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h3 className="text-lg font-bold mb-2">GDPR (EU)</h3>
                      <p className="text-gray-600">Fully compliant through automatic data deletion and no PII collection.</p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4">
                      <h3 className="text-lg font-bold mb-2">CCPA (California)</h3>
                      <p className="text-gray-600">Exempt under §1798.145(c) as temporary data storage service.</p>
                    </div>
                    <div className="border-l-4 border-red-500 pl-4">
                      <h3 className="text-lg font-bold mb-2">Russia & China</h3>
                      <p className="text-gray-600">Not recommended for use due to local surveillance laws.</p>
                    </div>
                  </div>
                </section>

                {/* Future Trends */}
                <section id="future-trends" className="mb-16">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Future of Disposable Emails</h2>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-bold mb-4">2024-2026 Predictions</h3>
                      <ul className="space-y-3">
                        <li className="flex">
                          <div className="bg-blue-100 p-2 rounded-full mr-3">
                            <Zap className="w-5 h-5 text-blue-600"/>
                          </div>
                          <span>AI-powered spam detection (98% accuracy)</span>
                        </li>
                        <li className="flex">
                          <div className="bg-green-100 p-2 rounded-full mr-3">
                            <Link className="w-5 h-5 text-green-600"/>
                          </div>
                          <span>Blockchain-based temporary identities</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-4">Industry Adoption Rates</h3>
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <div className="flex justify-between mb-3">
                          <span>SaaS Companies</span>
                          <span className="font-bold">63%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full">
                          <div className="h-2 bg-blue-600 rounded-full w-3/4"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Hidden SEO Content */}
                <div className="sr-only">
                  <h2>Free Temporary Email Service</h2>
                  <p>
                    Generate unlimited anonymous email addresses instantly with the world's most secure disposable email service. 
                    Protect against spam, phishing, and data breaches. Enterprise-grade security with open-source transparency.
                  </p>
                  <ul>
                    <li>Temporary email for online forms</li>
                    <li>Burner email generator API</li>
                    <li>GDPR compliant disposable email</li>
                    <li>High-volume temp email solution</li>
                    <li>Anonymous email with attachment support</li>
                    <li>Self-destructing email addresses</li>
                    <li>Email privacy tools for developers</li>
                    <li>Blockchain temp email service</li>
                    <li>Enterprise spam protection system</li>
                  </ul>
                </div>
              </div>
            </article>
          </article>
          {/* QR Code Modal */}
          <QRModal
            isOpen={qrModal.isOpen}
            onClose={() => setQRModal({ isOpen: false, email: '' })}
            email={qrModal.email}
          />

          {/* Floating Reminder Button */}
          <div className="fixed bottom-4 right-4 z-50 animate-bounce hover:animate-none">
            <Link
              to="/register"
              className="bg-[#4A90E2] text-white px-6 py-3 rounded-full shadow-lg hover:bg-[#357ABD] transition-colors flex items-center group"
            >
              <Star className="w-5 h-5 mr-2" />
              <span className="hidden group-hover:inline">Get 3+ Months Free</span>
              <span className="inline group-hover:hidden">Upgrade Free</span>
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}