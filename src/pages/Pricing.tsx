import React from 'react';
import { motion } from 'motion/react';
import { Check, Zap, Sparkles, Shield, Clock, Globe, ArrowLeft } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { useAppStore } from '../store/useAppStore';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Pricing: React.FC = () => {
  const { t } = useTranslation();
  const { plan, showAlert } = useAppStore();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleUpgrade = async (planName: string) => {
    if (!user) {
      showAlert('Please log in to upgrade your plan.');
      return;
    }

    showAlert('Payment integration is currently disabled. Please contact support to upgrade.');
  };

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
      button: plan === 'free' ? 'Current Plan' : 'Downgrade',
      action: () => {},
      disabled: plan === 'free',
      popular: false
    },
    {
      name: 'pro',
      displayName: 'Studygen Pro',
      credits: '200 Credits / Day (6200/mo)',
      price: '0.99',
      period: '/mo',
      planId: import.meta.env.VITE_FASTSPRING_PRO_PATH,
      features: [
        'Advanced AI Models',
        'Priority Fast Generation',
        'Deep Multi-file Summaries',
        'AI Note-Taker Access',
        'Multi-Language Support',
        'Exclusive Beta Features'
      ],
      button: plan === 'pro' ? 'Current Plan' : plan === 'plus' ? 'Downgrade' : 'Upgrade to Pro',
      action: () => handleUpgrade('pro'),
      disabled: plan === 'pro',
      popular: true,
      tag: 'Best Selling'
    },
    {
      name: 'plus',
      displayName: 'Studygen Plus',
      credits: '500 Credits / Day (15000/mo)',
      price: '2.99',
      period: '/mo',
      planId: import.meta.env.VITE_FASTSPRING_PLUS_PATH,
      features: [
        'Highest Priority Processing',
        'Unlimited Deep Analysis',
        'Advanced Study Analytics',
        'Early Access to New Tools',
        'Premium Support',
        'Custom Study Templates'
      ],
      button: plan === 'plus' ? 'Current Plan' : 'Upgrade to Plus',
      action: () => handleUpgrade('plus'),
      disabled: plan === 'plus',
      popular: false
    }
  ];

  return (
    <div className="min-h-screen py-12 px-6 relative overflow-hidden bg-bg-primary">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)] -z-10"></div>
      
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-start mb-12">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>
        </div>

        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-400 mb-6"
          >
            <Zap className="w-3 h-3 text-amber-400" />
            Simple, Transparent Pricing
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-white mb-6">Choose Your Learning Path</h1>
          <p className="text-gray-400 text-lg">
            Unlock the full potential of AI-driven education with our flexible plans designed for students of all levels.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricing.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "relative p-8 rounded-3xl border transition-all duration-500 group flex flex-col",
                p.popular 
                  ? "bg-white/5 border-white/20 shadow-[0_0_50px_rgba(255,255,255,0.05)] scale-105 z-10" 
                  : "bg-transparent border-white/10 hover:border-white/20"
              )}
            >
              {(p.popular || p.tag) && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-white text-black text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                  {p.tag || 'Most Popular'}
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-heading font-bold text-white mb-2">{p.displayName || p.name}</h3>
                <p className="text-sm text-gray-400">{p.credits}</p>
              </div>

              <div className="mb-8 flex items-baseline gap-1">
                <span className="text-5xl font-heading font-bold text-white">${p.price}</span>
                {p.period && <span className="text-gray-500">{p.period}</span>}
              </div>

              <div className="space-y-4 mb-10 flex-1">
                {p.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3 text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                    <div className="mt-1 w-4 h-4 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                    {feature}
                  </div>
                ))}
              </div>

              <Button 
                onClick={p.action}
                disabled={p.disabled}
                className={cn(
                  "w-full py-6 rounded-2xl font-bold transition-all duration-300",
                  p.popular 
                    ? "bg-white text-black hover:bg-gray-200" 
                    : "bg-white/5 text-white hover:bg-white/10 border-white/10"
                )}
              >
                {p.button}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-24 pt-12 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          <div className="flex flex-col items-center text-center space-y-2">
            <Shield className="w-6 h-6 text-gray-500" />
            <span className="text-xs font-medium text-gray-400">Secure Payments</span>
          </div>
          <div className="flex flex-col items-center text-center space-y-2">
            <Clock className="w-6 h-6 text-gray-500" />
            <span className="text-xs font-medium text-gray-400">24/7 Support</span>
          </div>
          <div className="flex flex-col items-center text-center space-y-2">
            <Globe className="w-6 h-6 text-gray-500" />
            <span className="text-xs font-medium text-gray-400">Global Access</span>
          </div>
          <div className="flex flex-col items-center text-center space-y-2">
            <Sparkles className="w-6 h-6 text-gray-500" />
            <span className="text-xs font-medium text-gray-400">AI Powered</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
