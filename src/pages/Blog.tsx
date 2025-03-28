import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Calendar, Clock, ChevronRight, Tag, Filter, 
  TrendingUp, Star, BarChart, ArrowRight, Shield,
  ThumbsUp, Share2, ExternalLink, BookOpen, Award,
  Users, Zap, Globe, Mail, Eye, MessageCircle
} from 'lucide-react';
import axios from 'axios';
import { PublicLayout } from '../components/PublicLayout';
import { Helmet } from 'react-helmet-async';
import { blogPosts as fallbackPosts } from '../data/blogPosts';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  meta_title: string;
  meta_description: string;
  featured_image: string;
  status: 'draft' | 'published';
  author: string;
  created_at: string;
  excerpt?: string;
}

export function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/blog/posts`);
      const allPosts = response.data;
      
      if (allPosts && allPosts.length > 0) {
        setPosts(allPosts);
        setFeaturedPosts(allPosts.slice(0, 3));
        setTrendingPosts(allPosts.slice(3, 7));
      } else {
        setPosts(fallbackPosts);
        setFeaturedPosts(fallbackPosts.slice(0, 3));
        setTrendingPosts(fallbackPosts.slice(3, 7));
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      setError('Failed to load blog posts');
      setPosts(fallbackPosts);
      setFeaturedPosts(fallbackPosts.slice(0, 3));
      setTrendingPosts(fallbackPosts.slice(3, 7));
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/blog/categories`);
      if (response.data && response.data.length > 0) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#4A90E2] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </PublicLayout>
    );
  }

  // Create structured data for blog list
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Boomlify Blog",
    "description": "Expert reviews and guides for digital solutions",
    "url": "https://boomlify.com/blog",
    "publisher": {
      "@type": "Organization",
      "name": "Boomlify",
      "logo": {
        "@type": "ImageObject",
        "url": "https://boomlify.com/logo.png"
      }
    },
    "blogPosts": posts.map(post => ({
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.meta_description,
      "datePublished": post.created_at,
      "author": {
        "@type": "Person",
        "name": post.author
      },
      "url": `https://boomlify.com/blog/${post.slug}`
    }))
  };

  return (
    <>
      <Helmet prioritizeSeoTags>
        <title>Expert SaaS Reviews & Digital Solutions Guide | Boomlify Blog</title>
        <meta name="description" content="Discover comprehensive SaaS reviews, comparisons, and expert insights to help you choose the perfect software solutions for your business needs." />
        <meta name="keywords" content="SaaS reviews, software comparisons, digital solutions, business software, tech reviews, expert insights" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://boomlify.com/blog" />
        <meta property="og:title" content="Expert SaaS Reviews & Digital Solutions Guide | Boomlify Blog" />
        <meta property="og:description" content="Discover comprehensive SaaS reviews, comparisons, and expert insights to help you choose the perfect software solutions for your business needs." />
        <meta property="og:image" content="https://boomlify.com/og-image.jpg" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://boomlify.com/blog" />
        <meta name="twitter:title" content="Expert SaaS Reviews & Digital Solutions Guide | Boomlify Blog" />
        <meta name="twitter:description" content="Discover comprehensive SaaS reviews, comparisons, and expert insights to help you choose the perfect software solutions for your business needs." />
        <meta name="twitter:image" content="https://boomlify.com/twitter-image.jpg" />

        {/* Additional SEO tags */}
        <link rel="canonical" href="https://boomlify.com/blog" />
        <meta name="robots" content="index, follow" />

        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <PublicLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Search and Filter Section */}
          <div className="mb-12">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-lg">
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-600" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Featured Posts Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-2">
              <Star className="h-6 w-6 text-yellow-500" />
              Featured Articles
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {featuredPosts.map(post => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="group block overflow-hidden rounded-2xl shadow-lg transition-transform hover:-translate-y-1"
                >
                  <div className="relative">
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  <div className="p-6 bg-white">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(post.created_at).toLocaleDateString()}
                      <Tag className="h-4 w-4 ml-2" />
                      {post.category}
                    </div>
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 line-clamp-2">{post.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Trending Posts Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-red-500" />
              Trending Now
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingPosts.map(post => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="group block bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <img
                    src={post.featured_image}
                    alt={post.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Clock className="h-4 w-4" />
                      {new Date(post.created_at).toLocaleDateString()}
                    </div>
                    <h3 className="font-semibold group-hover:text-blue-600 line-clamp-2">
                      {post.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* All Posts Grid */}
          <section>
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-500" />
              Latest Articles
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map(post => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="group flex flex-col bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <img
                    src={post.featured_image}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="flex-1 p-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(post.created_at).toLocaleDateString()}
                      <Tag className="h-4 w-4 ml-2" />
                      {post.category}
                    </div>
                    <h3 className="text-xl font-semibold mb-3 group-hover:text-blue-600">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4 text-gray-500" />
                          2.1k
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4 text-gray-500" />
                          15
                        </span>
                      </div>
                      <span className="flex items-center text-blue-600 font-medium">
                        Read More
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Newsletter Section */}
          <section className="mt-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white">
            <div className="max-w-3xl mx-auto text-center">
              <Mail className="h-12 w-12 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
              <p className="text-lg mb-6">
                Get the latest SaaS reviews and digital solution insights delivered straight to your inbox.
              </p>
              <form className="flex gap-4 max-w-lg mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg text-gray-900"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </section>
        </div>
      </PublicLayout>
    </>
  );
}