import { useAppStore } from '../store/useAppStore';
import { locales } from '../locales';
import { motion } from 'motion/react';
import { MessageSquare, FileText, CheckSquare, Calendar, ArrowRight, Trophy, Clock, TrendingUp, Mic, Zap, Bookmark, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { getSavedItems, deleteSavedItem, SavedItem } from '../services/savedItems';
import { Paperclip } from 'lucide-react';

const FileLink = ({ filePath }: { filePath: string }) => {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchUrl = async () => {
      const { data } = await supabase.storage.from('app-files').createSignedUrl(filePath, 3600);
      if (data) setUrl(data.signedUrl);
    };
    fetchUrl();
  }, [filePath]);

  if (!url) return null;

  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors bg-blue-400/10 px-2 py-1 rounded w-fit"
    >
      <Paperclip className="w-3 h-3" />
      View Attached File
    </a>
  );
};

interface QuizScore {
  id: string;
  topic: string;
  score: number;
  total: number;
  timestamp: string;
}

export function Dashboard() {
  const { language, plan, credits } = useAppStore();
  const t = locales[language];
  const { user } = useAuth();
  const [recentScores, setRecentScores] = useState<QuizScore[]>([]);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingItems, setLoadingItems] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchScores = async () => {
      const { data, error } = await supabase
        .from('quiz_scores')
        .select('*')
        .eq('userId', user.id)
        .order('timestamp', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching scores:', error);
      } else {
        setRecentScores(data || []);
      }
      setLoading(false);
    };

    const fetchSavedItems = async () => {
      try {
        const items = await getSavedItems(user.id);
        setSavedItems(items.slice(0, 5));
      } catch (error) {
        console.error('Error fetching saved items:', error);
      } finally {
        setLoadingItems(false);
      }
    };

    fetchScores();
    fetchSavedItems();
  }, [user]);

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteSavedItem(id);
      setSavedItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

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
    },
    {
      to: '/voice-to-notes',
      icon: Mic,
      title: t.voice_to_notes,
      desc: 'Transcribe lecture audio into structured, bullet-point notes.',
      color: 'text-rose-400',
      bg: 'bg-rose-400/10',
      border: 'border-rose-400/20'
    }
  ];

  return (
    <div className="space-y-8">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-heading font-semibold tracking-tight text-white mb-2">
              Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name.split(' ')[0]}` : ''}
            </h1>
            <p className="text-gray-400 text-lg">
              You have <span className="text-emerald-400 font-medium">{credits} credits</span> remaining today on your <span className="capitalize text-gray-200 font-medium">{plan === 'free' ? t.free_plan : plan === 'pro' ? t.pro_plan : t.plus_plan}</span>.
            </p>
          </div>
          {plan !== 'plus' && (
            <Link 
              to="/pricing"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)]"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              Upgrade Plan
            </Link>
          )}
        </div>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Tools */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-heading font-semibold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tools.map((tool, i) => (
              <motion.div
                key={tool.to}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link 
                  to={tool.to}
                  className={`group block p-5 glass-panel hover:bg-glass-hover transition-all duration-300 relative overflow-hidden`}
                >
                  <div className={`absolute -right-10 -top-10 w-24 h-24 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity ${tool.bg}`}></div>
                  <div className="flex items-start justify-between relative z-10">
                    <div className={`w-10 h-10 rounded-xl ${tool.bg} flex items-center justify-center mb-3 border ${tool.border}`}>
                      <tool.icon className={`w-5 h-5 ${tool.color}`} />
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-gray-300 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="text-lg font-heading font-medium text-white mb-1 relative z-10">{tool.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed relative z-10">{tool.desc}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Activity / Scores */}
        <div className="space-y-6">
          <h2 className="text-xl font-heading font-semibold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Recent Quiz Scores
          </h2>
          <div className="glass-panel p-6 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Clock className="w-6 h-6 text-gray-500 animate-spin" />
              </div>
            ) : (recentScores?.length || 0) > 0 ? (
              <div className="space-y-4">
                {recentScores?.map((score) => (
                <div key={score.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{score.topic}</p>
                    <p className="text-[10px] text-gray-500">
                      {new Date(score.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-emerald-400">{score.score}/{score.total}</p>
                    <p className="text-[10px] text-gray-500">{Math.round((score.score / score.total) * 100)}%</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
              <div className="text-center py-8">
                <CheckSquare className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No quizzes taken yet.</p>
                <Link to="/quiz" className="text-xs text-white hover:underline mt-2 inline-block">Start your first quiz</Link>
              </div>
            )}
          </div>

          {/* Saved Items */}
          <h2 className="text-xl font-heading font-semibold text-white flex items-center gap-2 mt-8">
            <Bookmark className="w-5 h-5 text-blue-400" />
            Saved Items
          </h2>
          <div className="glass-panel p-6 space-y-4">
            {loadingItems ? (
              <div className="flex items-center justify-center py-8">
                <Clock className="w-6 h-6 text-gray-500 animate-spin" />
              </div>
            ) : savedItems.length > 0 ? (
              <div className="space-y-4">
                {savedItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">
                          {item.type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-white truncate">{item.title}</p>
                      <p className="text-[10px] text-gray-500">
                        {new Date(item.created_at).toLocaleDateString()}
                      </p>
                      {item.file_path && <FileLink filePath={item.file_path} />}
                    </div>
                    <button 
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-2 text-gray-500 hover:text-red-400 transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Bookmark className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No saved items yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
