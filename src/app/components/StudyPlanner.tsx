import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Coffee, 
  BookOpen, 
  RefreshCw, 
  CheckCircle,
  Plus,
  ArrowRight,
  Clock,
  Sparkles,
  Trash2,
  CalendarDays,
  Target,
  Edit2,
  Save
} from 'lucide-react';
import { getStudyPlan, saveStudyPlan } from '../../api';

interface Task {
  id: string;
  type: 'study' | 'revision' | 'break';
  title: string;
  duration: string;
  completed: boolean;
}

interface DayPlan {
  day: string;
  tasks: Task[];
}

export function StudyPlanner() {
  const [showGenerator, setShowGenerator] = useState(false);
  const [subjects, setSubjects] = useState<string[]>(['']);
  const [dailyHours, setDailyHours] = useState('4');
  const [examDate, setExamDate] = useState('');
  const [goals, setGoals] = useState('');
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [plan, setPlan] = useState<DayPlan[]>([]);
  const [isEditingExam, setIsEditingExam] = useState(false);
  const [tempExamDate, setTempExamDate] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlan = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const planData = await getStudyPlan(token);
          if (planData && planData.schedule && planData.schedule.length > 0) {
            setPlan(planData.schedule);
            if (planData.examDate) setExamDate(planData.examDate);
            if (planData.goals) setGoals(planData.goals);
          } else {
            setShowGenerator(true);
          }
        } catch (error) {
          console.error('Error loading plan:', error);
          setShowGenerator(true);
        }
      } else {
        const savedPlan = localStorage.getItem('studyDoc_plan');
        const savedExamDate = localStorage.getItem('studyDoc_examDate');
        if (savedPlan) {
          setPlan(JSON.parse(savedPlan));
        } else {
          setShowGenerator(true);
        }
        if (savedExamDate) {
          setExamDate(savedExamDate);
        }
      }
      setLoading(false);
    };
    
    loadPlan();
  }, []);

  const handleAddSubject = () => setSubjects([...subjects, '']);
  const handleSubjectChange = (idx: number, val: string) => {
    const newSubs = [...subjects];
    newSubs[idx] = val;
    setSubjects(newSubs);
  };
  const handleRemoveSubject = (idx: number) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter((_, i) => i !== idx));
    }
  };

  const generatePlan = async () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const activeSubjects = subjects.filter(s => s.trim());
    
    if (activeSubjects.length === 0) return;

    const newPlan: DayPlan[] = days.map((day, dIdx) => {
      const tasks: Task[] = [];
      const sessionCount = parseInt(dailyHours);
      
      for (let i = 0; i < sessionCount; i++) {
        const sub = activeSubjects[(dIdx + i) % activeSubjects.length];
        tasks.push({
          id: Math.random().toString(36).substr(2, 9),
          type: i % 3 === 0 ? 'study' : 'revision',
          title: `${sub}: ${i % 2 === 0 ? 'Advanced Concepts' : 'Practice Set'}`,
          duration: '60m',
          completed: false
        });
        
        if (i < sessionCount - 1) {
          tasks.push({
            id: Math.random().toString(36).substr(2, 9),
            type: 'break',
            title: 'Refuel & Rest',
            duration: '15m',
            completed: false
          });
        }
      }
      return { day, tasks };
    });

    setPlan(newPlan);
    
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await saveStudyPlan(newPlan, examDate, goals, token);
      } catch (error) {
        console.error('Error saving plan to backend:', error);
      }
    } else {
      localStorage.setItem('studyDoc_plan', JSON.stringify(newPlan));
      if (examDate) {
        localStorage.setItem('studyDoc_examDate', examDate);
      }
    }
    
    setShowGenerator(false);
  };

  const toggleTask = async (dayIdx: number, taskId: string) => {
    const newPlan = [...plan];
    const task = newPlan[dayIdx].tasks.find(t => t.id === taskId);
    if (task) task.completed = !task.completed;
    setPlan(newPlan);
    
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await saveStudyPlan(newPlan, examDate, goals, token);
      } catch (error) {
        console.error('Error updating plan:', error);
      }
    } else {
      localStorage.setItem('studyDoc_plan', JSON.stringify(newPlan));
    }
  };

  const handleEditExamDate = () => {
    setTempExamDate(examDate);
    setIsEditingExam(true);
  };

  const handleSaveExamDate = async () => {
    setExamDate(tempExamDate);
    setIsEditingExam(false);
    
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await saveStudyPlan(plan, tempExamDate, goals, token);
      } catch (error) {
        console.error('Error saving exam date:', error);
      }
    } else {
      localStorage.setItem('studyDoc_examDate', tempExamDate);
    }
  };

  const calculateDaysUntilExam = () => {
    if (!examDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exam = new Date(examDate);
    exam.setHours(0, 0, 0, 0);
    const diffTime = exam.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (showGenerator) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-[2.5rem] border border-[#E2E8F0] shadow-sm overflow-hidden">
          {/* Header */}
          <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-[#F8FAFC]">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-xl text-white">
                <CalendarDays className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-[#0F172A]">Study Plan Generator</h2>
            </div>
            {plan.length > 0 && (
              <button 
                onClick={() => setShowGenerator(false)}
                className="text-sm font-bold text-[#64748B] hover:text-[#4F46E5]"
              >
                ← Back to Dashboard
              </button>
            )}
          </div>

          <div className="p-10 space-y-8">
            <h3 className="text-xl font-bold text-[#0F172A]">Create Your 7-Day Study Plan</h3>
            
            <div className="space-y-4">
              <label className="text-sm font-bold text-[#1E293B]">Subjects to Study *</label>
              <div className="space-y-3">
                {subjects.map((sub, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={sub}
                      onChange={(e) => handleSubjectChange(idx, e.target.value)}
                      placeholder={`Subject ${idx + 1}`}
                      className="flex-1 px-4 py-3 bg-white border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all"
                    />
                    {subjects.length > 1 && (
                      <button 
                        onClick={() => handleRemoveSubject(idx)}
                        className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button 
                onClick={handleAddSubject}
                className="flex items-center gap-2 text-[#4F46E5] font-bold px-4 py-2 border border-dashed border-[#4F46E5] rounded-xl hover:bg-indigo-50 transition-all"
              >
                <Plus className="w-4 h-4" /> Add Subject
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1E293B]">Daily Study Hours *</label>
                <input
                  type="number"
                  value={dailyHours}
                  onChange={(e) => setDailyHours(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1E293B]">Exam Date (Optional)</label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#1E293B]">Your Study Goals (Optional)</label>
              <textarea
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                placeholder="e.g., Improve weak areas, complete all chapters, score high marks..."
                className="w-full h-32 px-4 py-3 bg-white border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all resize-none"
              />
            </div>

            <button
              onClick={generatePlan}
              className="w-full bg-[#4F46E5] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#4338CA] transition-all shadow-xl shadow-indigo-100"
            >
              <Sparkles className="w-5 h-5" /> Generate My Study Plan
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentDay = plan[selectedDayIdx] || { day: '', tasks: [] };
  const daysUntilExam = calculateDaysUntilExam();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Exam Countdown Card */}
      {examDate && !showGenerator && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl"
        >
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl">
                <CalendarDays className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold opacity-90 mb-1">Exam Countdown</h3>
                <div className="flex items-center gap-3">
                  {isEditingExam ? (
                    <input
                      type="date"
                      value={tempExamDate}
                      onChange={(e) => setTempExamDate(e.target.value)}
                      className="px-4 py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                  ) : (
                    <p className="text-3xl font-black">
                      {daysUntilExam !== null && daysUntilExam >= 0 ? `${daysUntilExam} days left` : 'Exam date passed'}
                    </p>
                  )}
                </div>
                <p className="text-sm opacity-75 mt-1">
                  Target: {new Date(examDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              {isEditingExam ? (
                <button
                  onClick={handleSaveExamDate}
                  className="bg-white text-rose-600 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-rose-50 transition-all shadow-lg"
                >
                  <Save className="w-5 h-5" /> Save
                </button>
              ) : (
                <button
                  onClick={handleEditExamDate}
                  className="bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-white/30 transition-all border border-white/30"
                >
                  <Edit2 className="w-5 h-5" /> Edit Date
                </button>
              )}
            </div>
          </div>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        </motion.div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-indigo-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-2xl font-bold mb-2">Smart Study Schedule</h3>
          <p className="text-indigo-200">Personalized 7-day balance of growth and recovery.</p>
        </div>
        <button 
          onClick={() => setShowGenerator(true)}
          className="relative z-10 bg-white text-indigo-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-50 transition-all shadow-xl shadow-indigo-950/20 whitespace-nowrap"
        >
          <RefreshCw className="w-5 h-5" /> Regenerate Plan
        </button>
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-400/20 blur-3xl rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="space-y-3">
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider px-2">Select Day</p>
          <div className="flex flex-col gap-2">
            {plan.map((day, idx) => (
              <button
                key={day.day}
                onClick={() => setSelectedDayIdx(idx)}
                className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all ${
                  selectedDayIdx === idx 
                    ? 'bg-[#4F46E5] text-white shadow-lg shadow-indigo-200' 
                    : 'bg-white text-[#64748B] hover:bg-slate-50 border border-transparent hover:border-slate-200'
                }`}
              >
                <span className="font-semibold">{day.day}</span>
                {day.tasks.every(t => t.completed) && day.tasks.length > 0 && (
                  <CheckCircle className="w-4 h-4 text-white" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xl font-bold text-[#0F172A] flex items-center gap-3">
              {currentDay.day} Schedule
              <span className="text-sm font-normal text-[#64748B] px-3 py-1 bg-slate-100 rounded-full">
                {currentDay.tasks.length} Tasks
              </span>
            </h4>
          </div>

          <div className="space-y-4">
            {currentDay.tasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                className={`group flex items-center justify-between p-5 bg-white border rounded-2xl transition-all hover:shadow-md ${
                  task.completed ? 'border-emerald-100 bg-emerald-50/20' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    task.type === 'study' ? 'bg-indigo-50 text-indigo-600' :
                    task.type === 'revision' ? 'bg-amber-50 text-amber-600' :
                    'bg-emerald-50 text-emerald-600'
                  }`}>
                    {task.type === 'study' && <BookOpen className="w-6 h-6" />}
                    {task.type === 'revision' && <RefreshCw className="w-6 h-6" />}
                    {task.type === 'break' && <Coffee className="w-6 h-6" />}
                  </div>
                  <div>
                    <h5 className={`font-bold transition-all ${task.completed ? 'text-[#64748B] line-through' : 'text-[#0F172A]'}`}>
                      {task.title}
                    </h5>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-[#64748B] flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {task.duration}
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => toggleTask(selectedDayIdx, task.id)}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                    task.completed 
                      ? 'bg-emerald-500 border-emerald-500 text-white' 
                      : 'border-slate-200 hover:border-indigo-400 group-hover:scale-110'
                  }`}
                >
                  {task.completed && <CheckCircle className="w-5 h-5" />}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}