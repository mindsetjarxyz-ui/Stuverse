import { useAppStore } from '../store/useAppStore';
import { locales } from '../locales';
import { motion } from 'motion/react';
import { MessageSquare, FileText, CheckSquare, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Dashboard() {
  const { language, plan, credits } = useAppStore();
  const t = locales[language];
  const { user } = useAuth();

  const tools = [
    {
      to: '/study-buddy',
      icon: MessageSquare,
      title: t.study_buddy,
      desc: 'Chat with AI, upload PDFs or images for instant answers.',
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
      border: 'border-blue-400/20'
    },
    {
      to: '/summarizer',
      icon: FileText,
      title: t.summarizer,
      desc: 'Condense long texts or PDFs into clear, structured notes.',
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
      border: 'border-emerald-400/20'
    },
    {
      to: '/quiz',
      icon: CheckSquare,
      title: t.quiz_generator,
      desc: 'Generate multiple-choice quizzes to test your knowledge.',
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
      border: 'border-amber-400/20'
    },
    {
      to: '/planner',
      icon: Calendar,
      title: t.study_planner,
      desc: 'Create personalized study schedules based on your goals.',
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
      border: 'border-purple-400/20'
    }
  ];

  return (
    <div className="space-y-8">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-4xl font-heading font-semibold tracking-tight text-white mb-2">
          Welcome back{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}
        </h1>
        <p className="text-gray-400 text-lg">
          You have <span className="text-emerald-400 font-medium">{credits} credits</span> remaining today on your <span className="capitalize text-gray-200 font-medium">{plan}</span> plan.
        </p>
      </motion.header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tools.map((tool, i) => (
          <motion.div
            key={tool.to}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link 
              to={tool.to}
              className={`group block p-6 glass-panel hover:bg-glass-hover transition-all duration-300 relative overflow-hidden`}
            >
              <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity ${tool.bg}`}></div>
              <div className="flex items-start justify-between relative z-10">
                <div className={`w-12 h-12 rounded-2xl ${tool.bg} flex items-center justify-center mb-4 border ${tool.border}`}>
                  <tool.icon className={`w-6 h-6 ${tool.color}`} />
                </div>
                <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-gray-300 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-xl font-heading font-medium text-white mb-2 relative z-10">{tool.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed relative z-10">{tool.desc}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
