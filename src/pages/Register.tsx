import React, { useState, useEffect } from 'react';
import { 
  Mail, Lock, Eye, EyeOff, Shield, Clock, CheckCircle, Star, 
  Zap, Globe, Gift, Crown, Infinity, Bell, Ticket, Users,
  BarChart, Award, Target, ArrowRight, AlertTriangle
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { BackButton } from '../components/BackButton';
import { 
  isGoogleAdsUser, 
  trackGoogleAdsConversion, 
  clearGclid,
  trackRegistrationComplete 
} from '../utils/analytics';

export function Register() {
  const navigate = useNavigate();
  const register = useAuthStore(state => state.register);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    general: ''
  });
  
  // Animation frame reference for the particle effect
  const requestRef = React.useRef<number>();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);
    
    const handleChange = () => setIsReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Add exit confirmation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (formData.email || formData.password || formData.confirmPassword) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [formData]);

  // Particle animation effect
  useEffect(() => {
    if (isReducedMotion || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);
    
    // Particle class
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
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
        this.color = `rgba(74, 144, 226, ${Math.random() * 0.5 + 0.3})`;
      }
      
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Wrap around edges
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
      }
      
      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }
    
    // Create particles
    const particleCount = Math.min(window.innerWidth / 10, 100); // Reduce particles on smaller screens
    const particles: Particle[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
    
    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw and update particles
      particles.forEach(particle => {
        particle.draw();
        particle.update();
      });
      
      // Draw connections between close particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(74, 144, 226, ${0.2 * (1 - distance/100)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      
      requestRef.current = requestAnimationFrame(animate);
    };
    
    requestRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      window.removeEventListener('resize', setCanvasSize);
    };
  }, [isReducedMotion]);

  const validateForm = () => {
    const newErrors = {
      email: '',
      password: '',
      confirmPassword: '',
      general: ''
    };
    let isValid = true;

    if (!formData.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      isValid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Wait for registration to complete
      const result = await register(formData.email, formData.password);

      // Track registration completion
      trackRegistrationComplete(result.user.id);
      
      // Check if user came from Google Ads and track conversion
      if (isGoogleAdsUser()) {
        trackGoogleAdsConversion();
        clearGclid(); // Clear after successful conversion
      }
      
      // Navigate after everything is complete
      navigate('/dashboard');
    } catch (error: any) {
      setErrors(prev => ({
        ...prev,
        general: error.message || 'Registration failed. Please try again.'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle navigation attempt
  const handleNavigateAway = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (formData.email || formData.password || formData.confirmPassword) {
      const confirmLeave = window.confirm('Are you sure you want to leave? Your registration progress will be lost.');
      if (!confirmLeave) {
        e.preventDefault();
      }
    }
  };

  return (
    <div className="min-h-screen overflow-hidden relative">
      {/* Animated background */}
      {!isReducedMotion && (
        <>
          <canvas
            ref={canvasRef}
            className="absolute inset-0 z-0"
            style={{ background: 'linear-gradient(135deg, #1a365d 0%, #2a4365 50%, #2c5282 100%)' }}
          />
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-900/50 to-indigo-900/50 animate-gradient-shift"></div>
        </>
      )}
      
      {/* Static gradient background for reduced motion or fallback */}
      {isReducedMotion && (
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-900 to-indigo-900"></div>
      )}
      
      {/* Animated waves for visual interest */}
      <div className="absolute bottom-0 left-0 right-0 z-0 overflow-hidden leading-0 transform rotate-180">
        <svg className="relative block w-full h-[60px] md:h-[120px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-white/5 animate-wave1"></path>
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" className="fill-white/10 animate-wave2"></path>
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" className="fill-white/5 animate-wave3"></path>
        </svg>
      </div>

      <div className="absolute top-4 left-4 z-50">
        <Link
          to="/"
          onClick={handleNavigateAway}
          className="inline-flex items-center text-white hover:text-white/80"
        >
          <ArrowRight className="w-5 h-5 mr-2 rotate-180" />
          Back to Home
        </Link>
      </div>

      {/* Content */}
      <div className="min-h-screen flex flex-col z-10 relative">
        {/* Attention-Grabbing Banner */}
        <div className="bg-gradient-to-r from-red-600 to-red-500 text-white py-3 px-4 text-center shadow-xl">
          <p className="text-lg font-bold animate-pulse flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Don't Risk Losing Important Emails! Register Now for Permanent Access
            <AlertTriangle className="w-5 h-5 ml-2" />
          </p>
        </div>

        <div className="container mx-auto px-4 py-8 flex-1 flex items-center justify-center">
          <div className="max-w-6xl mx-auto w-full">
            <div className="md:flex gap-8 items-center">
              {/* Left side: Benefits */}
              <div className="md:w-1/2 mb-8 md:mb-0 text-white">
                <div className="mb-8">
                  <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white drop-shadow-lg">
                    <span className="text-yellow-300">Keep Your Emails</span> For Months, Not Hours
                  </h1>
                  <p className="text-xl text-white/90 mb-8">
                    Join thousands of smart users who protect their privacy with our long-term temporary email service.
                  </p>
                </div>

                {/* Comparison Table */}
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 mb-8">
                  <h2 className="text-2xl font-bold mb-4 text-center">Why Register?</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-red-900/20 backdrop-blur p-4 rounded-lg border border-red-500/30">
                      <h3 className="font-bold flex items-center mb-3 text-red-200">
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        Without Registration
                      </h3>
                      <ul className="space-y-3">
                        <li className="flex items-center text-red-100">
                          <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>Emails expire in 48 hours</span>
                        </li>
                        <li className="flex items-center text-red-100">
                          <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>Limited email addresses</span>
                        </li>
                        <li className="flex items-center text-red-100">
                          <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>Risk of losing important emails</span>
                        </li>
                        <li className="flex items-center text-red-100">
                          <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>Verification codes expire before use</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-green-900/20 backdrop-blur p-4 rounded-lg border border-green-500/30">
                      <h3 className="font-bold flex items-center mb-3 text-green-200">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        With Free Registration
                      </h3>
                      <ul className="space-y-3">
                        <li className="flex items-center text-green-100">
                          <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>Keep emails for 3+ months</span>
                        </li>
                        <li className="flex items-center text-green-100">
                          <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>Unlimited email addresses</span>
                        </li>
                        <li className="flex items-center text-green-100">
                          <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>Never lose important emails</span>
                        </li>
                        <li className="flex items-center text-green-100">
                          <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>Easy account management</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Testimonial Section */}
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      SR
                    </div>
                    <div>
                      <p className="italic text-white/90 mb-2">
                        "This service is a game-changer! I've tried countless temporary email services, but this is the first one that lets me keep my emails for months. Absolutely essential!"
                      </p>
                      <p className="font-bold text-yellow-300">Sarah R.</p>
                      <div className="flex mt-1">
                        <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                        <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                        <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                        <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                        <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right side: Registration Form */}
              <div className="md:w-1/2">
                <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 shadow-2xl transform transition-all hover:scale-[1.01]">
                  <div className="text-center mb-6">
                    <div className="inline-block p-3 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 mb-4">
                      <Mail className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Create Your Account</h2>
                    <p className="text-blue-200">Free forever - no credit card required</p>
                    
                    {/* Pro Label Animation */}
                    <div className="relative mt-2 mb-6">
                      <div className="absolute -top-4 -right-4 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black font-bold py-1 px-4 rounded-full animate-bounce shadow-lg">
                        <span className="flex items-center">
                          <Crown className="w-4 h-4 mr-1" /> PRO
                        </span>
                      </div>
                    </div>
                  </div>

                  {errors.general && (
                    <div className="mb-6 bg-red-500/20 border border-red-400 rounded-lg p-4 backdrop-blur-sm">
                      <p className="text-red-200 flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
                        {errors.general}
                      </p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-blue-200 mb-2 flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className={`w-full h-12 pl-4 pr-10 rounded-lg border-2 ${
                            errors.email 
                              ? 'border-red-400 bg-red-50/10' 
                              : 'border-blue-300/30 bg-white/10'
                          } focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all backdrop-blur-sm placeholder-blue-200/50 text-white`}
                          placeholder="your@email.com"
                          disabled={isLoading}
                        />
                        <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
                      </div>
                      {errors.email && (
                        <p className="mt-2 text-sm text-red-300 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-1 flex-shrink-0" />
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-blue-200 mb-2 flex items-center">
                        <Lock className="w-4 h-4 mr-2" />
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className={`w-full h-12 pl-4 pr-10 rounded-lg border-2 ${
                            errors.password 
                              ? 'border-red-400 bg-red-50/10' 
                              : 'border-blue-300/30 bg-white/10'
                          } focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all backdrop-blur-sm placeholder-blue-200/50 text-white`}
                          placeholder="Create a secure password"
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300 hover:text-white transition-colors"
                          disabled={isLoading}
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="mt-2 text-sm text-red-300 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-1 flex-shrink-0" />
                          {errors.password}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-blue-200 mb-2 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          className={`w-full h-12 pl-4 pr-10 rounded-lg border-2 ${
                            errors.confirmPassword 
                              ? 'border-red-400 bg-red-50/10' 
                              : 'border-blue-300/30 bg-white/10'
                          } focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all backdrop-blur-sm placeholder-blue-200/50 text-white`}
                          placeholder="Confirm your password"
                          disabled={isLoading}
                        />
                        <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
                      </div>
                      {errors.confirmPassword && (
                        <p className="mt-2 text-sm text-red-300 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-1 flex-shrink-0" />
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>

                    {/* Promo Code Field */}
                    <div>
                      <label className="block text-sm font-medium text-blue-200 mb-2 flex items-center">
                        <Ticket className="w-4 h-4 mr-2" />
                        Have a Promo Code? (Optional)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                          className="w-full h-12 pl-4 pr-10 rounded-lg border-2 border-blue-300/30 bg-white/10 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all backdrop-blur-sm placeholder-blue-200/50 text-white"
                          placeholder="Enter promo code"
                          disabled={isLoading}
                        />
                        <Ticket className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-14 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-bold text-lg shadow-lg hover:translate-y-[-2px] hover:shadow-xl focus:ring-4 focus:ring-green-500/50 transition-all duration-300 flex items-center justify-center"
                    >
                      {isLoading ? (
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <Zap className="w-5 h-5 mr-2" />
                          Create Free Account
                        </>
                      )}
                    </button>

                    {/* Sign In Link */}
                    <div className="text-center mt-6">
                      <p className="text-blue-200 mb-3">
                        Already have an account?
                      </p>
                      <Link
                        to="/login"
                        onClick={handleNavigateAway}
                        className="inline-flex items-center justify-center px-6 py-3 border border-blue-300/30 backdrop-blur-sm text-blue-100 rounded-lg hover:bg-blue-700/30 transition-colors"
                      >
                        <span>Sign In Now</span>
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Link>
                    </div>
                  </form>

                  {/* Trust Signals */}
                  <div className="mt-8 grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center text-blue-200">
                      <Shield className="w-5 h-5 mr-2 text-green-400" />
                      <span>Secure & Encrypted</span>
                    </div>
                    <div className="flex items-center text-blue-200">
                      <Lock className="w-5 h-5 mr-2 text-green-400" />
                      <span>Privacy Protected</span>
                    </div>
                    <div className="flex items-center text-blue-200">
                      <Clock className="w-5 h-5 mr-2 text-green-400" />
                      <span>3+ Month Validity</span>
                    </div>
                    <div className="flex items-center text-blue-200">
                      <Users className="w-5 h-5 mr-2 text-green-400" />
                      <span>100K+ Active Users</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add CSS for animations */}
      <style jsx="true">{`
        .animate-gradient-shift {
          background-size: 400% 400%;
          animation: gradient 15s ease infinite;
        }
        
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .animate-wave1 {
          animation: wave 25s cubic-bezier(0.36, 0.45, 0.63, 0.53) infinite;
          transform-origin: center bottom;
        }
        
        .animate-wave2 {
          animation: wave 20s cubic-bezier(0.36, 0.45, 0.63, 0.53) -.5s infinite;
          transform-origin: center bottom;
        }
        
        .animate-wave3 {
          animation: wave 15s cubic-bezier(0.36, 0.45, 0.63, 0.53) -1s infinite;
          transform-origin: center bottom;
        }
        
        @keyframes wave {
          0% { transform: translateX(-1%) translateZ(0) scaleY(1.2); }
          50% { transform: translateX(1%) translateZ(0) scaleY(1); }
          100% { transform: translateX(-1%) translateZ(0) scaleY(1.2); }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .animate-gradient-shift,
          .animate-wave1,
          .animate-wave2,
          .animate-wave3 {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}