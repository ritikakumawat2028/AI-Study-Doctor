import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Lock, User, ArrowRight, BookOpen } from 'lucide-react';
import { login, register } from '../../api';

interface AuthProps {
  onLogin: (name: string) => void;
}

export function Auth({ onLogin }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const data = await login(email, password);
        // Store token if needed
        localStorage.setItem('token', data.token);
        onLogin(data.username || 'User');
      } else {
        await register(name, email, password);
        // Auto login after registration
        const data = await login(email, password);
        localStorage.setItem('token', data.token);
        onLogin(data.username || name);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">
        {/* Left Side - Visual */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-[#4F46E5] text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-12">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <span className="font-bold text-2xl tracking-tight">StudyDoc</span>
            </div>
            <h1 className="text-5xl font-bold leading-tight mb-6">
              Your Personal <br />
              <span className="text-indigo-200">AI Study Mentor</span>
            </h1>
            <p className="text-indigo-100 text-lg max-w-md leading-relaxed">
              Ace your exams with personalized study plans, instant doubt solving, and stress-aware support.
            </p>
          </div>

          <div className="relative z-10">
            <div className="flex -space-x-4 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-12 h-12 rounded-full border-4 border-[#4F46E5] bg-indigo-400 overflow-hidden">
                   <img src={`https://i.pravatar.cc/150?u=${i}`} alt="user" />
                </div>
              ))}
              <div className="w-12 h-12 rounded-full border-4 border-[#4F46E5] bg-white flex items-center justify-center text-[#4F46E5] font-bold text-xs">
                +2k
              </div>
            </div>
            <p className="text-indigo-100 font-medium italic">
              "This platform completely changed how I prepare for my Physics finals!"
            </p>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500 rounded-full -translate-x-1/2 translate-y-1/2 blur-3xl"></div>
        </div>

        {/* Right Side - Form */}
        <div className="p-8 lg:p-16 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[#0F172A] mb-2">
              {isLogin ? 'Welcome back!' : 'Create an account'}
            </h2>
            <p className="text-[#64748B]">
              {isLogin ? 'Log in to continue your learning journey.' : 'Join thousands of students achieving their goals.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-sm font-semibold text-[#1E293B]">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all"
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-sm font-semibold text-[#1E293B]">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-[#1E293B]">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#4F46E5] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#4338CA] transition-all shadow-lg shadow-indigo-200 mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Get Started')} {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[#64748B]">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-[#4F46E5] font-bold hover:underline"
              >
                {isLogin ? 'Sign Up' : 'Log In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
