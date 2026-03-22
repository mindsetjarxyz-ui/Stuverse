import React from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, MessageSquare, FileText, CheckSquare, Calendar, Zap, ArrowRight, BrainCircuit, Shield, Sparkles, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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
  const { user, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (user) {
      navigate('/dashboard');
    } else {
      try {
        await signInWithGoogle();
        navigate('/dashboard');
      } catch (error) {
        console.error('Login failed', error);
      }
    }
  };

  const handleProUpgrade = () => {
    window.open('https://buy.stripe.com/test_dummy', '_blank');
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
    }
  ];

  const pricing = [
    {
      name: 'Free',
      credits: '50 Credits / Day',
      price: '$0',
      features: ['Basic AI Chat', 'Standard Summaries', 'Up to 15 Quiz Questions', 'Basic Study Planner'],
      button: 'Get Started Free',
      action: handleLogin,
      popular: false
    },
    {
      name: 'Pro',
      credits: '200 Credits / Day',
      price: '$9.99',
      period: '/month',
      features: ['Advanced AI Models', 'Deep PDF Summaries', 'Up to 30 Quiz Questions', 'Priority Support'],
      button: 'Upgrade to Pro',
      action: handleProUpgrade,
      popular: true
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
            <span className="text-2xl font-heading font-bold tracking-tight text-white">Stuverse</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <a href="#home" className="hover:text-white transition-colors">Home</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Link to="/dashboard" className="px-5 py-2.5 glass-pill text-white text-sm font-semibold hover:text-white transition-colors">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <button onClick={handleLogin} className="hidden md:block text-sm font-medium text-gray-300 hover:text-white transition-colors">
                  Login
                </button>
                <button onClick={handleLogin} className="px-5 py-2.5 glass-pill text-white text-sm font-semibold hover:text-white transition-colors">
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </motion.nav>

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
            <span>Introducing Stuverse AI 2.0</span>
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
            Stuverse is your ultimate AI companion. Summarize notes, generate quizzes, chat with your study materials, and plan your success effortlessly.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button onClick={handleLogin} className="w-full sm:w-auto px-8 py-4 glass-pill text-white font-semibold flex items-center justify-center gap-2">
              Get Started Free <ArrowRight className="w-5 h-5" />
            </button>
            <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-transparent text-white font-semibold hover:bg-glass transition-colors border border-border-glass flex items-center justify-center gap-2">
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
      <section id="pricing" className="py-32 px-6 bg-bg-secondary/50 border-y border-border-glass relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-heading font-bold text-white mb-6"
            >
              Credit-Based Pricing
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-gray-400 text-lg max-w-2xl mx-auto"
            >
              Simple, transparent pricing that scales with your study needs.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricing.map((plan, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className={`p-8 rounded-3xl border ${plan.popular ? 'bg-white/5 border-white/20 relative shadow-[0_0_30px_rgba(255,255,255,0.05)]' : 'bg-bg-primary border-border-glass'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-white text-black text-xs font-bold uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-heading font-semibold text-white mb-2">{plan.name}</h3>
                <div className="flex items-center gap-2 mb-6">
                  <Zap className={`w-5 h-5 ${plan.popular ? 'text-gray-300' : 'text-gray-500'}`} />
                  <span className="text-gray-300 font-medium">{plan.credits}</span>
                </div>
                <div className="mb-8">
                  <span className="text-5xl font-heading font-bold text-white">{plan.price}</span>
                  {plan.period && <span className="text-gray-400">{plan.period}</span>}
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feat, j) => (
                    <li key={j} className="flex items-center gap-3 text-gray-300">
                      <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                        <CheckSquare className="w-3 h-3 text-gray-300" />
                      </div>
                      {feat}
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={plan.action}
                  className={`block w-full py-4 rounded-full text-center font-semibold transition-all duration-300 ${
                    plan.popular 
                      ? 'bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
                      : 'bg-glass text-white hover:bg-glass-hover border border-border-glass'
                  }`}
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
            <button onClick={handleLogin} className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:bg-gray-200 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.2)]">
              Get Started Now <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-glass bg-bg-primary pt-16 pb-8 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-border-glass">
                <BookOpen className="w-5 h-5 text-gray-300" />
              </div>
              <span className="text-xl font-heading font-bold text-white">Stuverse</span>
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
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-border-glass flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>© 2026 Stuverse AI. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
