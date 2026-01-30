import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Loader2, 
  Sparkles,
  ClipboardCheck,
  Zap,
  Quote,
  BookOpen,
  HelpCircle
} from 'lucide-react';

import { askGemini } from '../../api';

interface EvaluationResult {
  score: number;
  strengths: string[];
  weakAreas: string[];
  suggestions: string[];
  encouragement: string;
}

export function ExaminerMode() {
  const [subject, setSubject] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);

  const handleEvaluate = async () => {
    if (!answer.trim() || !subject.trim()) return;
    setIsEvaluating(true);
    setResult(null);

    try {
      const token = localStorage.getItem('token') || undefined;
      const prompt = `
        Act as an expert academic examiner. Evaluate the following student answer.
        
        Subject: ${subject}
        Question: ${question || 'Not provided'}
        Student Answer: "${answer}"
        
        Provide a JSON response with the following structure:
        {
          "score": (number 0-10),
          "strengths": ["point 1", "point 2"],
          "weakAreas": ["point 1", "point 2"],
          "suggestions": ["point 1", "point 2"],
          "encouragement": "A short encouraging message"
        }
        IMPORTANT: Return ONLY the JSON object. Do not wrap it in markdown code blocks. Do not add any explanation text.
      `;

      const response = await askGemini(prompt, token);
      
      // Clean up response if it contains markdown code blocks
      let cleanText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      // Attempt to extract JSON if there's extra text
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanText = jsonMatch[0];
      }

      const evaluation = JSON.parse(cleanText);
      
      setResult(evaluation);
    } catch (error) {
      console.error('Error evaluating answer:', error);
      alert('Failed to evaluate answer. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <section className="bg-white p-8 rounded-[2.5rem] border border-[#E2E8F0] shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600 p-2 rounded-xl text-white shadow-lg shadow-emerald-100">
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-2xl text-[#0F172A]">Answer Evaluator</h3>
        </div>

        <div className="space-y-4">
           <div className="space-y-2">
              <label className="text-sm font-bold text-[#1E293B] flex items-center gap-2">
                 <BookOpen className="w-4 h-4 text-emerald-500" /> Subject
              </label>
              <input 
                 value={subject} onChange={(e) => setSubject(e.target.value)}
                 placeholder="e.g., World War II History"
                 className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
           </div>
           <div className="space-y-2">
              <label className="text-sm font-bold text-[#1E293B] flex items-center gap-2">
                 <HelpCircle className="w-4 h-4 text-emerald-500" /> Question (Optional)
              </label>
              <input 
                 value={question} onChange={(e) => setQuestion(e.target.value)}
                 placeholder="What was the question you answered?"
                 className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
           </div>
           <div className="space-y-2">
              <label className="text-sm font-bold text-[#1E293B] flex items-center gap-2">
                 <FileText className="w-4 h-4 text-emerald-500" /> Your Answer
              </label>
              <textarea
                value={answer} onChange={(e) => setAnswer(e.target.value)}
                placeholder="Paste your answer here..."
                className="w-full h-64 p-5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none font-serif text-lg leading-relaxed"
              />
           </div>
        </div>

        <button
          onClick={handleEvaluate}
          disabled={!answer.trim() || !subject.trim() || isEvaluating}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/10 disabled:opacity-50"
        >
          {isEvaluating ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Zap className="w-5 h-5" /> Evaluate Answer</>}
        </button>
      </section>

      <section>
         <AnimatePresence mode="wait">
            {!result && !isEvaluating ? (
               <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-[#E2E8F0] rounded-[2.5rem] bg-slate-50/50">
                  <FileText className="w-16 h-16 text-slate-200 mb-4" />
                  <h4 className="text-slate-400 font-bold text-xl">Waiting for Answer</h4>
                  <p className="text-slate-400 text-sm mt-2 max-w-xs">Fill in the details to receive instant AI evaluation and score.</p>
               </div>
            ) : isEvaluating ? (
               <div className="h-full min-h-[500px] flex flex-col items-center justify-center p-8 bg-white rounded-[2.5rem] border border-emerald-100 shadow-sm animate-pulse">
                  <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
                  <h4 className="text-[#0F172A] font-bold text-xl">AI Examiner is Reviewing</h4>
                  <p className="text-[#64748B] mt-2">Checking logical consistency and subject relevance...</p>
               </div>
            ) : result && (
               <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[2.5rem] border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col h-full">
                  <div className="p-10 bg-emerald-600 text-white relative">
                     <p className="text-emerald-100 font-bold uppercase tracking-widest text-xs mb-1">Total Evaluation Score</p>
                     <h4 className="text-6xl font-black">{result.score}<span className="text-2xl text-emerald-200">/10</span></h4>
                     <div className="absolute top-8 right-8 bg-white/10 p-4 rounded-3xl backdrop-blur-md">
                        <Trophy className="w-10 h-10 text-white" />
                     </div>
                  </div>
                  <div className="p-10 space-y-8 flex-1 overflow-y-auto">
                     <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-4">
                           <h5 className="font-bold text-[#0F172A] flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Key Strengths</h5>
                           <ul className="space-y-2">
                              {result.strengths.map((s, i) => <li key={i} className="text-sm text-[#64748B] flex gap-2">
                                 <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0" /> {s}
                              </li>)}
                           </ul>
                        </div>
                        <div className="space-y-4">
                           <h5 className="font-bold text-[#0F172A] flex items-center gap-2"><AlertCircle className="w-5 h-5 text-amber-500" /> Weak Points</h5>
                           <ul className="space-y-2">
                              {result.weakAreas.map((w, i) => <li key={i} className="text-sm text-[#64748B] flex gap-2">
                                 <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 flex-shrink-0" /> {w}
                              </li>)}
                           </ul>
                        </div>
                     </div>
                     <div className="p-6 bg-slate-50 rounded-3xl space-y-4 border border-slate-100">
                        <h5 className="font-bold text-sm text-[#0F172A]">Improvement Checklist</h5>
                        <ul className="space-y-3">
                           {result.suggestions.map((s, i) => <li key={i} className="text-xs text-[#64748B] flex gap-3 items-center">
                              <ArrowRight className="w-4 h-4 text-emerald-600 flex-shrink-0" /> {s}
                           </li>)}
                        </ul>
                     </div>
                     <div className="flex gap-4 p-6 bg-emerald-50 rounded-3xl">
                        <Quote className="w-8 h-8 text-emerald-200 flex-shrink-0" />
                        <p className="text-emerald-800 italic font-medium">{result.encouragement}</p>
                     </div>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>
      </section>
    </div>
  );
}

function Trophy({ className }: { className?: string }) {
   return (
      <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
         <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
         <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
         <path d="M4 22h16" />
         <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
         <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
         <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
      </svg>
   );
}
