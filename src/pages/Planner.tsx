import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTranslation } from '../hooks/useTranslation';
import { useAppStore } from '../store/useAppStore';
import { generateCompletionStream } from '../services/ai';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export const Planner: React.FC = () => {
  const { t } = useTranslation();
  const { useCredits, addRecentTool, showAlert, language } = useAppStore();
  
  const [subjects, setSubjects] = useState('');
  const [examDate, setExamDate] = useState('');
  const [dailyHours, setDailyHours] = useState('4');
  const [weakTopics, setWeakTopics] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [plan, setPlan] = useState('');

  const languageName = language === 'bn' ? 'Bengali' : language === 'hi' ? 'Hindi' : 'English';

  useEffect(() => {
    addRecentTool('Study Planner');
  }, [addRecentTool]);

  const handleGenerate = async () => {
    if (!subjects.trim() || !examDate) return;

    const cost = 1;
    
    if (!useCredits(cost)) {
      showAlert(t('insufficientCredits'));
      return;
    }

    setIsGenerating(true);
    setPlan('');

    const prompt = `Create a detailed study plan with the following constraints:
Subjects: ${subjects}
Exam Date: ${examDate}
Daily Study Hours: ${dailyHours}
Weak Topics to focus on: ${weakTopics}

Please provide a structured calendar grid or day-by-day breakdown, color-coded session suggestions (using emoji or text labels), and break suggestions.`;

    try {
      const stream = generateCompletionStream(prompt, [], languageName);
      for await (const chunk of stream) {
        setPlan(prev => prev + chunk);
      }
    } catch (error) {
      console.error(error);
      setPlan('Sorry, an error occurred while generating the study plan.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-8"
    >
      <div className="text-center space-y-4">
        <motion.div 
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="w-16 h-16 mx-auto rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)]"
        >
          <Calendar className="w-8 h-8 text-gray-300" />
        </motion.div>
        <h1 className="text-3xl font-heading font-bold text-white">Study Planner AI</h1>
        <p className="text-gray-400">Generate a personalized, optimized study schedule.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <Card className="space-y-6 h-fit border-white/10">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">{t('subjects')}</label>
            <input
              type="text"
              value={subjects}
              onChange={(e) => setSubjects(e.target.value)}
              placeholder="Math, Physics, Chemistry"
              className="w-full bg-bg-primary border border-border-glass rounded-xl p-3 text-gray-200 focus:outline-none focus:border-white/30"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">{t('examDate')}</label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full bg-bg-primary border border-border-glass rounded-xl p-3 text-gray-200 focus:outline-none focus:border-white/30 [color-scheme:dark]"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium text-gray-300">{t('dailyHours')}</label>
              <span className="text-sm font-mono text-gray-300">{dailyHours}h</span>
            </div>
            <input
              type="range"
              min="1"
              max="16"
              step="1"
              value={dailyHours}
              onChange={(e) => setDailyHours(e.target.value)}
              className="w-full accent-gray-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">{t('weakTopics')}</label>
            <textarea
              value={weakTopics}
              onChange={(e) => setWeakTopics(e.target.value)}
              placeholder="e.g., Thermodynamics, Calculus"
              className="w-full bg-bg-primary border border-border-glass rounded-xl p-3 text-gray-200 focus:outline-none focus:border-white/30 resize-none h-24"
            />
          </div>

          <div className="space-y-2">
            <Button 
              className="w-full bg-white text-black hover:bg-gray-200 border-none"
              onClick={handleGenerate}
              disabled={isGenerating || !subjects.trim() || !examDate}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Planning...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Plan
                </>
              )}
            </Button>
            <p className="text-[10px] text-gray-500 text-center">Generation consumes 1 credit</p>
          </div>
        </Card>
        </motion.div>

        {/* Output Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="min-h-[500px] border-white/10">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-border-glass">
            <h3 className="font-heading font-semibold text-white">Your Study Plan</h3>
          </div>
          
          <div className="overflow-y-auto h-[calc(100%-4rem)]">
            {plan ? (
              <div className="markdown-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{plan}</ReactMarkdown>
              </div>
            ) : isGenerating ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-gray-400 animate-spin"></div>
                <p className="animate-pulse">AI is optimizing your schedule...</p>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <Calendar className="w-12 h-12 mb-3 opacity-20" />
                <p>Your personalized plan will appear here</p>
              </div>
            )}
          </div>
        </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};
