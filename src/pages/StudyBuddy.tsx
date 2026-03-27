import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Paperclip, Image as ImageIcon, FileText, Loader2, Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTranslation } from '../hooks/useTranslation';
import { useAppStore } from '../store/useAppStore';
import { analyzeDocumentStream, generateCompletionStream } from '../services/ai';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  file?: { name: string; type: 'pdf' | 'image'; data: string; mimeType: string };
}

export const StudyBuddy: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { credits, useCredits, addRecentTool, showAlert, language } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ name: string; type: 'pdf' | 'image'; data: string; mimeType: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const languageName = language === 'bn' ? 'Bengali' : language === 'hi' ? 'Hindi' : 'English';

  useEffect(() => {
    addRecentTool('Study Buddy');
  }, [addRecentTool]);

  // Load or create chat session
  useEffect(() => {
    if (!user) return;

    const fetchChat = async () => {
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .eq('userId', user.id)
        .order('updatedAt', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setChatId(data.id);
      } else {
        // Create initial chat session
        const { data: newChat, error: createError } = await supabase
          .from('chats')
          .insert({
            userId: user.id,
            title: 'New Chat'
          })
          .select()
          .single();
        
        if (newChat) setChatId(newChat.id);
      }
    };

    fetchChat();
  }, [user]);

  // Load messages for current chat
  useEffect(() => {
    if (!chatId) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chatId', chatId)
        .order('timestamp', { ascending: true });

      if (data) {
        if (data.length === 0) {
          setMessages([{ id: 'welcome', role: 'ai', content: 'Hello! I am your Study Buddy. Ask me anything, or upload a PDF/Image for analysis.' }]);
        } else {
          setMessages(data);
        }
      }
    };

    fetchMessages();
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = (event.target?.result as string).split(',')[1];
      setSelectedFile({
        name: file.name,
        type: file.type.includes('pdf') ? 'pdf' : 'image',
        data: base64Data,
        mimeType: file.type
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async () => {
    if (!input.trim() && !selectedFile) return;
    if (!user) return;

    let currentChatId = chatId;
    if (!currentChatId) {
      // Create initial chat session
      const { data: newChat, error } = await supabase
        .from('chats')
        .insert({
          userId: user.id,
          title: 'New Chat'
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error creating chat (falling back to local):', error);
        currentChatId = `local-chat-${Date.now()}`;
      } else {
        currentChatId = newChat.id;
      }
      setChatId(currentChatId);
    }
    
    const cost = 1;
    
    if (credits < cost) {
      showAlert(t('insufficientCredits'));
      return;
    }

    const promptText = input.trim();
    const currentFile = selectedFile;

    // Optimistically update UI with user message
    const tempUserMsgId = `temp-user-${Date.now()}`;
    const optimisticUserMsg: Message = {
      id: tempUserMsgId,
      role: 'user',
      content: promptText || 'Analyze this document.',
      file: currentFile || undefined,
    };
    
    setMessages(prev => {
      const filtered = prev.filter(m => m.id !== 'welcome');
      return [...filtered, optimisticUserMsg];
    });

    setInput('');
    setSelectedFile(null);
    setIsTyping(true);

    // Deduct credits in Supabase
    const { data: userData } = await supabase
      .from('users')
      .select('credits')
      .eq('id', user.id)
      .single();
      
    if (userData) {
      const currentCredits = userData.credits || 0;
      await supabase
        .from('users')
        .update({ credits: Math.max(0, currentCredits - cost) })
        .eq('id', user.id);
      useCredits(cost); // Sync local state
    }

    // Save user message to Supabase
    const { data: userMsg, error: msgError } = await supabase
      .from('messages')
      .insert({
        chatId: currentChatId,
        role: 'user',
        content: promptText || 'Analyze this document.',
        file: currentFile || null,
        timestamp: new Date().toISOString()
      })
      .select()
      .single();

    if (msgError) {
      console.error('Error saving message:', msgError);
    } else if (userMsg) {
      // Replace temp message with real one
      setMessages(prev => prev.map(m => m.id === tempUserMsgId ? userMsg : m));
    }

    // Update chat title if it's the first message
    if (messages && messages.length <= 1 && promptText) {
      await supabase
        .from('chats')
        .update({
          title: promptText.slice(0, 30) + (promptText.length > 30 ? '...' : ''),
          updatedAt: new Date().toISOString()
        })
        .eq('id', currentChatId);
    } else if (currentChatId) {
      await supabase
        .from('chats')
        .update({
          updatedAt: new Date().toISOString()
        })
        .eq('id', currentChatId);
    }

    // Prepare history for Gemini, ensuring alternating roles
    const rawHistory = (messages || [])
      .filter(m => m.id !== 'welcome')
      .map(m => ({
        role: m.role === 'user' ? 'user' as const : 'model' as const,
        parts: [{ text: m.content }]
      }));
      
    const history: typeof rawHistory = [];
    for (const msg of rawHistory) {
      if (history.length > 0 && history[history.length - 1].role === msg.role) {
        history[history.length - 1].parts[0].text += '\n\n' + msg.parts[0].text;
      } else {
        history.push(msg);
      }
    }
    
    // Ensure history doesn't end with 'user' because we are about to append a 'user' message
    if (history.length > 0 && history[history.length - 1].role === 'user') {
      history.push({ role: 'model', parts: [{ text: 'Acknowledged.' }] });
    }
    
    // Ensure history starts with 'user'
    if (history.length > 0 && history[0].role === 'model') {
      history.unshift({ role: 'user', parts: [{ text: 'Hello' }] });
    }

    try {
      let stream;
      if (currentFile) {
        stream = analyzeDocumentStream(currentFile.data, currentFile.mimeType, promptText || 'Analyze this document.', history, languageName);
      } else {
        stream = generateCompletionStream(promptText, history, languageName);
      }

      let fullResponse = '';
      
      // Create a temporary AI message for streaming
      const tempAiMsgId = `temp-ai-${Date.now()}`;
      setMessages(prev => [...prev, { id: tempAiMsgId, role: 'ai', content: '' }]);
      
      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages(prev => prev.map(m => m.id === tempAiMsgId ? { ...m, content: fullResponse } : m));
      }

      // Save AI response to Supabase
      const { data: aiMsg } = await supabase
        .from('messages')
        .insert({
          chatId: currentChatId,
          role: 'ai',
          content: fullResponse,
          timestamp: new Date().toISOString()
        })
        .select()
        .single();
        
      if (aiMsg) {
        setMessages(prev => prev.map(m => m.id === tempAiMsgId ? aiMsg : m));
      }

    } catch (error) {
      console.error(error);
      const errorText = 'Sorry, I encountered an error processing your request.';
      
      // Save error response to Supabase
      const { data: errorMsg } = await supabase
        .from('messages')
        .insert({
          chatId: currentChatId,
          role: 'ai',
          content: errorText,
          timestamp: new Date().toISOString()
        })
        .select()
        .single();
        
      setMessages(prev => {
        // Remove the temp streaming message if it exists, add the error message
        const filtered = prev.filter(m => !m.id.toString().startsWith('temp-ai-'));
        return [...filtered, errorMsg || { id: `local-err-${Date.now()}`, role: 'ai', content: errorText }];
      });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col h-full max-w-4xl mx-auto glass-panel overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-border-glass bg-bg-secondary/50 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
          <Bot className="w-6 h-6 text-gray-300" />
        </div>
        <div>
          <h2 className="font-heading font-semibold text-white">Study Buddy</h2>
          <p className="text-xs text-gray-400">Always here to help</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {(messages || []).map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex gap-4 max-w-[85%]",
              msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border",
              msg.role === 'user' 
                ? "bg-white/10 border-white/20" 
                : "bg-white/5 border-white/10"
            )}>
              {msg.role === 'user' ? <User className="w-4 h-4 text-gray-300" /> : <Bot className="w-4 h-4 text-gray-400" />}
            </div>
            <div className={cn(
              "p-4 rounded-2xl",
              msg.role === 'user' 
                ? "bg-white/10 border border-white/20 text-gray-100" 
                : "bg-white/5 border border-white/10 text-gray-300"
            )}>
              {msg.file && (
                <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-black/20 border border-white/5 text-sm">
                  {msg.file.type === 'pdf' ? <FileText className="w-4 h-4 text-red-400" /> : <ImageIcon className="w-4 h-4 text-blue-400" />}
                  <span className="truncate max-w-[200px] text-gray-300">{msg.file.name}</span>
                </div>
              )}
              {msg.content ? (
                <div className="markdown-body text-sm">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                msg.role === 'ai' && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              )}
            </div>
          </motion.div>
        ))}
        {isTyping && messages && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
          <div className="flex gap-4 max-w-[85%]">
            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-gray-400" />
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border-glass bg-bg-secondary/50">
        <AnimatePresence>
          {selectedFile && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-white/5 border border-white/10 w-fit"
            >
              {selectedFile.type === 'pdf' ? <FileText className="w-4 h-4 text-red-400" /> : <ImageIcon className="w-4 h-4 text-blue-400" />}
              <span className="text-sm text-gray-300 truncate max-w-[200px]">{selectedFile.name}</span>
              <button 
                onClick={() => setSelectedFile(null)}
                className="ml-2 text-gray-500 hover:text-red-400"
              >
                &times;
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex items-end gap-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*,application/pdf"
            onChange={handleFileChange}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-gray-200 transition-colors shrink-0"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={t('typeMessage')}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500/50 resize-none min-h-[48px] max-h-[120px]"
            rows={1}
          />
          <Button 
            onClick={handleSend}
            disabled={(!input.trim() && !selectedFile) || isTyping}
            className="shrink-0 h-[48px] w-[48px] p-0 rounded-xl bg-white text-black hover:bg-gray-200"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        <p className="text-[10px] text-gray-500 mt-2 text-center">Generation consumes 1 credit</p>
      </div>
    </motion.div>
  );
};
