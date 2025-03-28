import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, Tag, Share2, ThumbsUp, ExternalLink,
  Mail, Star, Award, Users, MessageCircle, BookOpen
} from 'lucide-react';
import axios from 'axios';
import { PublicLayout } from '../components/PublicLayout';
import { blogPosts as fallbackPosts } from '../data/blogPosts';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  category: string;
  meta_title: string;
  meta_description: string;
  featured_image: string;
  created_at: string;
  updated_at: string;
  author: string;
  slug: string;
  keywords?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  og_type?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;
  twitter_card?: string;
  canonical_url?: string;
  structured_data?: any;
  metaTags?: string;
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/blog/posts/${slug}`);
        
        if (response.data) {
          setPost(response.data);
          
          // Fetch related posts
          const relatedResponse = await axios.get(`${import.meta.env.VITE_API_URL}/blog/posts`);
          const filtered = relatedResponse.data
            .filter((p: BlogPost) => p.id !== response.data.id && p.category === response.data.category)
            .slice(0, 3);
          setRelatedPosts(filtered);

          // Insert server-generated meta tags into head
          if (response.data.metaTags) {
            const head = document.head;
            const metaTagsContainer = document.createElement('div');
            metaTagsContainer.innerHTML = response.data.metaTags;
            
            // Remove existing meta tags
            const existingMeta = head.querySelectorAll('meta[property], meta[name="description"], title, link[rel="canonical"], script[type="application/ld+json"]');
            existingMeta.forEach(tag => tag.remove());
            
            // Insert new meta tags
            while (metaTagsContainer.firstChild) {
              head.appendChild(metaTagsContainer.firstChild);
            }
          }
        } else {
          // Use fallback data if no post is found
          const fallbackPost = fallbackPosts.find(p => p.slug === slug);
          if (fallbackPost) {
            setPost(fallbackPost as BlogPost);
            const filtered = fallbackPosts
              .filter(p => p.id !== fallbackPost.id && p.category === fallbackPost.category)
              .slice(0, 3);
            setRelatedPosts(filtered);
          } else {
            throw new Error('Post not found');
          }
        }
      } catch (error) {
        console.error('Failed to fetch post:', error);
        setError('Failed to load blog post');
        
        // Use fallback data on error
        const fallbackPost = fallbackPosts.find(p => p.slug === slug);
        if (fallbackPost) {
          setPost(fallbackPost as BlogPost);
          const filtered = fallbackPosts
            .filter(p => p.id !== fallbackPost.id && p.category === fallbackPost.category)
            .slice(0, 3);
          setRelatedPosts(filtered);
        }
      } finally {
        setIsLoading(false);
        window.scrollTo(0, 0);
      }
    };

    if (slug) {
      fetchPost();
    }

    // Cleanup function to remove meta tags when component unmounts
    return () => {
      const head = document.head;
      const existingMeta = head.querySelectorAll('meta[property], meta[name="description"], title, link[rel="canonical"], script[type="application/ld+json"]');
      existingMeta.forEach(tag => tag.remove());
    };
  }, [slug]);

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#4A90E2] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </PublicLayout>
    );
  }

  if (error || !post) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-3xl mx-auto px-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Post Not Found
              </h1>
              <Link
                to="/blog"
                className="inline-flex items-center text-[#4A90E2] hover:text-[#357ABD]"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Link>
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <article>
            {/* Back to Blog Link */}
            <Link
              to="/blog"
              className="inline-flex items-center text-[#4A90E2] hover:text-[#357ABD] mb-8"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>

            {/* Article Header */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {post.featured_image && (
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className="w-full h-64 object-cover"
                />
              )}
              
              <div className="p-8">
                {/* Category and Date */}
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <span className="flex items-center">
                    <Tag className="w-4 h-4 mr-1" />
                    {post.category}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-4xl font-bold text-gray-900 mb-6">
                  {post.title}
                </h1>

                {/* Author */}
                <div className="flex items-center gap-3 mb-8">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(post.author)}&background=random`}
                    alt={post.author}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{post.author}</p>
                    <p className="text-sm text-gray-600">Content Creator</p>
                  </div>
                </div>

                {/* Content */}
                <div 
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Share Section */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Share this article
                  </h2>
                  <div className="flex gap-4">
                    <button
                      onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}`, '_blank')}
                      className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                      aria-label="Share on Twitter"
                    >
                      <ExternalLink className="w-5 h-5 text-gray-600" />
                    </button>
                    <button
                      onClick={() => window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(post.title)}`, '_blank')}
                      className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                      aria-label="Share on LinkedIn"
                    >
                      <Share2 className="w-5 h-5 text-gray-600" />
                    </button>
                    <button
                      onClick={() => window.open(`mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(window.location.href)}`, '_blank')}
                      className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                      aria-label="Share via Email"
                    >
                      <Mail className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Related Articles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedPosts.map((relatedPost) => (
                    <Link
                      key={relatedPost.id}
                      to={`/blog/${relatedPost.slug}`}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      {relatedPost.featured_image && (
                        <img
                          src={relatedPost.featured_image}
                          alt={relatedPost.title}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <p className="text-sm text-[#4A90E2] mb-2">{relatedPost.category}</p>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {relatedPost.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {new Date(relatedPost.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </article>
        </div>
      </div>
    </PublicLayout>
  );
}