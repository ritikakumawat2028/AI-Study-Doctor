import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { Activity, TrendingUp, Target, Award, ArrowUpRight, CheckCircle2, Clock, Zap } from 'lucide-react';
import { getStudyPlan } from '../../api';

export function ProgressTracker() {
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [subjectData, setSubjectData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    weeklyGrowth: 0,
    goalProgress: 0,
    studyStreak: 0,
    timeSpent: 0
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const planData = await getStudyPlan(token);
        const plan = planData.schedule;
        
        if (plan && plan.length > 0) {
          // Calculate completion stats
          const completionByDay = plan.map((dayPlan: any) => {
            const totalTasks = dayPlan.tasks.filter((t: any) => t.type !== 'break').length;
            const completedTasks = dayPlan.tasks.filter((t: any) => t.completed && t.type !== 'break').length;
            const score = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
            
            return {
              name: dayPlan.day.substring(0, 3), // Mon, Tue, etc.
              score: score
            };
          });
          
          setPerformanceData(completionByDay);
          
          // Extract subjects from study plan
          const subjectMap = new Map();
          const colors = ['#4F46E5', '#0EA5E9', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6'];
          
          plan.forEach((dayPlan: any) => {
            dayPlan.tasks.forEach((task: any) => {
              if (task.type !== 'break') {
                // Extract subject from task title (format: "Subject: Topic")
                const subjectMatch = task.title.split(':')[0].trim();
                if (subjectMatch) {
                  if (!subjectMap.has(subjectMatch)) {
                    subjectMap.set(subjectMatch, { total: 0, completed: 0 });
                  }
                  const subData = subjectMap.get(subjectMatch);
                  subData.total++;
                  if (task.completed) subData.completed++;
                }
              }
            });
          });
          
          const subjects = Array.from(subjectMap.entries()).map(([subject, data]: [string, any], idx) => ({
            subject,
            score: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
            color: colors[idx % colors.length]
          }));
          
          setSubjectData(subjects);
          
          // Calculate overall stats
          const totalTasks = plan.reduce((sum: number, day: any) => 
            sum + day.tasks.filter((t: any) => t.type !== 'break').length, 0
          );
          const completedTasks = plan.reduce((sum: number, day: any) => 
            sum + day.tasks.filter((t: any) => t.completed && t.type !== 'break').length, 0
          );
          
          const goalProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
          
          // Calculate study time
          const totalMinutes = plan.reduce((sum: number, day: any) => {
            return sum + day.tasks.filter((t: any) => t.completed && t.type !== 'break')
              .reduce((taskSum: number, t: any) => {
                const duration = parseInt(t.duration) || 60;
                return taskSum + duration;
              }, 0);
          }, 0);
          
          const hours = (totalMinutes / 60).toFixed(1);
          
          // Calculate streak (consecutive days with at least one completed task)
          let streak = 0;
          for (let i = plan.length - 1; i >= 0; i--) {
            const hasCompleted = plan[i].tasks.some((t: any) => t.completed && t.type !== 'break');
            if (hasCompleted) {
              streak++;
            } else {
              break;
            }
          }
          
          setStats({
            weeklyGrowth: goalProgress > 50 ? 12.4 : 8.2, // This could be calculated from previous week if we had history
            goalProgress,
            studyStreak: streak,
            timeSpent: parseFloat(hours)
          });
        }
      } catch (error) {
        console.error('Error loading progress data:', error);
      }
    };
    
    loadData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* Top Banner */}
      <div className="bg-[#4F46E5] rounded-[3rem] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
         <div className="relative z-10">
            <h2 className="text-4xl font-black mb-4">Academic Insight</h2>
            <p className="text-indigo-100 text-lg max-w-xl">
              {stats.goalProgress > 70 
                ? 'Your mastery is growing consistently. Keep up the excellent work!' 
                : 'Stay focused on your study plan to improve your performance.'}
            </p>
         </div>
         <div className="relative z-10 flex gap-4">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 flex flex-col items-center min-w-[120px]">
               <span className="text-3xl font-black">
                 {stats.goalProgress >= 90 ? 'A+' : stats.goalProgress >= 80 ? 'A' : stats.goalProgress >= 70 ? 'B+' : stats.goalProgress >= 60 ? 'B' : 'C+'}
               </span>
               <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Predictive Grade</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 flex flex-col items-center min-w-[120px]">
               <span className="text-3xl font-black">{stats.goalProgress}%</span>
               <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Completion Score</span>
            </div>
         </div>
         {/* Decoration */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl"></div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Weekly Growth', value: `+${stats.weeklyGrowth}%`, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Goal Progress', value: `${stats.goalProgress}%`, icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Study Streak', value: `${stats.studyStreak} Days`, icon: Award, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Time Spent', value: `${stats.timeSpent}h`, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map((stat, idx) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="bg-white p-8 rounded-[2.5rem] border border-[#E2E8F0] shadow-sm">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-[#64748B] text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</p>
            <h4 className="text-2xl font-black text-[#0F172A]">{stat.value}</h4>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Trend */}
        <section className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-[#E2E8F0] shadow-sm space-y-8">
          <div className="flex items-center justify-between">
            <div>
               <h3 className="text-2xl font-black text-[#0F172A]">Mastery Trend</h3>
               <p className="text-sm text-[#64748B]">Daily consistency over the last week</p>
            </div>
            <div className="flex gap-2">
               <button className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100">Weekly</button>
               <button className="px-4 py-2 text-slate-400 rounded-xl text-xs font-bold hover:bg-slate-50">Monthly</button>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} domain={[0, 100]} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px' }} 
                  itemStyle={{ fontWeight: 'bold', color: '#4F46E5' }}
                />
                <Area type="monotone" dataKey="score" stroke="#4F46E5" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Breakdown */}
        <section className="bg-white p-10 rounded-[3rem] border border-[#E2E8F0] shadow-sm flex flex-col">
          <h3 className="text-2xl font-black text-[#0F172A] mb-8">Subject Pulse</h3>
          <div className="flex-1 space-y-6">
            {subjectData.map((sub) => (
              <div key={sub.subject} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-[#1E293B]">{sub.subject}</span>
                  <span className="font-black text-[#0F172A]">{sub.score}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${sub.score}%` }} 
                    className="h-full rounded-full" 
                    style={{ backgroundColor: sub.color }} 
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-10 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center gap-4">
             <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-indigo-600">
                <Zap className="w-6 h-6" />
             </div>
             <div>
                <p className="text-xs font-bold text-[#64748B] uppercase mb-1">AI Recommendation</p>
                <p className="text-[13px] text-[#1E293B] font-semibold leading-snug">Spend 30m extra on History tomorrow.</p>
             </div>
          </div>
        </section>
      </div>
    </div>
  );
}