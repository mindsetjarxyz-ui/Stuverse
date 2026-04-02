import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Upload, Loader2, Sparkles, Copy, StopCircle, Play, Trash2, Save } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTranslation } from '../hooks/useTranslation';
import { useAppStore } from '../store/useAppStore';
import { useAuth } from '../contexts/AuthContext';
import { createSavedItem } from '../services/savedItems';
import { generateNotesFromFile } from '../services/ai';
import { supabase } from '../supabaseClient';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { cn } from '../lib/utils';

export const VoiceToNotes: React.FC = () => {
  const { t } = useTranslation();
  const { useCredits, addRecentTool, showAlert, language } = useAppStore();
  const { user } = useAuth();
  
  const [isRecording, setIsRecording] = useState(false);
  const [fileBlob, setFileBlob] = useState<Blob | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [uploadedFilePath, setUploadedFilePath] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notes, setNotes] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);

  const languageName = language === 'bn' ? 'Bengali' : language === 'hi' ? 'Hindi' : 'English';
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    addRecentTool('Voice-to-Notes');
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [addRecentTool]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setFileBlob(blob);
        setFileUrl(URL.createObjectURL(blob));
        setUploadedFilePath(null);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Failed to start recording', err);
      showAlert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = [
      'audio/', 
      'video/', 
      'application/pdf', 
      'text/plain', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const isValid = validTypes.some(type => file.type.startsWith(type) || file.type === type);

    if (!isValid) {
      showAlert('Please upload an audio, video, PDF, or text document.');
      return;
    }

    setFileBlob(file);
    setFileUrl(URL.createObjectURL(file));
    setUploadedFilePath(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleGenerate = async () => {
    if (!fileBlob) return;

    const cost = 2;
    if (!useCredits(cost)) {
      showAlert(t('insufficientCredits'));
      return;
    }

    setIsGenerating(true);
    setNotes('');

    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    try {
      if (user && !uploadedFilePath && fileBlob) {
        const ext = fileBlob.type.split('/')[1]?.split(';')[0] || 'file';
        const uuid = crypto.randomUUID();
        const path = `${user.id}/voice_note/${uuid}.${ext}`;
        const { data, error } = await supabase.storage.from('app-files').upload(path, fileBlob);
        if (!error && data) {
          setUploadedFilePath(data.path);
        }
      }

      if (fileBlob) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const base64Data = (e.target?.result as string).split(',')[1];
          const result = await generateNotesFromFile(base64Data, fileBlob.type, languageName);
          setNotes(result || 'Failed to generate notes.');
          setIsGenerating(false);
        };
        reader.readAsDataURL(fileBlob);
      }
    } catch (error) {
      console.error(error);
      setNotes('Sorry, an error occurred while generating notes.');
      setIsGenerating(false);
    }
  };

  const clearFile = () => {
    setFileBlob(null);
    setFileUrl(null);
    setUploadedFilePath(null);
    setNotes('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async () => {
    if (!user || !notes) return;
    setIsSaving(true);
    try {
      const title = `Voice Note: ${new Date().toLocaleString()}`;
      await createSavedItem(user.id, 'voice_note', title, notes, uploadedFilePath || undefined);
      showAlert('Voice note saved successfully!');
    } catch (error) {
      console.error('Error saving voice note:', error);
      showAlert('Failed to save voice note.');
    } finally {
      setIsSaving(false);
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
          <Mic className="w-8 h-8 text-gray-300" />
        </motion.div>
        <h1 className="text-3xl font-heading font-bold text-white">Voice-to-Notes</h1>
        <p className="text-gray-400">Record lectures or upload audio, video, or documents to get perfectly structured notes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="space-y-6">
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border-glass rounded-2xl bg-bg-primary/50 space-y-6">
              {isRecording ? (
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping"></div>
                    <div className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center relative z-10">
                      <StopCircle className="w-10 h-10 text-white cursor-pointer" onClick={stopRecording} />
                    </div>
                  </div>
                  <div className="text-2xl font-mono text-white font-bold">{formatTime(recordingTime)}</div>
                  <p className="text-red-400 animate-pulse font-medium">Recording Lecture...</p>
                </div>
              ) : fileUrl ? (
                <div className="w-full space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <Play className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">File Ready</p>
                        <p className="text-xs text-gray-500">{(fileBlob?.size || 0) / 1024 / 1024 < 1 ? `${Math.round((fileBlob?.size || 0) / 1024)} KB` : `${((fileBlob?.size || 0) / 1024 / 1024).toFixed(2)} MB`}</p>
                      </div>
                    </div>
                    <button 
                      onClick={clearFile}
                      className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  {fileBlob?.type.startsWith('audio/') && (
                    <audio src={fileUrl} controls className="w-full h-10" />
                  )}
                  {fileBlob?.type.startsWith('video/') && (
                    <video src={fileUrl} controls className="w-full h-40 rounded-lg bg-black/20" />
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-6 w-full">
                  <button 
                    onClick={startRecording}
                    className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all group"
                  >
                    <Mic className="w-10 h-10 text-gray-400 group-hover:text-white transition-colors" />
                  </button>
                  <p className="text-gray-400 text-center">Click to start recording or upload a file below</p>
                  
                  <div className="w-full pt-4 border-t border-border-glass">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="audio/*,video/*,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleFileUpload}
                    />
                    <Button 
                      variant="secondary" 
                      className="w-full"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload File
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Button 
                className="w-full bg-white text-black hover:bg-gray-200 border-none"
                onClick={handleGenerate}
                disabled={isGenerating || !fileBlob || isRecording}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Notes
                  </>
                )}
              </Button>
              <p className="text-[10px] text-gray-500 text-center">Generation consumes 2 credits</p>
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
              <h3 className="font-heading font-semibold text-white">Lecture Notes</h3>
              {notes && (
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    className="h-8 px-3 text-xs bg-white/5 hover:bg-white/10"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Save className="w-3 h-3 mr-1" />}
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="h-8 px-3 text-xs bg-white/5 hover:bg-white/10"
                    onClick={() => {
                      navigator.clipboard.writeText(notes);
                      showAlert('Copied to clipboard!');
                    }}
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </Button>
                </div>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {notes ? (
                <div className="markdown-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{notes}</ReactMarkdown>
                </div>
              ) : isGenerating ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                  <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-gray-400 animate-spin"></div>
                  <p className="animate-pulse text-center">AI is listening and transcribing...<br/><span className="text-xs opacity-60">This may take a minute for longer recordings</span></p>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <Mic className="w-12 h-12 mb-3 opacity-20" />
                  <p>Your lecture notes will appear here</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};
