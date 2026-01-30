import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, BookOpen, Lightbulb, User, MessageSquare, Loader2, Search } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { askGemini } from '../../api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function TutorMode() {
  const [subject, setSubject] = useState('');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your AI Tutor. Tell me which subject you're working on and what you're struggling with.",
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || !subject.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: `[${subject}] ${input}` };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Get token from localStorage if you want to support authenticated requests
      const token = localStorage.getItem('token') || undefined;

      // Send structured intent so server builds a tutor-specific prompt
      const response = await askGemini({ module: 'tutor', subject, input: input }, token);
      
      // If backend indicates token expired, sign the user out and reload to show login
      if (response && typeof response.text === 'string' && response.text.includes('AI features require sign-in')) {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.text,
        }]);
        try { localStorage.removeItem('studyDoc_user'); localStorage.removeItem('token'); } catch (e) { /* ignore */ }
        // Give user a moment to read the message, then reload to show the Auth screen
        setTimeout(() => window.location.reload(), 800);
        return;
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
      }]);
    } catch (error: any) {
      console.error('Error asking Gemini:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I'm sorry, I encountered an error: ${error.message || 'Unknown error'}. Please try again later.`,
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col bg-white rounded-[2.5rem] border border-[#E2E8F0] shadow-sm overflow-hidden">
      <div className="px-8 py-6 border-b border-[#E2E8F0] bg-[#F8FAFC] space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl text-white">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-[#0F172A]">AI Doubt Solver</h3>
            <p className="text-xs text-[#64748B]">Instant academic assistance</p>
          </div>
        </div>
        
        <div className="flex gap-2">
           <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input 
                 value={subject} onChange={(e) => setSubject(e.target.value)}
                 placeholder="Enter Subject (e.g. Physics)"
                 className="w-full pl-10 pr-4 py-3 bg-white border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20"
              />
           </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 bg-white">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
              </div>
              <div className={`p-5 rounded-2xl ${
                msg.role === 'user' ? 'bg-[#4F46E5] text-white rounded-tr-none shadow-lg shadow-indigo-100' : 'bg-slate-50 text-[#1E293B] rounded-tl-none border border-slate-100'
              }`}>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {msg.role === 'user' ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {isTyping && <Loader2 className="w-5 h-5 animate-spin text-indigo-500 mx-auto" />}
      </div>

      <div className="p-6 border-t border-[#E2E8F0] bg-white">
        <div className="relative flex items-center gap-2 max-w-3xl mx-auto">
          <input
            value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Describe your doubt in detail..."
            className="flex-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || !subject.trim()}
            className="bg-[#4F46E5] text-white p-4 rounded-xl hover:bg-[#4338CA] transition-all disabled:opacity-50 shadow-lg shadow-indigo-100"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
