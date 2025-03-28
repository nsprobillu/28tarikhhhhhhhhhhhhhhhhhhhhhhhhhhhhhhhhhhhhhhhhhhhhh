import React from 'react';
import { Check, Star, Shield, Clock, Zap, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PublicLayout } from '../components/PublicLayout';

export function Pricing() {
  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-br from-[#4A90E2]/5 to-[#357ABD]/5 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the perfect plan for your needs. No hidden fees, cancel anytime.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-2xl shadow-lg p-8 relative">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Free</h2>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-gray-500">/forever</span>
                </div>
                <p className="text-gray-500 mt-2">Perfect for getting started</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>48-hour email validity</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>Basic spam protection</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>10 active email addresses</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>Standard support</span>
                </li>
              </ul>

              <Link
                to="/register"
                className="block w-full text-center bg-gray-100 text-gray-800 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Get Started Free
              </Link>
            </div>

            {/* Monthly Plan */}
            <div className="bg-white rounded-2xl shadow-lg p-8 relative">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Monthly</h2>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$4.99</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <p className="text-gray-500 mt-2">For regular users</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>3-month email validity and you can increase it</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>Advanced spam protection</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>Custom domains</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>unlimited active email addresses</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>API access</span>
                </li>
              </ul>

              <Link
                to="/register"
                className="block w-full text-center bg-[#4A90E2] text-white py-3 rounded-lg hover:bg-[#357ABD] transition-colors font-medium"
              >
                Get Started Monthly
              </Link>
            </div>

            {/* Yearly Plan */}
            <div className="bg-[#4A90E2] rounded-2xl shadow-lg p-8 transform scale-105 relative">
              <div className="absolute top-0 right-0 -translate-y-1/2 bg-yellow-400 text-gray-900 px-4 py-1 rounded-full font-medium text-sm">
                Save 20%
              </div>
              
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white">Yearly</h2>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-white">$47.88</span>
                  <span className="text-white/80">/year</span>
                </div>
                <p className="text-white/80 mt-2">Best value</p>
              </div>

              <ul className="space-y-4 mb-8 text-white">
                <li className="flex items-center">
                  <Check className="w-5 h-5 mr-3" />
                  <span>3-month email validity</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 mr-3" />
                  <span>Advanced spam protection</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 mr-3" />
                  <span>Unlimited email addresses</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 mr-3" />
                  <span>24/7 Priority support</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 mr-3" />
                  <span>Advanced API access</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 mr-3" />
                  <span>Custom domains</span>
                </li>
              </ul>

              <Link
                to="/register"
                className="block w-full text-center bg-white text-[#4A90E2] py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Get Started Yearly
              </Link>
            </div>
          </div>

          {/* Features Comparison */}
          <div className="mt-24">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">
              Compare Features
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-t border-b">
                    <th className="py-4 px-6 text-left">Feature</th>
                    <th className="py-4 px-6 text-center">Free</th>
                    <th className="py-4 px-6 text-center">Monthly</th>
                    <th className="py-4 px-6 text-center bg-[#4A90E2]/10">Yearly</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: "Email Validity", free: "48 hours", monthly: "3 months", yearly: "3 months" },
                    { feature: "Active Addresses", free: "5", monthly: "Unlimited", yearly: "Unlimited" },
                    { feature: "Spam Protection", free: "Basic", monthly: "Advanced", yearly: "Advanced" },
                    { feature: "Custom Domains", free: "❌", monthly: "✅", yearly: "✅" },
                    { feature: "API Access", free: "❌", monthly: "Basic", yearly: "Advanced" },
                    { feature: "Support", free: "Standard", monthly: "Priority", yearly: "24/7 Priority" },
                    { feature: "Analytics", free: "Basic", monthly: "Advanced", yearly: "Advanced+" }
                  ].map((row, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-4 px-6 font-medium">{row.feature}</td>
                      <td className="py-4 px-6 text-center">{row.free}</td>
                      <td className="py-4 px-6 text-center">{row.monthly}</td>
                      <td className="py-4 px-6 text-center bg-[#4A90E2]/10">{row.yearly}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-24">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">
              Frequently Asked Questions
            </h2>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[
                {
                  q: "Can I switch between plans?",
                  a: "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle."
                },
                {
                  q: "Do you offer refunds?",
                  a: "Yes, we offer a 14-day money-back guarantee if you're not satisfied with our service."
                },
                {
                  q: "What payment methods do you accept?",
                  a: "We accept all major credit cards, PayPal, and cryptocurrency."
                },
                {
                  q: "Is there a contract or commitment?",
                  a: "No, all plans are subscription-based with no long-term commitment required. Cancel anytime."
                }
              ].map((faq, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="font-bold text-gray-900 mb-2">{faq.q}</h3>
                  <p className="text-gray-600">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
