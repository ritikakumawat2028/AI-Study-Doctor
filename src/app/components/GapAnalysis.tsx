import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  AlertTriangle, 
  ChevronRight, 
  BookOpen, 
  PlayCircle,
  Trophy,
  ArrowUpRight,
  RefreshCw,
  Plus,
  Trash2,
  Loader2
} from 'lucide-react';
import { getGaps, saveGap, deleteGap } from '../../api';

interface Gap {
  id: string;
  concept: string;
  subject: string;
  confidence: number;
  status: string;
  revisionTopic: string;
  activity: string;
}

interface GapAnalysisProps {
  onUpdatePlan?: () => void;
}

export function GapAnalysis({ onUpdatePlan }: GapAnalysisProps) {
  const [gaps, setGaps] = useState<Gap[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddGap, setShowAddGap] = useState(false);
  const [newGap, setNewGap] = useState<Partial<Gap>>({
    concept: '',
    subject: '',
    confidence: 50,
    revisionTopic: '',
    activity: ''
  });

  useEffect(() => {
    loadGaps();
  }, []);

  const loadGaps = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (token) {
        const data = await getGaps(token);
        setGaps(data.map((g: any) => ({ ...g, id: g.id.toString() })));
      } else {
        // Fallback or empty state for guest
        setGaps([]);
      }
    } catch (error) {
      console.error('Failed to load gaps:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGap = async () => {
    if (!newGap.concept || !newGap.subject) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to save gaps');
        return;
      }

      const gapData = {
        concept: newGap.concept,
        subject: newGap.subject,
        confidence: newGap.confidence || 50,
        status: (newGap.confidence || 50) < 50 ? 'Critical Gap' : 'Needs Revision',
        revisionTopic: newGap.revisionTopic || '',
        activity: newGap.activity || ''
      };

      const savedGap = await saveGap(gapData, token);
      await loadGaps();
      
      setNewGap({ concept: '', subject: '', confidence: 50, revisionTopic: '', activity: '' });
      setShowAddGap(false);
    } catch (error) {
      console.error('Failed to save gap:', error);
      alert('Failed to save gap');
    }
  };

  const handleRemoveGap = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await deleteGap(id, token);
        setGaps(gaps.filter(g => g.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete gap:', error);
    }
  };

  const handleAddToStudyPlan = (gap: Gap) => {
    // Get existing study plan
    const savedPlan = localStorage.getItem('studyDoc_plan');
    if (!savedPlan) {
      alert('Please create a study plan first!');
      return;
    }

    const plan = JSON.parse(savedPlan);
    
    // Add gap revision to each day
    plan.forEach((dayPlan: any) => {
      // Check if this topic is already in the plan
      const exists = dayPlan.tasks.some((task: any) => 
        task.title.includes(gap.concept) || task.title.includes(gap.revisionTopic)
      );
      
      if (!exists) {
        // Add the revision task
        dayPlan.tasks.push({
          id: Date.now().toString() + Math.random(),
          type: 'revision',
          title: `${gap.subject}: ${gap.revisionTopic} - ${gap.activity}`,
          duration: '30m',
          completed: false
        });
      }
    });

    localStorage.setItem('studyDoc_plan', JSON.stringify(plan));
    alert(`Added "${gap.concept}" revision to your study plan!`);
  };

  const handleUpdateAllToStudyPlan = () => {
    const savedPlan = localStorage.getItem('studyDoc_plan');
    if (!savedPlan) {
      alert('Please create a study plan first!');
      return;
    }

    const plan = JSON.parse(savedPlan);
    
    // Add all critical gaps to the study plan
    gaps.forEach((gap, idx) => {
      const dayIdx = idx % plan.length;
      const dayPlan = plan[dayIdx];
      
      const exists = dayPlan.tasks.some((task: any) => 
        task.title.includes(gap.concept) || task.title.includes(gap.revisionTopic)
      );
      
      if (!exists) {
        dayPlan.tasks.push({
          id: Date.now().toString() + Math.random(),
          type: 'revision',
          title: `${gap.subject}: ${gap.revisionTopic} - Focus Area`,
          duration: '45m',
          completed: false
        });
      }
    });

    localStorage.setItem('studyDoc_plan', JSON.stringify(plan));
    alert('Updated your study plan with all gap areas!');
    if (onUpdatePlan) onUpdatePlan();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-[#0F172A]">Learning Gap Analysis</h3>
          <p className="text-[#64748B]">AI-identified topics where your performance is below your goal.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-xl">
            <Trophy className="w-5 h-5" /> 
            {gaps.filter(g => g.confidence >= 80).length} Mastered
          </div>
          <button 
            onClick={() => setShowAddGap(!showAddGap)}
            className="flex items-center gap-2 text-indigo-600 font-bold bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-all"
          >
            <Plus className="w-5 h-5" /> Add Gap
          </button>
        </div>
      </header>

      {/* Add Gap Form */}
      {showAddGap && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm"
        >
          <h4 className="text-lg font-bold text-[#0F172A] mb-4">Add New Learning Gap</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Concept Name"
              value={newGap.concept}
              onChange={(e) => setNewGap({ ...newGap, concept: e.target.value })}
              className="px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <input
              type="text"
              placeholder="Subject"
              value={newGap.subject}
              onChange={(e) => setNewGap({ ...newGap, subject: e.target.value })}
              className="px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <input
              type="text"
              placeholder="Revision Topic"
              value={newGap.revisionTopic}
              onChange={(e) => setNewGap({ ...newGap, revisionTopic: e.target.value })}
              className="px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <input
              type="text"
              placeholder="Practice Activity"
              value={newGap.activity}
              onChange={(e) => setNewGap({ ...newGap, activity: e.target.value })}
              className="px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <div className="md:col-span-2">
              <label className="text-sm font-bold text-[#1E293B] mb-2 block">Confidence Level: {newGap.confidence}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={newGap.confidence}
                onChange={(e) => setNewGap({ ...newGap, confidence: parseInt(e.target.value) })}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAddGap}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all"
            >
              Add to Gaps
            </button>
            <button
              onClick={() => setShowAddGap(false)}
              className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      <div className="space-y-4">
        {gaps.map((gap, idx) => (
          <motion.div
            key={gap.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                  gap.confidence < 50 ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#64748B]">{gap.subject}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      gap.confidence < 50 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {gap.status}
                    </span>
                  </div>
                  <h4 className="text-xl font-bold text-[#0F172A] mb-2">{gap.concept}</h4>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-48 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${gap.confidence}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className={`h-full rounded-full ${
                          gap.confidence < 50 ? 'bg-rose-500' : 'bg-amber-500'
                        }`}
                      />
                    </div>
                    <span className="text-sm font-bold text-[#0F172A]">{gap.confidence}% Mastery</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl flex-1 min-w-[200px] border border-slate-100">
                  <p className="text-[10px] font-bold text-[#64748B] uppercase mb-2">Recommended Revision</p>
                  <p className="text-sm font-semibold text-[#1E293B] flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-500" />
                    {gap.revisionTopic}
                  </p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-2xl flex-1 min-w-[200px] border border-indigo-100 group-hover:bg-indigo-100 transition-colors">
                  <p className="text-[10px] font-bold text-indigo-600 uppercase mb-2">Practice Activity</p>
                  <p className="text-sm font-semibold text-indigo-900 flex items-center gap-2">
                    <PlayCircle className="w-4 h-4" />
                    {gap.activity}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleAddToStudyPlan(gap)}
                    className="p-4 bg-[#4F46E5] text-white rounded-2xl hover:bg-[#4338CA] transition-all"
                    title="Add to Study Plan"
                  >
                    <ArrowUpRight className="w-6 h-6" />
                  </button>
                  <button 
                    onClick={() => handleRemoveGap(gap.id)}
                    className="p-4 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-100 transition-all"
                    title="Remove Gap"
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Encouraging Summary Card */}
      <section className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] rounded-3xl p-8 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h4 className="text-2xl font-bold mb-4">Focus here to jump +15 points!</h4>
          <p className="text-indigo-100 mb-6 leading-relaxed">
            Closing these {gaps.length} gaps is the most efficient way to improve your score before the mock exams. You've got this!
          </p>
          <div className="flex items-center justify-center gap-4">
            <button 
              onClick={handleUpdateAllToStudyPlan}
              className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-all shadow-lg"
            >
              Update My Study Plan
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
