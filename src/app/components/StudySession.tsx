import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Timer, 
  Play, 
  Pause, 
  RotateCcw, 
  Coffee, 
  Brain, 
  Trophy,
  Volume2,
  VolumeX,
  Target
} from 'lucide-react';

export function StudySession() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'study' | 'break'>('study');
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleModeSwitch();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleModeSwitch = () => {
    if (mode === 'study') {
      setMode('break');
      setTimeLeft(5 * 60);
      setSessionsCompleted(s => s + 1);
    } else {
      setMode('study');
      setTimeLeft(25 * 60);
    }
    setIsActive(false);
  };

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'study' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (timeLeft / (mode === 'study' ? 25 * 60 : 5 * 60)) * 100;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-[3rem] border border-[#E2E8F0] shadow-sm overflow-hidden p-12 text-center space-y-12">
        <div className="flex items-center justify-between mb-8">
           <div className="flex gap-2">
              <button 
                onClick={() => { setMode('study'); setTimeLeft(25 * 60); setIsActive(false); }}
                className={`px-6 py-2 rounded-full font-bold transition-all ${mode === 'study' ? 'bg-[#4F46E5] text-white' : 'text-[#64748B] hover:bg-slate-50'}`}
              >
                Study Mode
              </button>
              <button 
                onClick={() => { setMode('break'); setTimeLeft(5 * 60); setIsActive(false); }}
                className={`px-6 py-2 rounded-full font-bold transition-all ${mode === 'break' ? 'bg-[#4F46E5] text-white' : 'text-[#64748B] hover:bg-slate-50'}`}
              >
                Break Time
              </button>
           </div>
           <button onClick={() => setIsMuted(!isMuted)} className="p-3 text-[#94A3B8] hover:text-[#4F46E5] transition-all">
              {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
           </button>
        </div>

        <div className="relative inline-flex items-center justify-center">
           {/* Progress Circle SVG */}
           <svg className="w-80 h-80 transform -rotate-90">
              <circle
                 cx="160" cy="160" r="150"
                 stroke="#F1F5F9" strokeWidth="12" fill="transparent"
              />
              <motion.circle
                 cx="160" cy="160" r="150"
                 stroke={mode === 'study' ? '#4F46E5' : '#10B981'}
                 strokeWidth="12" fill="transparent"
                 strokeDasharray={2 * Math.PI * 150}
                 initial={{ strokeDashoffset: 2 * Math.PI * 150 }}
                 animate={{ strokeDashoffset: (2 * Math.PI * 150) * (progress / 100) }}
                 transition={{ duration: 0.5 }}
                 strokeLinecap="round"
              />
           </svg>
           
           <div className="absolute flex flex-col items-center">
              <motion.span 
                key={timeLeft}
                initial={{ scale: 0.9, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-7xl font-black text-[#0F172A] tabular-nums"
              >
                 {formatTime(timeLeft)}
              </motion.span>
              <p className="text-[#64748B] font-bold uppercase tracking-widest mt-2">
                 {mode === 'study' ? 'Focus Session' : 'Relax & Recharge'}
              </p>
           </div>
        </div>

        <div className="flex items-center justify-center gap-6">
           <button 
              onClick={resetTimer}
              className="p-5 text-[#64748B] hover:bg-slate-50 rounded-2xl border border-slate-200 transition-all"
           >
              <RotateCcw className="w-8 h-8" />
           </button>
           <button 
              onClick={toggleTimer}
              className="w-24 h-24 bg-[#4F46E5] text-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-200 hover:scale-105 transition-all"
           >
              {isActive ? <Pause className="w-10 h-10 fill-white" /> : <Play className="w-10 h-10 fill-white ml-1" />}
           </button>
           <div className="p-5 bg-slate-50 rounded-2xl flex items-center gap-3 border border-slate-100">
              <Trophy className="w-6 h-6 text-amber-500" />
              <div className="text-left">
                 <p className="text-[10px] font-bold text-[#64748B] uppercase">Today's Streak</p>
                 <p className="text-lg font-black text-[#0F172A]">{sessionsCompleted} Units</p>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
           <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-4">
              <div className="bg-white p-3 rounded-2xl shadow-sm">
                 <Brain className="w-6 h-6 text-indigo-500" />
              </div>
              <div className="text-left">
                 <h4 className="text-sm font-bold">Deep Work</h4>
                 <p className="text-xs text-[#64748B]">Boosts neuroplasticity</p>
              </div>
           </div>
           <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-4">
              <div className="bg-white p-3 rounded-2xl shadow-sm">
                 <Coffee className="w-6 h-6 text-emerald-500" />
              </div>
              <div className="text-left">
                 <h4 className="text-sm font-bold">Smart Breaks</h4>
                 <p className="text-xs text-[#64748B]">Prevents mental fatigue</p>
              </div>
           </div>
           <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-4">
              <div className="bg-white p-3 rounded-2xl shadow-sm">
                 <Target className="w-6 h-6 text-amber-500" />
              </div>
              <div className="text-left">
                 <h4 className="text-sm font-bold">Clear Goals</h4>
                 <p className="text-xs text-[#64748B]">Increases task efficiency</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
