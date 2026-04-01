import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { FileText, Upload, Type, Loader2, Sparkles, Copy } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTranslation } from '../hooks/useTranslation';
import { useAppStore } from '../store/useAppStore';
import { analyzeDocumentStream, generateCompletionStream } from '../services/ai';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { cn } from '../lib/utils';

export const Summarizer: React.FC = () => {
  const { t } = useTranslation();
  const { useCredits, addRecentTool, showAlert, language } = useAppStore();
  
  const [mode, setMode] = useState<'text' | 'pdf'>('text');
  const [summaryType, setSummaryType] = useState<'quick' | 'deep'>('quick');
  const [textInput, setTextInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<{ name: string; data: string; mimeType: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const languageName = language === 'bn' ? 'Bengali' : language === 'hi' ? 'Hindi' : 'English';

  useEffect(() => {
    addRecentTool('Summarizer');
  }, [addRecentTool]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      showAlert('Please upload a PDF file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = (event.target?.result as string).split(',')[1];
      setSelectedFile({
        name: file.name,
        data: base64Data,
        mimeType: file.type
      });
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (mode === 'text' && !textInput.trim()) return;
    if (mode === 'pdf' && !selectedFile) return;

    const cost = 3;
    
    if (!useCredits(cost)) {
      showAlert(t('insufficientCredits'));
      return;
    }

    setIsGenerating(true);
    setSummary('');

    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    const prompt = summaryType === 'quick' 
      ? 'Provide a quick, concise summary of the following content. Focus only on the main ideas.'
      : 'Provide a deep academic summary of the following content. Structure it with: 1. Chapter Overview, 2. Bullet Key Points, 3. Important Definitions, 4. Exam Tips, 5. Memory Tricks.';

    try {
      let stream;
      if (mode === 'pdf' && selectedFile) {
        stream = analyzeDocumentStream(selectedFile.data, selectedFile.mimeType, prompt, [], languageName);
      } else {
        stream = generateCompletionStream(`${prompt}\n\nContent:\n${textInput}`, [], languageName);
      }

      for await (const chunk of stream) {
        setSummary(prev => prev + chunk);
      }
    } catch (error) {
      console.error(error);
      setSummary('Sorry, an error occurred while generating the summary.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="text-center space-y-4">
        <motion.div 
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="w-16 h-16 mx-auto rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)]"
        >
          <FileText className="w-8 h-8 text-gray-300" />
        </motion.div>
        <h1 className="text-3xl font-heading font-bold text-white">AI Summarizer Engine</h1>
        <p className="text-gray-400">Transform long texts and PDFs into structured, easy-to-read notes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="space-y-6">
          <div className="flex p-1 rounded-xl bg-bg-primary border border-border-glass">
            <button
              onClick={() => setMode('text')}
              className={cn(
                "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2",
                mode === 'text' ? "bg-white/10 text-white shadow-sm" : "text-gray-400 hover:text-gray-200"
              )}
            >
              <Type className="w-4 h-4" /> Text
            </button>
            <button
              onClick={() => setMode('pdf')}
              className={cn(
                "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2",
                mode === 'pdf' ? "bg-white/10 text-white shadow-sm" : "text-gray-400 hover:text-gray-200"
              )}
            >
              <Upload className="w-4 h-4" /> PDF
            </button>
          </div>

          <div className="min-h-[200px]">
            {mode === 'text' ? (
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={t('pasteText')}
                className="w-full h-48 bg-bg-primary border border-border-glass rounded-xl p-4 text-gray-200 focus:outline-none focus:border-white/30 resize-none"
              />
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-48 border-2 border-dashed border-border-glass rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-white/30 hover:bg-white/5 transition-all"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="application/pdf"
                  onChange={handleFileChange}
                />
                <Upload className="w-8 h-8 text-gray-500 mb-3" />
                {selectedFile ? (
                  <p className="text-gray-300 font-medium text-center px-4 truncate w-full">{selectedFile.name}</p>
                ) : (
                  <p className="text-gray-400">Click to upload PDF</p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-300">Summary Type</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSummaryType('quick')}
                className={cn(
                  "py-3 px-4 rounded-xl text-sm font-medium transition-all border text-left",
                  summaryType === 'quick' 
                    ? "bg-white/10 border-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]" 
                    : "bg-bg-primary border-border-glass text-gray-400 hover:border-white/20"
                )}
              >
                <div className="font-semibold mb-1 text-white">Quick Summary</div>
                <div className="text-xs opacity-80">Brief overview of main points</div>
              </button>
              <button
                onClick={() => setSummaryType('deep')}
                className={cn(
                  "py-3 px-4 rounded-xl text-sm font-medium transition-all border text-left",
                  summaryType === 'deep' 
                    ? "bg-white/10 border-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]" 
                    : "bg-bg-primary border-border-glass text-gray-400 hover:border-white/20"
                )}
              >
                <div className="font-semibold mb-1 text-white">Deep Academic</div>
                <div className="text-xs opacity-80">Structured notes with tips</div>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Button 
              className="w-full bg-white text-black hover:bg-gray-200 border-none"
              onClick={handleGenerate}
              disabled={isGenerating || (mode === 'text' ? !textInput.trim() : !selectedFile)}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Summary
                </>
              )}
            </Button>
            <p className="text-[10px] text-gray-500 text-center">Generation consumes 3 credits</p>
          </div>
        </Card>
        </motion.div>

        {/* Output Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="min-h-[500px] flex flex-col relative" ref={resultRef}>
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-border-glass">
            <h3 className="font-heading font-semibold text-white">Generated Notes</h3>
            <div className="flex items-center gap-2">
              {summary && (
                <Button 
                  variant="ghost" 
                  className="h-8 px-3 text-xs bg-white/5 hover:bg-white/10"
                  onClick={() => {
                    navigator.clipboard.writeText(summary);
                    showAlert('Copied to clipboard!');
                  }}
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </Button>
              )}
              {summary && (
                <span className="text-xs px-2 py-1 rounded bg-white/10 text-gray-300 border border-white/20">
                  {summaryType === 'quick' ? 'Quick' : 'Deep'}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {summary ? (
              <div className="markdown-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{summary}</ReactMarkdown>
              </div>
            ) : isGenerating ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-gray-400 animate-spin"></div>
                <p className="animate-pulse">AI is reading and synthesizing...</p>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <FileText className="w-12 h-12 mb-3 opacity-20" />
                <p>Your summary will appear here</p>
              </div>
            )}
          </div>
        </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};
