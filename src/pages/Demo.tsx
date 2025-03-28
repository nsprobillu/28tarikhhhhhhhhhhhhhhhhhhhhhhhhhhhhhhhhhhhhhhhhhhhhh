import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { PublicLayout } from '../components/PublicLayout';
import { 
  Mail, Shield, Clock, Globe, CheckCircle, Zap, RefreshCw, Copy,
  Loader, Inbox, Trash2, Archive, Star, QrCode, Filter, Search,
  Download, Share2, Bell, Settings, Eye, EyeOff, Link as LinkIcon,
  AlertTriangle, X, ChevronDown, ChevronUp, ExternalLink, ArrowRight,
  Users, Target, Award, Heart, Crown, Smartphone, Laptop, Server,
  Cloud, Database, Lock, Key, FileText, MessageCircle, BarChart,
  PieChart, TrendingUp, Layers, Briefcase, Code  // Add these two
} from 'lucide-react';


// Demo data with professional examples
const DEMO_DOMAINS = ['@tempmail.pro', '@securetemp.com', '@privacymail.org'];

const DEMO_EMAILS = [
  {
    id: 'demo1',
    address: 'business.demo@tempmail.pro',
    expires: '5/10/2025',
    messages: [
      {
        id: 1,
        subject: "Welcome to Professional Suite",
        from: "welcome@demo-service.com",
        time: "Just now",
        content: "Thank you for choosing our professional services. Here's what you need to know to get started..."
      }
    ]
  },
  {
    id: 'demo2',
    address: 'project.test@securetemp.com',
    expires: '5/10/2025',
    messages: [
      {
        id: 2,
        subject: "Project Collaboration Invite",
        from: "team@demo-project.com",
        time: "2 min ago",
        content: "You've been invited to collaborate on the new project..."
      }
    ]
  },
  {
    id: 'demo3',
    address: 'newsletter@privacymail.org',
    expires: '5/10/2025',
    messages: [
      {
        id: 3,
        subject: "Newsletter Subscription Confirmed",
        from: "news@demo-letter.com",
        time: "5 min ago",
        content: "Your subscription to our newsletter has been confirmed..."
      }
    ]
  }
];

// Features data
const FEATURES = [
  {
    icon: Lock,
    title: "Privacy Protection",
    description: "Keep your real email private and secure from spam and tracking",
    benefits: [
      "No personal information required",
      "End-to-end encryption",
      "Automatic data cleanup"
    ]
  },
  {
    icon: Zap,
    title: "Instant Access",
    description: "Create and manage temporary emails instantly without registration",
    benefits: [
      "No signup needed",
      "Multiple domains available",
      "Instant email generation"
    ]
  },
  {
    icon: Clock,
    title: "Extended Validity",
    description: "Emails valid for up to 2+ months with option to extend",
    benefits: [
      "Longer validity period",
      "Automatic expiry notifications",
      "Manual validity extension"
    ]
  },
  {
    icon: Shield,
    title: "Advanced Security",
    description: "Enterprise-grade security features to protect your communications",
    benefits: [
      "Spam protection",
      "Phishing detection",
      "Malware scanning"
    ]
  }
];

// Use cases data
const USE_CASES = [
  {
    icon: Users,
    title: "For Individuals",
    cases: [
      "Online shopping and subscriptions",
      "Social media accounts",
      "Newsletter signups",
      "Forum registrations"
    ]
  },
  {
    icon: Briefcase,
    title: "For Businesses",
    cases: [
      "Testing email workflows",
      "Client communication",
      "Market research",
      "Service verification"
    ]
  },
  {
    icon: Code,
    title: "For Developers",
    cases: [
      "API testing",
      "Development environments",
      "QA testing",
      "Integration testing"
    ]
  }
];

