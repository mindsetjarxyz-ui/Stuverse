import { NavLink } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { locales } from '../locales';
import { BookOpen, MessageSquare, FileText, CheckSquare, Calendar, Zap, Globe, LogOut, Mic } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const { language, plan, credits, setLanguage } = useAppStore();
  const t = locales[language];
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      if (onClose) onClose();
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const links = [
    { to: '/dashboard', icon: BookOpen, label: t.dashboard },
    { to: '/study-buddy', icon: MessageSquare, label: t.study_buddy },
    { to: '/summarizer', icon: FileText, label: t.summarizer },
    { to: '/quiz', icon: CheckSquare, label: t.quiz_generator },
    { to: '/planner', icon: Calendar, label: t.study_planner },
    { to: '/voice-to-notes', icon: Mic, label: t.voice_to_notes },
  ];

  return (
    <motion.div 
      initial={{ x: -200, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-64 h-screen bg-bg-primary/80 backdrop-blur-xl border-r border-border-glass flex flex-col text-gray-300"
    >
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center border border-border-glass">
          <BookOpen className="w-5 h-5 text-gray-200" />
        </div>
        <h1 className="text-xl font-heading font-semibold text-white tracking-tight">{t.app_name}</h1>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {links.map((link, i) => (
          <motion.div
            key={link.to}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <NavLink
              to={link.to}
              onClick={onClose}
              className={({ isActive }) =>
                twMerge(
                  clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-glass text-white shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-border-glass'
                      : 'hover:bg-glass hover:text-white border border-transparent'
                  )
                )
              }
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      <div className="p-4 space-y-4">
        <div className="p-4 rounded-2xl glass-panel">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{t.credits_left}</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-heading font-semibold text-white">{credits}</span>
            <span className="text-xs text-gray-500">/ {plan === 'pro' ? 200 : 50}</span>
          </div>
          <div className="mt-3 w-full bg-bg-secondary rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-emerald-400 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${(credits / (plan === 'pro' ? 200 : 50)) * 100}%` }}
            />
          </div>
        </div>

        {plan === 'free' && (
          <button 
            onClick={() => {
              window.open('https://buy.stripe.com/test_dummy', '_blank');
              if (onClose) onClose();
            }}
            className="w-full py-2.5 px-4 glass-pill text-white text-sm font-semibold hover:text-white transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)]"
          >
            {t.upgrade}
          </button>
        )}

        <div className="flex items-center justify-between px-2 pt-2 border-t border-border-glass">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Globe className="w-4 h-4" />
            <span>{t.language}</span>
          </div>
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="bg-transparent text-sm text-white outline-none cursor-pointer"
          >
            <option value="en" className="bg-bg-secondary">EN</option>
            <option value="bn" className="bg-bg-secondary">BN</option>
          </select>
        </div>
        
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors border border-transparent hover:border-border-glass"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </motion.div>
  );
}
