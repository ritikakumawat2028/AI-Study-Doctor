import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HeartPulse, 
   MessageSquare, 
    Send, 
   User, 
  Loader2, 
  Info, 
  Moon, 
  Sun, 
  Coffee,
  Smile,
  Frown,
  AlertCircle
} from 'lucide-react';

import { askGemini, saveWellnessLog } from '../../api';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function WellnessSupport() {
  const [mood, setMood] = useState(5);
  const [stress, setStress] = useState(5);
  const [sleepHours, setSleepHours] = useState(7);
  const [sleepQuality, setSleepQuality] = useState('Good');
  const [notes, setNotes] = useState('');
  const [isCheckInComplete, setIsCheckInComplete] = useState(false);

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm here to support your study journey and help you manage academic stress. How are you feeling about your workload today?",
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSaveCheckIn = async () => {
    setIsCheckInComplete(true);
    const wellnessData = { mood, stress, sleepHours, sleepQuality, notes, date: new Date().toISOString() };
    
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await saveWellnessLog(wellnessData, token);
      } else {
        localStorage.setItem('studyDoc_lastCheckIn', JSON.stringify(wellnessData));
      }
    } catch (error) {
      console.error('Error saving check-in:', error);
      // Fallback to local storage if API fails
      localStorage.setItem('studyDoc_lastCheckIn', JSON.stringify(wellnessData));
    }

    // Try to get a short AI-tailored message after saving the check-in
    try {
      const token = localStorage.getItem('token') || undefined;
      const aiResp = await askGemini({ module: 'wellness', intent: 'post_checkin', input: JSON.stringify(wellnessData) }, token);

      // If AI says sign-in is required, clear auth and reload to show login
      if (aiResp && typeof aiResp.text === 'string' && aiResp.text.includes('AI features require sign-in')) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: aiResp.text
        }]);
        try { localStorage.removeItem('studyDoc_user'); localStorage.removeItem('token'); } catch (e) { }
        setTimeout(() => window.location.reload(), 800);
        return;
      }

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: aiResp.text || `Thanks for the check-in! I noticed your stress level is at ${stress}/10. Take a 5-minute breather every hour.`
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Thanks for the check-in! I noticed your stress level is at ${stress}/10. I've adjusted your study recommendations for today. Remember to take a 5-minute breather every hour.`
      }]);
    }
  };

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;
    
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMsg]);
    if (!textOverride) setInput('');
    setIsTyping(true);
    
    try {
      const token = localStorage.getItem('token') || undefined;

      // Send a structured intent so server can apply the wellness module prompt template
      const response = await askGemini({ module: 'wellness', input: textToSend }, token);

      if (response && typeof response.text === 'string' && response.text.includes('AI features require sign-in')) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: response.text
        }]);
        try { localStorage.removeItem('studyDoc_user'); localStorage.removeItem('token'); } catch (e) { }
        setTimeout(() => window.location.reload(), 800);
        return;
      }

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: response.text
      }]);
    } catch (error) {
      console.error('Error asking Gemini:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now, but please know that your well-being is important. Take a deep breath."
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 h-full items-start">
      {/* Daily Check-in UI */}
      <section className="bg-white rounded-[2.5rem] border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col h-full">
        <div className="p-8 border-b border-slate-50 bg-[#F8FAFC] flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="bg-rose-500 p-2 rounded-xl text-white">
                 <HeartPulse className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-[#0F172A]">Daily Check-in</h3>
           </div>
        </div>

        <div className="p-8 space-y-8 flex-1 overflow-y-auto">
           <p className="text-[#64748B]">How are you feeling today? This helps us adjust your study plan to protect your wellbeing.</p>
           
           <div className="space-y-6">
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-[#1E293B] flex items-center gap-2">
                       <Smile className="w-4 h-4 text-blue-500" /> Mood
                    </label>
                    <span className="text-2xl">
                       {mood > 7 ? '😊' : mood > 4 ? '😐' : '😟'}
                    </span>
                 </div>
                 <input 
                    type="range" min="1" max="10" value={mood} 
                    onChange={(e) => setMood(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                 />
                 <div className="flex justify-between text-[10px] font-bold text-[#94A3B8] uppercase">
                    <span>Very Bad</span>
                    <span>Excellent</span>
                 </div>
              </div>

              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-[#1E293B] flex items-center gap-2">
                       <AlertCircle className="w-4 h-4 text-amber-500" /> Stress Level
                    </label>
                    <span className="text-2xl font-black text-amber-600">{stress}</span>
                 </div>
                 <input 
                    type="range" min="1" max="10" value={stress} 
                    onChange={(e) => setStress(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-amber-500"
                 />
                 <div className="flex justify-between text-[10px] font-bold text-[#94A3B8] uppercase">
                    <span>Not Stressed</span>
                    <span>Very Stressed</span>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-sm font-bold text-[#1E293B]">Hours Slept</label>
                    <input 
                       type="number" value={sleepHours} 
                       onChange={(e) => setSleepHours(parseInt(e.target.value))}
                       className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-sm font-bold text-[#1E293B]">Sleep Quality</label>
                    <select 
                       value={sleepQuality} onChange={(e) => setSleepQuality(e.target.value)}
                       className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20"
                    >
                       <option>Excellent</option>
                       <option>Good</option>
                       <option>Fair</option>
                       <option>Poor</option>
                    </select>
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-sm font-bold text-[#1E293B]">Additional Notes (Optional)</label>
                 <textarea 
                    value={notes} onChange={(e) => setNotes(e.target.value)}
                    placeholder="Anything on your mind? Share your thoughts..."
                    className="w-full h-32 px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 resize-none"
                 />
              </div>
           </div>

           <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
              <p className="text-[10px] text-blue-700 font-bold uppercase mb-1">Important Note</p>
              <p className="text-[11px] text-blue-600 leading-tight">We do not provide medical diagnosis, only wellness suggestions to support your studies.</p>
           </div>

           <button 
              onClick={handleSaveCheckIn}
              className="w-full bg-[#4F46E5] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#4338CA] transition-all"
           >
              Save Check-in
           </button>
        </div>
      </section>

      {/* Chat / AI Mentor UI */}
      <section className="bg-white rounded-[2.5rem] border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col h-full min-h-[600px]">
        <div className="p-6 border-b border-slate-50 flex items-center gap-3">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
           <span className="text-sm font-bold text-[#0F172A]">Wellness Mentor</span>
        </div>

        <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-[#F8FAFC]/50" ref={scrollRef}>
           {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                 <div className={`max-w-[85%] p-4 rounded-2xl ${
                    msg.role === 'user' ? 'bg-[#4F46E5] text-white rounded-tr-none' : 'bg-white border border-slate-200 text-[#1E293B] rounded-tl-none shadow-sm'
                 }`}>
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                 </div>
              </div>
           ))}
           {isTyping && <div className="text-xs text-slate-400 font-bold italic animate-pulse">Mentor is typing...</div>}
        </div>

        <div className="p-6 border-t border-slate-100 bg-white">
           <div className="mb-3 flex flex-wrap gap-2">
              {['I feel stressed', 'Need motivation', 'Procrastinating', 'Feeling overwhelmed', 'Need a break'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSend(suggestion)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs rounded-full hover:bg-indigo-100 hover:text-indigo-700 transition-all font-medium"
                >
                  {suggestion}
                </button>
              ))}
           </div>
           <div className="flex gap-2">
              <input 
                 value={input} onChange={(e) => setInput(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                 placeholder="Message your wellness mentor..."
                 className="flex-1 px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
              <button 
                 onClick={() => handleSend()}
                 className="p-3 bg-[#4F46E5] text-white rounded-xl hover:bg-[#4338CA] transition-all"
              >
                 <Send className="w-5 h-5" />
              </button>
           </div>
        </div>
      </section>
    </div>
  );
}