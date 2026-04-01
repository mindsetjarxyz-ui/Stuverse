import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, MessageSquare, FileText, CheckSquare, Calendar, Zap, ArrowRight, BrainCircuit, Shield, Sparkles, Star, X, Mail, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export function Landing() {
  const { user, signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      if (isSignUp) {
        const data = await signUp(email, password, name);
        if (!data.session) {
          setMessage("Check your email and confirm your account before logging in.");
        } else {
          navigate('/');
        }
      } else {
        await signIn(email, password);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginClick = (signUp = false) => {
    if (user) {
      navigate('/dashboard');
    } else {
      setIsSignUp(signUp);
      setShowAuthModal(true);
    }
  };

  const handleProUpgrade = () => {
    if (user) {
      navigate('/pricing');
    } else {
      setShowAuthModal(true);
    }
  };

  const handlePlusUpgrade = () => {
    if (user) {
      navigate('/pricing');
    } else {
      setShowAuthModal(true);
    }
  };

  const features = [
    {
      icon: MessageSquare,
      title: 'Study Buddy',
      desc: 'Chat with AI, upload PDFs or images for instant answers and explanations.',
      color: 'text-indigo-400',
      bg: 'bg-indigo-400/10',
      border: 'border-indigo-400/20'
    },
    {
      icon: FileText,
      title: 'Summarizer',
      desc: 'Condense long texts or PDFs into clear, structured, and easy-to-read notes.',
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
      border: 'border-emerald-400/20'
    },
    {
      icon: CheckSquare,
      title: 'Quizverse',
      desc: 'Generate multiple-choice quizzes to test your knowledge and track progress.',
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
      border: 'border-amber-400/20'
    },
    {
      icon: Calendar,
      title: 'Study Planner',
      desc: 'Create personalized study schedules based on your goals and deadlines.',
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
      border: 'border-purple-400/20'
    },
    {
      icon: BrainCircuit,
      title: 'AI Note-Taker',
      desc: 'Automatically transcribe lectures and convert them into structured academic notes.',
      color: 'text-rose-400',
      bg: 'bg-rose-400/10',
      border: 'border-rose-400/20'
    },
    {
      icon: Sparkles,
      title: 'Multi-Language',
      desc: 'Generate content in English, Bengali, Hindi, and more to suit your needs.',
      color: 'text-cyan-400',
      bg: 'bg-cyan-400/10',
      border: 'border-cyan-400/20'
    }
  ];

  const pricing = [
    {
      name: 'Free',
      credits: '80 Credits / Day',
      price: '0',
      features: [
        'Basic AI Chat & Support',
        'Standard PDF Summaries',
        'Up to 15 Quiz Questions',
        'Basic Study Planner',
        'Community Access'
      ],
      button: 'Get Started Free',
      action: () => handleLoginClick(true),
      popular: false
    },
    {
      name: 'Studygen Pro',
      credits: '200 Credits / Day (6200/mo)',
      price: '0.99',
      period: '/mo',
      features: [
        'Advanced AI Models',
        'Priority Fast Generation',
        'Deep Multi-file Summaries',
        'AI Note-Taker Access',
        'Multi-Language Support',
        'Exclusive Beta Features'
      ],
      button: 'Upgrade to Pro',
      action: handleProUpgrade,
      popular: true,
      tag: 'Best Selling'
    },
    {
      name: 'Studygen Plus',
      credits: '500 Credits / Day (15000/mo)',
      price: '2.99',
      period: '/mo',
      features: [
        'Highest Priority Processing',
        'Unlimited Deep Analysis',
        'Advanced Study Analytics',
        'Early Access to New Tools',
        'Premium Support',
        'Custom Study Templates'
      ],
      button: 'Upgrade to Plus',
      action: handlePlusUpgrade,
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-bg-primary text-gray-200 font-sans selection:bg-white/20 overflow-x-hidden">
      {/* Navbar */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className="fixed top-0 left-0 right-0 z-50 bg-bg-primary/80 backdrop-blur-xl border-b border-border-glass"
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-border-glass">
              <BookOpen className="w-6 h-6 text-gray-200" />
            </div>
            <span className="text-2xl font-heading font-bold tracking-tight text-white">Studygen AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <a href="#home" className="hover:text-white transition-colors">Home</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Link to="/dashboard" className="px-5 py-2.5 glass-pill text-white text-sm font-semibold hover:text-white transition-colors">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <button onClick={() => handleLoginClick(false)} className="hidden md:block text-sm font-medium text-gray-300 hover:text-white transition-colors">
                  Login
                </button>
                <button onClick={() => handleLoginClick(true)} className="px-5 py-2.5 glass-pill text-white text-sm font-semibold hover:text-white transition-colors">
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Auth Modal */}
      <AnimatePresence mode="wait">
        {showAuthModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg glass-panel p-8 sm:p-12 overflow-hidden shadow-[0_0_100px_rgba(255,255,255,0.05)]"
            >
              <button 
                onClick={() => setShowAuthModal(false)}
                className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white transition-all hover:rotate-90"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center mb-10">
                <motion.div 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 mx-auto mb-6 shadow-inner"
                >
                  <BookOpen className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-3xl font-heading font-bold text-white tracking-tight">
                  {isSignUp ? 'Create your account' : 'Welcome back'}
                </h3>
                <p className="text-gray-400 mt-3 text-lg">
                  {isSignUp ? 'Join the community of elite learners' : 'Continue your journey to academic excellence'}
                </p>
              </div>

              <form onSubmit={handleAuth} className="space-y-6">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                  >
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p>{error}</p>
                  </motion.div>
                )}

                {message && (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm"
                  >
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <p>{message}</p>
                  </motion.div>
                )}

                {isSignUp && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Name</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-white transition-colors" />
                      <input 
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your Name"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:bg-white/10 transition-all text-lg"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-white transition-colors" />
                    <input 
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:bg-white/10 transition-all text-lg"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Password</label>
                    {!isSignUp && (
                      <button 
                        type="button"
                        className="text-xs font-medium text-gray-500 hover:text-white transition-colors"
                        onClick={() => alert('Password reset feature coming soon!')}
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-white transition-colors" />
                    <input 
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:bg-white/10 transition-all text-lg"
                    />
                  </div>
                </div>

                <button 
                  disabled={loading}
                  className="w-full py-5 bg-white text-black rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-8 shadow-[0_0_30px_rgba(255,255,255,0.1)] active:scale-[0.98]"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-3 border-black/20 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      {isSignUp ? 'Get Started' : 'Sign In'}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              <div className="relative my-10">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-widest">
                  <span className="bg-[#0B0B0C] px-4 text-gray-500 font-bold">Or continue with</span>
                </div>
              </div>

              <button 
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold flex items-center justify-center gap-4 hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google Account
              </button>

              <div className="mt-10 text-center">
                <p className="text-gray-400 font-medium">
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <button 
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-white font-bold hover:underline underline-offset-4"
                  >
                    {isSignUp ? 'Sign In' : 'Join Studygen AI'}
                  </button>
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section id="home" className="relative pt-40 pb-20 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/5 via-bg-primary to-bg-primary -z-10" />
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-glass border border-border-glass text-sm text-gray-300 mb-8"
          >
            <Sparkles className="w-4 h-4 text-gray-400" />
            <span>Introducing Studygen AI 2.0</span>
          </motion.div>
          <motion.h1 
            {...fadeIn}
            className="text-5xl md:text-7xl font-heading font-bold tracking-tight text-white mb-8 leading-tight"
          >
            Master Your Studies with <br className="hidden md:block" />
            <span className="text-gradient">
              AI-Powered Precision
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Studygen AI is your ultimate AI companion. Summarize notes, generate quizzes, chat with your study materials, and plan your success effortlessly.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button onClick={() => handleLoginClick(true)} className="w-full sm:w-auto px-8 py-4 glass-pill text-white font-semibold flex items-center justify-center gap-2">
              Get Started Free <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setShowDemoModal(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-transparent text-white font-semibold hover:bg-glass transition-colors border border-border-glass flex items-center justify-center gap-2"
            >
              Watch Demo
            </button>
          </motion.div>
        </div>
      </section>

      {/* Trusted By */}
      <section className="py-10 border-y border-border-glass bg-bg-secondary/30">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-medium text-gray-500 mb-6 uppercase tracking-widest">Trusted by students from</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale">
            {['Harvard', 'MIT', 'Stanford', 'Oxford', 'Cambridge'].map((uni, i) => (
              <motion.div 
                key={uni}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-xl font-heading font-bold text-gray-400"
              >
                {uni}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-heading font-bold text-white mb-6"
            >
              Our Services
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-gray-400 text-lg max-w-2xl mx-auto"
            >
              Everything you need to excel in your academics, powered by cutting-edge artificial intelligence.
            </motion.p>
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {features.map((feature, i) => (
              <motion.div key={i} variants={fadeIn}>
                <div className="group p-8 glass-panel hover:bg-glass-hover transition-all duration-300 relative overflow-hidden">
                  <div className={`absolute -right-20 -top-20 w-64 h-64 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity ${feature.bg}`}></div>
                  <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 border ${feature.border}`}>
                    <feature.icon className={`w-7 h-7 ${feature.color}`} />
                  </div>
                  <h3 className="text-2xl font-heading font-semibold text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-32 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-[120px] -z-10"></div>
        
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-400 mb-6"
            >
              <Zap className="w-3 h-3 text-amber-400" />
              Simple, Transparent Pricing
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-6">Choose Your Learning Path</h2>
            <p className="text-gray-400 text-lg">
              Unlock the full potential of AI-driven education with our flexible plans designed for students of all levels.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricing.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "relative p-8 rounded-3xl border transition-all duration-500 group flex flex-col",
                  plan.popular 
                    ? "bg-white/5 border-white/20 shadow-[0_0_50px_rgba(255,255,255,0.05)] scale-105 z-10" 
                    : "bg-transparent border-white/10 hover:border-white/20"
                )}
              >
                {(plan.popular || plan.tag) && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-white text-black text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                    {plan.tag || 'Most Popular'}
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-xl font-heading font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-sm text-gray-400">{plan.credits}</p>
                </div>

                <div className="mb-8 flex items-baseline gap-1">
                  <span className="text-5xl font-heading font-bold text-white">${plan.price}</span>
                  {plan.period && <span className="text-gray-500 font-medium">{plan.period}</span>}
                </div>

                <ul className="space-y-4 mb-10">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-gray-300">
                      <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={plan.action}
                  className={cn(
                    "w-full py-4 rounded-2xl font-bold transition-all duration-300",
                    plan.popular
                      ? "bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                      : "bg-white/5 text-white border border-white/10 hover:bg-white/10"
                  )}
                >
                  {plan.button}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 via-bg-primary to-bg-primary -z-10" />
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-heading font-bold text-white mb-8"
          >
            Boost your productivity today.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-400 mb-12"
          >
            Join thousands of students who are already learning smarter, not harder.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <button onClick={() => handleLoginClick(true)} className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:bg-gray-200 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.2)]">
              Get Started Now <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Demo Modal */}
      <AnimatePresence>
        {showDemoModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDemoModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-4xl aspect-video glass-panel overflow-hidden"
            >
              <button 
                onClick={() => setShowDemoModal(false)}
                className="absolute top-4 right-4 z-10 p-2 text-white/50 hover:text-white transition-colors bg-black/20 rounded-full backdrop-blur-md"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="w-full h-full flex items-center justify-center bg-black/40">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center border border-white/20 mx-auto mb-6">
                    <Zap className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-3xl font-heading font-bold text-white mb-4">Demo Video Coming Soon</h3>
                  <p className="text-gray-400 max-w-md mx-auto">
                    We're currently preparing a comprehensive walkthrough of Studygen AI. Check back soon to see it in action!
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-border-glass bg-bg-primary pt-16 pb-8 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-border-glass">
                <BookOpen className="w-5 h-5 text-gray-300" />
              </div>
              <span className="text-xl font-heading font-bold text-white">Studygen AI</span>
            </div>
            <p className="text-gray-400 max-w-sm">
              Your ultimate AI companion for mastering your studies. Summarize, quiz, plan, and learn smarter.
            </p>
          </div>
          <div>
            <h4 className="text-white font-heading font-semibold mb-6">Product</h4>
            <ul className="space-y-4 text-gray-400">
              <li><Link to="/study-buddy" className="hover:text-white transition-colors">Study Buddy</Link></li>
              <li><Link to="/summarizer" className="hover:text-white transition-colors">Summarizer</Link></li>
              <li><Link to="/quiz" className="hover:text-white transition-colors">Quizverse</Link></li>
              <li><Link to="/planner" className="hover:text-white transition-colors">Planner</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-heading font-semibold mb-6">Company</h4>
            <ul className="space-y-4 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-border-glass flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>© 2026 Studygen AI. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
