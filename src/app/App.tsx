import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  MessageSquare, 
  FileCheck, 
  Calendar, 
  Activity, 
  HeartPulse, 
  ChevronRight,
  Sparkles,
  BookOpen,
  Target,
  Clock,
  LogOut,
  Menu,
  X,
  User as UserIcon,
  Timer
} from 'lucide-react';
import { Dashboard } from '@/app/components/Dashboard';
import { TutorMode } from '@/app/components/TutorMode';
import { ExaminerMode } from '@/app/components/ExaminerMode';
import { StudyPlanner } from '@/app/components/StudyPlanner';
import { GapAnalysis } from '@/app/components/GapAnalysis';
import { WellnessSupport } from '@/app/components/WellnessSupport';
import { ProgressTracker } from '@/app/components/ProgressTracker';
import { StudySession } from '@/app/components/StudySession';
import { Auth } from '@/app/components/Auth';

export type View = 'dashboard' | 'tutor' | 'examiner' | 'planner' | 'gaps' | 'wellness' | 'progress' | 'session' | 'profile';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [studentName, setStudentName] = useState('');

  // Persist auth state
  useEffect(() => {
    const savedName = localStorage.getItem('studyDoc_user');
    if (savedName) {
      setStudentName(savedName);
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (name: string) => {
    setStudentName(name);
    setIsAuthenticated(true);
    localStorage.setItem('studyDoc_user', name);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('studyDoc_user');
    localStorage.removeItem('token');
    localStorage.removeItem('studyDoc_plan');
    localStorage.removeItem('studyDoc_lastCheckIn');
    // Clear other data if needed
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'session', label: 'Study Session', icon: Timer },
    { id: 'tutor', label: 'Doubt Solver', icon: MessageSquare },
    { id: 'examiner', label: 'Answer Evaluator', icon: FileCheck },
    { id: 'planner', label: 'Study Plan', icon: Calendar },
    { id: 'gaps', label: 'Gap Analysis', icon: Target },
    { id: 'progress', label: 'Progress', icon: Activity },
    { id: 'wellness', label: 'Wellness Support', icon: HeartPulse },
  ];

  if (!isAuthenticated) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden text-[#1E293B]">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } transition-all duration-300 bg-white border-r border-[#E2E8F0] flex flex-col z-50`}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="bg-[#4F46E5] p-2 rounded-xl text-white shadow-lg shadow-indigo-100 cursor-pointer" onClick={() => setActiveView('dashboard')}>
            <Sparkles className="w-6 h-6" />
          </div>
          {isSidebarOpen && (
            <span className="font-bold text-xl tracking-tight text-[#0F172A] cursor-pointer" onClick={() => setActiveView('dashboard')}>StudyDoc</span>
          )}
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as View)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                activeView === item.id 
                  ? 'bg-[#4F46E5] text-white shadow-md' 
                  : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#1E293B]'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && <span className="font-medium whitespace-nowrap">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-[#E2E8F0] space-y-2">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[#64748B] hover:bg-[#F1F5F9] transition-all"
          >
            <Menu className="w-5 h-5 flex-shrink-0" />
            {isSidebarOpen && <span className="font-medium">Collapse</span>}
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-rose-500 hover:bg-rose-50 transition-all"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isSidebarOpen && <span className="font-medium">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#F8FAFC] relative">
        <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-[#E2E8F0] h-16 flex items-center justify-between px-8 z-40">
          <h2 className="text-xl font-semibold capitalize text-[#0F172A]">
            {activeView.replace('-', ' ')}
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-[#0F172A]">Welcome, {studentName}</p>
              <p className="text-xs text-[#64748B]">Active Learner</p>
            </div>
            <button 
              onClick={() => setActiveView('profile')}
              className="w-10 h-10 rounded-full bg-[#E0E7FF] flex items-center justify-center text-[#4F46E5] font-bold ring-2 ring-white shadow-sm hover:ring-indigo-100 transition-all"
            >
              <UserIcon className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeView === 'dashboard' && <Dashboard setActiveView={setActiveView} studentName={studentName} />}
              {activeView === 'session' && <StudySession />}
              {activeView === 'tutor' && <TutorMode />}
              {activeView === 'examiner' && <ExaminerMode />}
              {activeView === 'planner' && <StudyPlanner />}
              {activeView === 'gaps' && <GapAnalysis />}
              {activeView === 'wellness' && <WellnessSupport />}
              {activeView === 'progress' && <ProgressTracker />}
              {activeView === 'profile' && (
                <div className="max-w-2xl mx-auto bg-white p-8 rounded-[2rem] border border-[#E2E8F0]">
                   <h3 className="text-2xl font-bold mb-6">User Profile</h3>
                   <div className="space-y-6">
                      <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
                         <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-[#4F46E5] text-3xl font-bold">
                            {studentName[0]}
                         </div>
                         <div>
                            <h4 className="text-xl font-bold">{studentName}</h4>
                            <p className="text-[#64748B]">Active student since Jan 2026</p>
                         </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="p-4 bg-slate-50 rounded-2xl">
                            <p className="text-xs font-bold text-[#64748B] uppercase">Study Hours</p>
                            <p className="text-xl font-bold">42.5h</p>
                         </div>
                         <div className="p-4 bg-slate-50 rounded-2xl">
                            <p className="text-xs font-bold text-[#64748B] uppercase">Rank</p>
                            <p className="text-xl font-bold">Top 5%</p>
                         </div>
                      </div>
                      <button 
                        onClick={handleLogout}
                        className="w-full py-4 bg-rose-50 text-rose-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-rose-100 transition-all"
                      >
                         <LogOut className="w-5 h-5" /> Sign Out
                      </button>
                   </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