export function Demo() {
  // Animation and demo state
  const [animationStep, setAnimationStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showFeature, setShowFeature] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Demo interface state
  const [selectedDomain, setSelectedDomain] = useState(DEMO_DOMAINS[0]);
  const [customPrefix, setCustomPrefix] = useState('');
  const [tempEmails, setTempEmails] = useState<typeof DEMO_EMAILS>([]);
  const [selectedEmail, setSelectedEmail] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showTutorial, setShowTutorial] = useState(true);

  // Tutorial steps
  const tutorialSteps = [
    {
      title: "Create Your Email",
      description: "Choose a custom prefix and domain for your temporary email address",
      target: ".email-creation"
    },
    {
      title: "Manage Multiple Emails",
      description: "Create and manage multiple email addresses from one dashboard",
      target: ".email-list"
    },
    {
      title: "Real-Time Updates",
      description: "Receive and view emails in real-time with auto-refresh",
      target: ".email-view"
    },
    {
      title: "Advanced Features",
      description: "Use search, filters, and organization tools to manage your inbox",
      target: ".advanced-features"
    }
  ];

  // Particle animation effect
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        this.color = `rgba(74, 144, 226, ${Math.random() * 0.5 + 0.3})`;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    const particles: Particle[] = [];
    for (let i = 0; i < 50; i++) {
      particles.push(new Particle());
    }

    let animationFrameId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      // Draw connections
      particles.forEach((a, i) => {
        particles.forEach((b, j) => {
          if (i < j) {
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) {
              ctx.beginPath();
              ctx.strokeStyle = `rgba(74, 144, 226, ${0.2 * (1 - distance/100)})`;
              ctx.lineWidth = 1;
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }
        });
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Demo animation sequence
  useEffect(() => {
    if (!isPlaying) return;

    const demoSequence = [
      // Step 1: Create first email
      () => {
        setCustomPrefix('demo.account');
        setTimeout(() => {
          setTempEmails([DEMO_EMAILS[0]]);
        }, 1000);
      },
      // Step 2: Show multiple emails
      () => {
        setTempEmails(DEMO_EMAILS.slice(0, 2));
      },
      // Step 3: Demonstrate search
      () => {
        setSearchTerm('project');
      },
      // Step 4: Show email selection
      () => {
        setSelectedEmail(DEMO_EMAILS[1]);
      },
      // Step 5: Show filters
      () => {
        setShowFilters(true);
      },
      // Step 6: Reset demo
      () => {
        setCustomPrefix('');
        setTempEmails([]);
        setSelectedEmail(null);
        setSearchTerm('');
        setShowFilters(false);
        setAnimationStep(0);
      }
    ];

    const interval = setInterval(() => {
      if (animationStep < demoSequence.length) {
        demoSequence[animationStep]();
        setAnimationStep(prev => prev + 1);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [animationStep, isPlaying]);

  return (
    <PublicLayout>
      {/* Background canvas for particle effect */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ background: 'linear-gradient(135deg, #1a365d 0%, #2a4365 100%)' }}
      />

      <div className="relative z-10">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#4A90E2] to-[#357ABD] text-white relative overflow-hidden min-h-screen flex items-center">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 relative">
            <div className="text-center">
              <div className="inline-block p-2 px-4 rounded-full bg-blue-400/20 backdrop-blur-sm mb-8 animate-bounce">
                <span className="text-sm font-medium flex items-center">
                  <Crown className="w-4 h-4 mr-2" />
                  #1 Temporary Email Service
                </span>
              </div>
              <h1 className="text-6xl font-bold mb-8 leading-tight animate-fade-in">
                Your Complete Temporary<br />Email Management Suite
              </h1>
              <p className="text-xl text-white/80 max-w-3xl mx-auto mb-12 animate-fade-in-up">
                Experience the power of our advanced temporary email system with instant creation,
                real-time monitoring, and comprehensive management - all in one place.
              </p>
              <div className="flex justify-center space-x-6">
                <Link
                  to="/register"
                  className="bg-white text-[#4A90E2] px-8 py-4 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center group animate-slide-in-left"
                >
                  Start Free
                  <ArrowRight className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
                </Link>
                <button
                  onClick={() => setShowTutorial(true)}
                  className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-medium hover:bg-white/20 transition-colors flex items-center animate-slide-in-right"
                >
                  Watch Demo
                  <Play className="w-5 h-5 ml-2" />
                </button>
              </div>
            </div>
          </div>

          {/* Animated Feature Cards */}
          <div className="absolute bottom-0 left-0 right-0 overflow-hidden h-32">
            <div className="flex animate-scroll-left">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex space-x-8 mx-8">
                  {FEATURES.map((feature, index) => (
                    <div
                      key={index}
                      className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-center space-x-4 min-w-[300px]"
                    >
                      <feature.icon className="w-8 h-8 text-white/80" />
                      <div>
                        <h3 className="font-medium">{feature.title}</h3>
                        <p className="text-sm text-white/60">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="bg-white py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                How It Works
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Get started with our temporary email service in three simple steps
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                {
                  step: 1,
                  title: "Create Email",
                  description: "Choose a custom prefix or generate a random one",
                  icon: Mail,
                  animation: "fade-in-up"
                },
                {
                  step: 2,
                  title: "Receive Messages",
                  description: "Get instant notifications for new emails",
                  icon: Inbox,
                  animation: "fade-in-up delay-100"
                },
                {
                  step: 3,
                  title: "Manage Everything",
                  description: "Organize and manage all your temporary emails",
                  icon: Settings,
                  animation: "fade-in-up delay-200"
                }
              ].map((item, index) => (
                <div
                  key={index}
                  className={`text-center animate-${item.animation}`}
                >
                  <div className="relative">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <item.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                      {index < 2 && (
                        <ArrowRight className="w-8 h-8 text-gray-300 hidden md:block" />
                      )}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="bg-gray-50 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Powerful Features
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Everything you need to manage temporary emails efficiently
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {FEATURES.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-lg p-8 transform hover:scale-105 transition-transform"
                >
                  <div className="bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {feature.description}
                  </p>
                  <ul className="space-y-3">
                    {feature.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-center text-gray-700">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Interactive Demo Section */}
        <div className="bg-white py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                See It In Action
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Experience our powerful features through this interactive demo
              </p>
            </div>

            {/* Demo Interface */}
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
              {/* Demo Header */}
              <div className="border-b border-gray-200 p-4 bg-gray-50 flex items-center justify-between">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Demo Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Email List */}
                  <div className="lg:col-span-1">
                    <div className="mb-6">
                      <div className="flex items-center space-x-4">
                        <input
                          type="text"
                          value={customPrefix}
                          onChange={(e) => setCustomPrefix(e.target.value)}
                          placeholder="Enter email prefix"
                          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <select
                          value={selectedDomain}
                          onChange={(e) => setSelectedDomain(e.target.value)}
                          className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {DEMO_DOMAINS.map(domain => (
                            <option key={domain} value={domain}>{domain}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {tempEmails.map((email) => (
                        <div
                          key={email.id}
                          onClick={() => setSelectedEmail(email)}
                          className={`p-4 rounded-lg border transition-all cursor-pointer ${
                            selectedEmail?.id === email.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-sm truncate">{email.address}</span>
                            <CopyButton text={email.address} />
                          </div>
                          <div className="text-xs text-gray-500 flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>Expires {email.expires}</span>
                          </div>
                          {email.messages?.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <div className="text-sm text-gray-600 truncate">
                                {email.messages[0].subject}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Email Content */}
                  <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200">
                    {selectedEmail ? (
                      <div className="p-6">
                        <div className="mb-6 pb-6 border-b border-gray-200">
                          <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            {selectedEmail.address}
                          </h2>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>Expires {selectedEmail.expires}</span>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {selectedEmail.messages?.map((message: any) => (
                            <div key={message.id} className="p-4 bg-gray-50 rounded-lg">
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="font-medium text-gray-900">{message.subject}</h3>
                                <span className="text-xs text-gray-500">{message.time}</span>
                              </div>
                              <p className="text-sm text-gray-600">{message.from}</p>
                              <p className="mt-2 text-gray-700">{message.content}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="h-64 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>Select an email to view its contents</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="bg-gray-50 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Perfect for Every Need
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Discover how our temporary email service can help you
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {USE_CASES.map((useCase, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-lg p-8 transform hover:scale-105 transition-transform"
                >
                  <div className="bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                    <useCase.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {useCase.title}
                  </h3>
                  <ul className="space-y-3">
                    {useCase.cases.map((item, i) => (
                      <li key={i} className="flex items-center text-gray-700">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tutorial Overlay */}
        {showTutorial && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-8 max-w-2xl mx-4">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Quick Tour
                </h3>
                <p className="text-gray-600">
                  Let's walk through the main features of our service
                </p>
              </div>

              <div className="space-y-6">
                {tutorialSteps.map((step, index) => (
                  <div
                    key={index}
                    className={`flex items-start space-x-4 ${
                      currentStep === index + 1 ? 'opacity-100' : 'opacity-50'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{step.title}</h4>
                      <p className="text-gray-600">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                  disabled={currentStep === 1}
                >
                  Previous
                </button>
                {currentStep < tutorialSteps.length ? (
                  <button
                    onClick={() => setCurrentStep(prev => prev + 1)}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={() => setShowTutorial(false)}
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Get Started
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-[#4A90E2] to-[#357ABD] py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-white/80 mb-12 max-w-3xl mx-auto">
              Join thousands of satisfied users who trust our service for their
              temporary email needs. Get started for free today!
            </p>
            <div className="flex justify-center space-x-6">
              <Link
                to="/register"
                className="bg-white text-[#4A90E2] px-8 py-4 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center group"
              >
                Create Free Account
                <ArrowRight className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/pricing"
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-medium hover:bg-white/10 transition-colors"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
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
      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
       title={copied ? 'Copied!' : 'Copy to clipboard'}
    >
      {copied ? (
        <CheckCircle className="w-4 h-4 text-green-500" />
      ) : (
        <Copy className="w-4 h-4 text-gray-500" />
      )}
    </button>
  );
}

function Pause(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="4" height="16" x="6" y="4" />
      <rect width="4" height="16" x="14" y="4" />
    </svg>
  );
}

function Play(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}