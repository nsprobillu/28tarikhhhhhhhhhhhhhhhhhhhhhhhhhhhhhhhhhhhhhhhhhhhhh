import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, Shield, Clock, Globe, CheckCircle, Zap, 
  ArrowRight, Star, Users, Award, Gift, Heart,
  BarChart3 as BarChart, // Fixed import
  Target, MessageCircle
} from 'lucide-react';
import { PublicLayout } from '../components/PublicLayout';

export function HowItWorks() {
  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-br from-[#4A90E2]/5 to-[#357ABD]/5 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h1>
            <p className="text-xl text-gray-600">
              Learn how our temporary email service helps protect your privacy
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <Mail className="w-12 h-12 text-[#4A90E2] mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Create Email
              </h3>
              <p className="text-gray-600">
                Generate a temporary email address instantly. Choose from multiple domains
                and customize your email prefix.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg">
              <Globe className="w-12 h-12 text-[#4A90E2] mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Use Anywhere
              </h3>
              <p className="text-gray-600">
                Use your temporary email for sign-ups, downloads, or any online service
                that requires email verification.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg">
              <Shield className="w-12 h-12 text-[#4A90E2] mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Stay Protected
              </h3>
              <p className="text-gray-600">
                Keep your real email private and protected from spam, phishing, and
                unwanted marketing.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Key Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-start">
                <Clock className="w-6 h-6 text-[#4A90E2] mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-900">2+ Month Validity</h3>
                  <p className="text-gray-600 text-sm">
                    Longer validity than other services
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Star className="w-6 h-6 text-[#4A90E2] mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-900">Multiple Domains</h3>
                  <p className="text-gray-600 text-sm">
                    Choose from various domain options
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Shield className="w-6 h-6 text-[#4A90E2] mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-900">Spam Protection</h3>
                  <p className="text-gray-600 text-sm">
                    Advanced filters block unwanted emails
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Zap className="w-6 h-6 text-[#4A90E2] mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-900">Instant Access</h3>
                  <p className="text-gray-600 text-sm">
                    No registration required
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Why Choose Our Service?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <Users className="w-12 h-12 text-[#4A90E2] mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  100K+ Users
                </h3>
                <p className="text-gray-600">
                  Trusted by thousands of users worldwide
                </p>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-lg">
                <Award className="w-12 h-12 text-[#4A90E2] mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Top Rated
                </h3>
                <p className="text-gray-600">
                  Highest rated temporary email service
                </p>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-lg">
                <Heart className="w-12 h-12 text-[#4A90E2] mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  User Focused
                </h3>
                <p className="text-gray-600">
                  Built with users in mind
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#4A90E2] to-[#357ABD] rounded-lg p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg mb-6">
              Create your first temporary email address now - it's free!
            </p>
            <Link
              to="/register"
              className="inline-flex items-center bg-white text-[#4A90E2] px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}