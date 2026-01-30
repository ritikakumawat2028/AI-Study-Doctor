import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Target, 
  Clock, 
  ChevronRight, 
  Sparkles, 
  TrendingUp, 
  Award,
  Calendar,
  Timer,
  HeartPulse,
  Brain
} from 'lucide-react';
import { getStats, getStudyPlan } from '../../api';

interface DashboardProps {
  setActiveView: (view: any) => void;
  studentName: string;
}

export function Dashboard({ setActiveView, studentName }: DashboardProps) {
  const [hasPlan, setHasPlan] = useState(false);
  const [stats, setStats] = useState({
    studyHours: '0h',
    conceptsSolved: '0',
    avgEvaluation: '0',
    studyStreak: '0d'
  });
  const [lastCheckIn, setLastCheckIn] = useState<any>(null);
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const planData = await getStudyPlan(token);
          if (planData && planData.schedule && planData.schedule.length > 0) {
            setHasPlan(true);
          }
          if (planData && planData.examDate) {
            const today = new Date();
            const exam = new Date(planData.examDate);
            const diffTime = Math.abs(exam.getTime() - today.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            setDaysLeft(diffDays);
          }
          
          const statsData = await getStats(token);
          setStats({
            studyHours: statsData.studyHours,
            conceptsSolved: statsData.conceptsSolved,
            avgEvaluation: statsData.avgEvaluation,
            studyStreak: statsData.studyStreak
          });
          if (statsData.lastCheckIn) {
            setLastCheckIn(statsData.lastCheckIn);
          }
        } catch (error) {
          console.error('Error loading dashboard data:', error);
        }
      } else {
        // Fallback to local storage if no token (or just clear state)
        const savedPlan = localStorage.getItem('studyDoc_plan');
        if (savedPlan) setHasPlan(true);
        
        const savedCheckIn = localStorage.getItem('studyDoc_lastCheckIn');
        if (savedCheckIn) setLastCheckIn(JSON.parse(savedCheckIn));
      }
    };
    
    loadData();
  }, []);

  const statItems = [
    { label: 'Study Hours', value: stats.studyHours, icon: Clock, color: 'bg-blue-50 text-blue-600' },
    { label: 'Concepts Solved', value: stats.conceptsSolved, icon: BookOpen, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Avg. Evaluation', value: stats.avgEvaluation, icon: Target, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Study Streak', value: stats.studyStreak, icon: Award, color: 'bg-amber-50 text-amber-600' },
  ];

  const quickActions = [
    { id: 'session', title: 'Start Focus Session', desc: 'Active Pomodoro study timer', icon: Timer, color: 'bg-indigo-600 text-white' },
    { id: 'tutor', title: 'Solve a Doubt', desc: 'Ask AI about any concept', icon: Sparkles, color: 'bg-white border-indigo-100 border text-[#0F172A]' },
    { id: 'wellness', title: 'Wellness Check', desc: 'Monitor your stress & mood', icon: HeartPulse, color: 'bg-white border-rose-100 border text-[#0F172A]' },
  ];

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[3rem] bg-[#0F172A] p-12 text-white min-h-[320px] flex flex-col justify-center shadow-2xl">
        <div className="relative z-10 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
             <span className="px-4 py-1.5 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-bold uppercase tracking-widest border border-indigo-500/30">Active Student</span>
             <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">• Physics Exam Prep</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="text-5xl font-black mb-6 leading-tight">
            Ready to ace your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">goals</span>, {studentName}?
          </motion.h1>
          <p className="text-slate-400 text-xl mb-10 max-w-2xl leading-relaxed">
            You've completed <span className="text-emerald-400 font-bold">88%</span> of your weekly targets. {hasPlan ? 'Your Physics session starts in 15 mins.' : "Let's create your first study plan!"}
          </p>
          <div className="flex flex-wrap gap-4">
             <button onClick={() => setActiveView(hasPlan ? 'session' : 'planner')} className="bg-[#4F46E5] hover:bg-[#4338CA] px-8 py-4 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-xl shadow-indigo-900/40">
               {hasPlan ? 'Go to Session' : 'Create Study Plan'} <ChevronRight className="w-5 h-5" />
             </button>
             <button onClick={() => setActiveView('wellness')} className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-8 py-4 rounded-2xl font-bold transition-all flex items-center gap-2">
               Mental Health Check
             </button>
          </div>
        </div>
        {/* Abstract Background */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full translate-x-1/4 -translate-y-1/4"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/5 blur-[100px] rounded-full -translate-x-1/4 translate-y-1/4"></div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statItems.map((stat, idx) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="bg-white p-8 rounded-[2rem] border border-[#E2E8F0] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${stat.color} group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-7 h-7" />
            </div>
            <p className="text-[#64748B] text-sm font-bold uppercase tracking-wider mb-1">{stat.label}</p>
            <p className="text-3xl font-black text-[#0F172A]">{stat.value}</p>
          </motion.div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <h3 className="text-2xl font-black text-[#0F172A]">Action Center</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {quickActions.map((action) => (
              <button key={action.id} onClick={() => setActiveView(action.id)} className={`flex flex-col items-start p-8 rounded-[2.5rem] transition-all text-left shadow-sm hover:shadow-2xl hover:-translate-y-1 ${action.color} group`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${action.id === 'session' ? 'bg-white/20' : 'bg-slate-50'} group-hover:scale-110 transition-transform`}>
                  <action.icon className={`w-6 h-6 ${action.id === 'session' ? 'text-white' : 'text-slate-600'}`} />
                </div>
                <h4 className="text-xl font-bold mb-2">{action.title}</h4>
                <p className={`text-sm ${action.id === 'session' ? 'text-indigo-100' : 'text-[#64748B]'}`}>{action.desc}</p>
              </button>
            ))}
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-8 rounded-[2.5rem] text-white flex flex-col justify-between shadow-xl shadow-amber-100">
               <div>
                  <h4 className="text-xl font-bold mb-2">Exam Countdown</h4>
                  <p className="text-amber-50 text-sm">Your finals are approaching!</p>
               </div>
               <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-5xl font-black">{daysLeft}</span>
                  <span className="text-lg font-bold opacity-80 uppercase tracking-widest">Days Left</span>
               </div>
            </div>
          </div>
        </div>

        {/* Wellness Summary */}
        <div className="bg-white p-10 rounded-[3rem] border border-[#E2E8F0] shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-2xl font-black text-[#0F172A]">Health Status</h3>
             <button onClick={() => setActiveView('wellness')} className="text-indigo-600 font-bold text-xs uppercase tracking-widest hover:underline">Edit</button>
          </div>
          
          <div className="space-y-10 flex-1 flex flex-col justify-center">
             <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-4xl">
                   {lastCheckIn?.mood > 7 ? '😊' : lastCheckIn?.mood > 4 ? '😐' : '😟'}
                </div>
                <div>
                   <p className="text-xs font-bold text-[#64748B] uppercase tracking-widest mb-1">Current Mood</p>
                   <h4 className="text-xl font-bold">{lastCheckIn ? (lastCheckIn.mood > 7 ? 'Feeling Great' : lastCheckIn.mood > 4 ? 'Steady' : 'Need Support') : 'Unchecked'}</h4>
                </div>
             </div>

             <div className="space-y-2">
                <div className="flex justify-between items-end">
                   <p className="text-xs font-bold text-[#64748B] uppercase tracking-widest">Stress Level</p>
                   <span className="text-sm font-black text-[#0F172A]">{lastCheckIn?.stress || 0}/10</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }} 
                     animate={{ width: `${(lastCheckIn?.stress || 0) * 10}%` }} 
                     className={`h-full rounded-full ${lastCheckIn?.stress > 7 ? 'bg-rose-500' : 'bg-indigo-500'}`} 
                   />
                </div>
             </div>

             <div className="p-6 bg-[#F8FAFC] rounded-[2rem] border border-slate-100 italic text-sm text-[#64748B] leading-relaxed relative">
                <Quote className="absolute -top-3 -left-1 w-8 h-8 text-indigo-100" />
                "{lastCheckIn ? "Keep monitoring your sleep quality, Alex. Consistency is key!" : "Alex, taking care of your mind is as important as studying. How are you?"}"
             </div>
          </div>

          <button onClick={() => setActiveView('wellness')} className="w-full py-4 bg-[#0F172A] text-white rounded-2xl font-bold mt-8 hover:bg-black transition-all">
             Start Daily Check-in
          </button>
        </div>
      </div>
    </div>
  );
}

function Quote({ className }: { className?: string }) {
   return (
      <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
         <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H16.017C14.9124 8 14.017 7.10457 14.017 6V3C14.017 2.44772 14.4647 2 15.017 2H21.017C21.5693 2 22.017 2.44772 22.017 3V15C22.017 18.3137 19.3307 21 16.017 21H15.017C14.4647 21 14.017 20.5523 14.017 20V21ZM2.017 21L2.017 18C2.017 16.8954 2.91243 16 4.017 16H7.017C7.56928 16 8.017 15.5523 8.017 15V9C8.017 8.44772 7.56928 8 7.017 8H4.017C2.91243 8 2.017 7.10457 2.017 6V3C2.017 2.44772 2.46472 2 3.017 2H9.017C9.56928 2 10.017 2.44772 10.017 3V15C10.017 18.3137 7.33072 21 4.017 21H3.017C2.46472 21 2.017 20.5523 2.017 20V21Z" />
      </svg>
   );
}
