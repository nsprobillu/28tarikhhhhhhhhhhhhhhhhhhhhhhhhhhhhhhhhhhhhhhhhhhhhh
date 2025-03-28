import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { 
  Shield, Clock, RefreshCw, Lock, Zap, Globe, Mail, Ban,
  Star, Award, Target, Heart, Users, MessageCircle, Settings,
  Database, FileText, Bell, Search, Filter, Download, Share2,
  ArrowRight, CheckCircle, Crown
} from 'lucide-react';
import { PublicLayout } from '../components/PublicLayout';
import { useInView } from 'react-intersection-observer';

export function Features() {
  // SEO Data
  const seoData = {
    title: "Advanced Temporary Email Features - Privacy Protection & Extended Validity | Boomlify",
    description: "Discover Boomlify's powerful temporary email features: 2+ month validity, unlimited addresses, advanced spam protection, and real-time notifications. Perfect for privacy and security.",
    canonical: "https://boomlify.com/features",
    schema: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Boomlify Features",
      "description": "Advanced temporary email features for privacy and security",
      "provider": {
        "@type": "Organization",
        "name": "Boomlify",
        "url": "https://boomlify.com"
      },
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    }
  };

  // Features data with animations
  const features = [
    {
      title: "Extended Email Validity",
      icon: Clock,
      description: "Keep your temporary emails active for 2+ months, perfect for long-term projects and testing.",
      benefits: [
        "2+ months validity period",
        "Automatic expiry notifications",
        "Manual validity extension",
        "Flexible duration options"
      ]
    },
    {
      title: "Advanced Privacy Protection",
      icon: Shield,
      description: "Enterprise-grade security features to keep your communications private and secure.",
      benefits: [
        "End-to-end encryption",
        "No personal data required",
        "Automatic data cleanup",
        "IP address protection"
      ]
    },
    {
      title: "Real-Time Management",
      icon: RefreshCw,
      description: "Manage all your temporary emails from one unified dashboard with real-time updates.",
      benefits: [
        "Instant notifications",
        "Live email updates",
        "Multiple inbox support",
        "Quick actions menu"
      ]
    },
    {
      title: "Spam Protection",
      icon: Ban,
      description: "Advanced filtering system keeps your temporary inbox clean and secure.",
      benefits: [
        "AI-powered spam detection",
        "Phishing protection",
        "Malware scanning",
        "Custom filter rules"
      ]
    }
  ];

  // Enterprise features
  const enterpriseFeatures = [
    {
      icon: Database,
      title: "API Access",
      description: "Integrate our service with your applications"
    },
    {
      icon: Users,
      title: "Team Management",
      description: "Collaborate with multiple team members"
    },
    {
      icon: Target,
      title: "Custom Domains",
      description: "Use your own domain for temporary emails"
    }
  ];

  // Use intersection observer for animations
  const { ref: featuresRef, inView: featuresInView } = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <PublicLayout>
      <Helmet>
        <title>{seoData.title}</title>
        <meta name="description" content={seoData.description} />
        <link rel="canonical" href={seoData.canonical} />
        
        {/* Open Graph */}
        <meta property="og:title" content={seoData.title} />
        <meta property="og:description" content={seoData.description} />
        <meta property="og:url" content={seoData.canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://boomlify.com/features-og.jpg" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoData.title} />
        <meta name="twitter:description" content={seoData.description} />
        <meta name="twitter:image" content="https://boomlify.com/features-twitter.jpg" />
        
        {/* Schema.org */}
        <script type="application/ld+json">
          {JSON.stringify(seoData.schema)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-[#4A90E2]/5 to-[#357ABD]/5">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#4A90E2] to-[#357ABD] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <div className="inline-block p-2 px-4 rounded-full bg-blue-400/20 backdrop-blur-sm mb-8 animate-bounce">
                <span className="text-sm font-medium flex items-center">
                  <Crown className="w-4 h-4 mr-2" />
                  Most Advanced Features in the Industry
                </span>
              </div>
              <h1 className="text-5xl font-bold mb-6 animate-fade-in">
                Powerful Features for Your Privacy
              </h1>
              <p className="text-xl text-white/80 max-w-3xl mx-auto mb-12 animate-fade-in-up">
                Experience the most comprehensive set of features designed to protect your privacy
                and streamline your temporary email management.
              </p>
              <div className="flex justify-center space-x-6">
                <Link
                  to="/register"
                  className="bg-white text-[#4A90E2] px-8 py-4 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center group animate-slide-in-left"
                >
                  Try All Features Free
                  <ArrowRight className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/demo"
                  className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-medium hover:bg-white/20 transition-colors animate-slide-in-right"
                >
                  View Live Demo
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main Features Grid */}
        <div ref={featuresRef} className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Industry-Leading Features
              </h2>
              <p className="text-xl text-gray-600">
                Everything you need in a temporary email service
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`bg-white rounded-xl shadow-lg p-8 transform transition-all duration-500 ${
                    featuresInView
                      ? 'translate-y-0 opacity-100'
                      : 'translate-y-10 opacity-0'
                  }`}
                  style={{ transitionDelay: `${index * 200}ms` }}
                >
                  <div className="flex items-center mb-6">
                    <div className="bg-[#4A90E2] p-3 rounded-lg">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 ml-4">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-6">
                    {feature.description}
                  </p>
                  <ul className="space-y-3">
                    {feature.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-center text-gray-700">
                        <CheckCircle className="w-5 h-5 text-[#4A90E2] mr-2" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enterprise Features */}
        <div className="bg-white py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Enterprise-Grade Solutions
              </h2>
              <p className="text-xl text-gray-600">
                Advanced features for business and enterprise users
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {enterpriseFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-xl p-8 text-center transform hover:scale-105 transition-transform"
                >
                  <div className="bg-[#4A90E2] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Feature Comparison */}
        <div className="bg-gray-50 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Compare Features
              </h2>
              <p className="text-xl text-gray-600">
                See how our features stack up against other services
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-t border-b">
                    <th className="py-4 px-6 text-left">Feature</th>
                    <th className="py-4 px-6 text-center bg-[#4A90E2]/10">Boomlify</th>
                    <th className="py-4 px-6 text-center">Others</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: "Email Validity", boomlify: "2+ Months", others: "10-60 Minutes" },
                    { feature: "Number of Addresses", boomlify: "Unlimited", others: "Limited" },
                    { feature: "Spam Protection", boomlify: "Advanced", others: "Basic" },
                    { feature: "Real-time Updates", boomlify: "Yes", others: "No" },
                    { feature: "API Access", boomlify: "Yes", others: "Limited" },
                    { feature: "Custom Domains", boomlify: "Yes", others: "No" }
                  ].map((row, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-4 px-6 font-medium">{row.feature}</td>
                      <td className="py-4 px-6 text-center bg-[#4A90E2]/10">
                        <span className="text-[#4A90E2] font-medium">{row.boomlify}</span>
                      </td>
                      <td className="py-4 px-6 text-center text-gray-600">{row.others}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-[#4A90E2] to-[#357ABD] py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to Experience These Features?
            </h2>
            <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
              Join thousands of users who trust Boomlify for their temporary email needs.
              Get started with all features completely free!
            </p>
            <div className="flex justify-center space-x-6">
              <Link
                to="/register"
                className="bg-white text-[#4A90E2] px-8 py-4 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center group"
              >
                Start Free
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