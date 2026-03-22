import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

export function Verification() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refreshUser, logout } = useAuth();
  const [checking, setChecking] = useState(false);
  const email = location.state?.email || user?.email || 'your email';

  useEffect(() => {
    if (user?.emailVerified) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleCheckStatus = async () => {
    setChecking(true);
    try {
      await refreshUser();
      // The useEffect will handle navigation if verified
    } catch (error) {
      console.error('Error refreshing user', error);
    } finally {
      setChecking(false);
    }
  };

  const handleBackToLogin = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-gray-200 flex items-center justify-center px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full glass-panel p-8 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500/20">
          <motion.div 
            className="h-full bg-indigo-500"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </div>

        <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 flex items-center justify-center mb-8 mx-auto border border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.1)]">
          <Mail className="w-10 h-10 text-indigo-400" />
        </div>

        <h2 className="text-3xl font-heading font-bold text-white mb-4 tracking-tight">Verify your email</h2>
        <p className="text-gray-400 mb-10 leading-relaxed text-lg">
          We have sent a verification link to <br/>
          <span className="text-indigo-400 font-semibold">{email}</span>. <br/>
          Please click it to activate your account.
        </p>

        <div className="space-y-4">
          <button 
            onClick={handleCheckStatus}
            disabled={checking}
            className="w-full py-4 glass-pill bg-indigo-500/10 text-white font-semibold flex items-center justify-center gap-3 hover:bg-indigo-500/20 transition-all border border-indigo-500/30 disabled:opacity-50"
          >
            {checking ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
            {checking ? 'Checking...' : "I've verified my email"}
          </button>

          <button 
            onClick={handleBackToLogin}
            className="w-full py-4 text-gray-400 font-medium flex items-center justify-center gap-2 hover:text-white transition-colors"
          >
            Back to Login
          </button>
        </div>

        <div className="mt-10 pt-8 border-t border-white/5 text-sm text-gray-500">
          Didn't receive the email? Check your spam folder or try signing up again.
        </div>
      </motion.div>
    </div>
  );
}
