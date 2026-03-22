import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckSquare, Play, ChevronRight, RotateCcw, Trophy, Loader2 } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { useAppStore } from '../store/useAppStore';
import { generateQuiz } from '../services/ai';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { cn } from '../utils/cn';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

interface Question {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export const Quizverse: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { plan, credits, useCredits, addRecentTool, updateQuizAccuracy, showAlert } = useAppStore();
  
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(15);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [language, setLanguage] = useState('English');
  
  const [quizState, setQuizState] = useState<'setup' | 'generating' | 'playing' | 'results'>('setup');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  const maxQuestions = plan === 'pro' ? 30 : 15;

  useEffect(() => {
    addRecentTool('Quizverse');
  }, [addRecentTool]);

  const handleGenerate = async () => {
    if (!topic.trim() || !user) return;

    const cost = 2;
    
    if (credits < cost) {
      showAlert(t('insufficientCredits'));
      return;
    }

    setQuizState('generating');
    try {
      const generatedQuestions = await generateQuiz(topic, count, difficulty, language);
      if (generatedQuestions && generatedQuestions.length > 0) {
        // Deduct credits in Firestore
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const currentCredits = userSnap.data().credits || 0;
          await updateDoc(userRef, {
            credits: Math.max(0, currentCredits - cost)
          });
          useCredits(cost); // Sync local state
        }

        const shuffledQuestions = generatedQuestions.map((q: Question) => {
          const optionsWithOriginalIndex = q.options.map((opt, idx) => ({ opt, idx }));
          const shuffled = [...optionsWithOriginalIndex].sort(() => Math.random() - 0.5);
          const newCorrectIndex = shuffled.findIndex(s => s.idx === q.correctAnswerIndex);
          return {
            ...q,
            options: shuffled.map(s => s.opt),
            correctAnswerIndex: newCorrectIndex
          };
        });

        setQuestions(shuffledQuestions);
        setQuizState('playing');
        setCurrentIndex(0);
        setScore(0);
        setSelectedAnswer(null);
        setShowExplanation(false);
      } else {
        throw new Error('No questions generated');
      }
    } catch (error) {
      console.error(error);
      showAlert('Failed to generate quiz. Please try again.');
      setQuizState('setup');
    }
  };

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(index);
    setShowExplanation(true);
    
    if (index === questions[currentIndex].correctAnswerIndex) {
      setScore(s => s + 1);
    }
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      updateQuizAccuracy(score, questions.length);
      
      // Save score to Firestore
      if (user) {
        try {
          await addDoc(collection(db, 'quiz_scores'), {
            userId: user.uid,
            topic,
            score,
            total: questions.length,
            timestamp: serverTimestamp()
          });
        } catch (error) {
          console.error('Error saving quiz score:', error);
        }
      }
      
      setQuizState('results');
    }
  };

  const resetQuiz = () => {
    setQuizState('setup');
    setTopic('');
    setQuestions([]);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-8"
    >
      <div className="text-center space-y-4">
        <motion.div 
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="w-16 h-16 mx-auto rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)]"
        >
          <CheckSquare className="w-8 h-8 text-gray-300" />
        </motion.div>
        <h1 className="text-3xl font-heading font-bold text-white">Quizverse Engine</h1>
        <p className="text-gray-400">Test your knowledge with AI-generated custom quizzes.</p>
      </div>

      <AnimatePresence mode="wait">
        {quizState === 'setup' && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className="space-y-6 border-white/10">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">{t('topic')}</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Quantum Physics, World War II, React Hooks"
                  className="w-full bg-bg-primary border border-border-glass rounded-xl p-3 text-gray-200 focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">{t('questions')}</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setCount(15)}
                    className={cn(
                      "py-2 px-4 rounded-xl text-sm font-medium transition-all border",
                      count === 15 
                        ? "bg-white/10 border-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]" 
                        : "bg-bg-primary border-border-glass text-gray-400 hover:border-white/20"
                    )}
                  >
                    15 Questions
                  </button>
                  <button
                    onClick={() => {
                      if (plan === 'free') {
                        showAlert('Upgrade to Pro to generate 30 questions.');
                        return;
                      }
                      setCount(30);
                    }}
                    className={cn(
                      "py-2 px-4 rounded-xl text-sm font-medium transition-all border",
                      count === 30 
                        ? "bg-white/10 border-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]" 
                        : "bg-bg-primary border-border-glass text-gray-400 hover:border-white/20",
                      plan === 'free' && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    30 Questions
                  </button>
                </div>
                {plan === 'free' && (
                  <p className="text-xs text-gray-500 text-right">Max 15 on Free plan</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">{t('difficulty')}</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['easy', 'medium', 'hard'] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={cn(
                        "py-2 px-4 rounded-xl text-sm font-medium transition-all capitalize border",
                        difficulty === d 
                          ? "bg-white/10 border-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]" 
                          : "bg-bg-primary border-border-glass text-gray-400 hover:border-white/20"
                      )}
                    >
                      {t(d)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Output Language</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {['English', 'Bengali', 'Spanish', 'French', 'German', 'Hindi', 'Arabic', 'Chinese'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      className={cn(
                        "py-2 px-2 rounded-xl text-xs font-medium transition-all border",
                        language === lang 
                          ? "bg-white/10 border-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]" 
                          : "bg-bg-primary border-border-glass text-gray-400 hover:border-white/20"
                      )}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Button 
                  className="w-full bg-white text-black hover:bg-gray-200 border-none"
                  onClick={handleGenerate}
                  disabled={!topic.trim()}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Generate Quiz
                </Button>
                <p className="text-[10px] text-gray-500 text-center">Generation consumes 2 credits</p>
              </div>
            </Card>
          </motion.div>
        )}

        {quizState === 'generating' && (
          <motion.div
            key="generating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 space-y-6"
          >
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-gray-400 rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <CheckSquare className="w-8 h-8 text-gray-300 animate-pulse" />
              </div>
            </div>
            <p className="text-lg text-gray-300 font-medium animate-pulse">AI is building your quiz...</p>
          </motion.div>
        )}

        {quizState === 'playing' && questions.length > 0 && (
          <motion.div
            key="playing"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="border-white/10 relative overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-1 bg-gray-400 transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
              
              <div className="flex justify-between items-center mb-6 pt-2">
                <span className="text-sm font-medium text-gray-300">Question {currentIndex + 1} of {questions.length}</span>
                <span className="text-sm font-mono bg-white/5 px-2 py-1 rounded text-gray-300">Score: {score}</span>
              </div>

              <h2 className="text-xl font-heading font-medium text-white mb-8">
                {questions[currentIndex].question}
              </h2>

              <div className="space-y-3 mb-8">
                {questions[currentIndex].options.map((option, idx) => {
                  const isSelected = selectedAnswer === idx;
                  const isCorrect = idx === questions[currentIndex].correctAnswerIndex;
                  const showStatus = selectedAnswer !== null;

                  let btnClass = "bg-bg-primary border-border-glass text-gray-300 hover:border-white/30 hover:bg-white/5";
                  
                  if (showStatus) {
                    if (isCorrect) {
                      btnClass = "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]";
                    } else if (isSelected) {
                      btnClass = "bg-red-500/20 border-red-500/50 text-red-300";
                    } else {
                      btnClass = "bg-bg-primary border-border-glass text-gray-500 opacity-50";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      disabled={selectedAnswer !== null}
                      className={cn(
                        "w-full p-4 rounded-xl border text-left transition-all duration-300 flex items-center gap-3",
                        btnClass
                      )}
                    >
                      <div className={cn(
                        "w-6 h-6 rounded-full border flex items-center justify-center text-xs font-mono shrink-0",
                        showStatus && isCorrect ? "border-emerald-500 text-emerald-400" :
                        showStatus && isSelected ? "border-red-500 text-red-400" :
                        "border-gray-600 text-gray-500"
                      )}>
                        {['A', 'B', 'C', 'D'][idx]}
                      </div>
                      <span>{option}</span>
                    </button>
                  );
                })}
              </div>

              <AnimatePresence>
                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10"
                  >
                    <p className="text-sm text-gray-300">
                      <span className="font-semibold text-white mr-2">Explanation:</span>
                      {questions[currentIndex].explanation}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-end">
                <Button
                  onClick={handleNext}
                  disabled={selectedAnswer === null}
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                >
                  {currentIndex === questions.length - 1 ? 'Finish' : 'Next Question'}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {quizState === 'results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <Card className="border-white/10 py-12">
              <div className="w-24 h-24 mx-auto rounded-full bg-white/10 flex items-center justify-center border-4 border-white/20 mb-6 relative">
                <Trophy className="w-10 h-10 text-gray-300" />
                <div className="absolute -inset-4 border border-white/10 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
              </div>
              
              <h2 className="text-3xl font-heading font-bold text-white mb-2">Quiz Completed!</h2>
              <p className="text-gray-400 mb-8">You scored {score} out of {questions.length}</p>
              
              <div className="flex justify-center gap-4">
                <Button onClick={resetQuiz} variant="secondary">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  New Quiz
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
