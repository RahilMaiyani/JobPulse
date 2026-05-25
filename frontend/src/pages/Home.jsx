import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, LogIn, UserPlus } from 'lucide-react';

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">

      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

      <div className="max-w-2xl text-center space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-zinc-100">
            Job Drive System
          </h1>
          <p className="text-lg text-slate-500 dark:text-zinc-400 max-w-lg mx-auto font-medium">
            Internal recruitment platform. Discover open roles, track applications, and manage interviews.
          </p>
        </div>

        {user ? (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-8 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6">
            <p className="text-xl font-bold text-slate-900 dark:text-zinc-100">Welcome back, {user.full_name}!</p>
            <p className="text-slate-500 dark:text-zinc-400 font-medium">You are logged in as a <span className="font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wide text-sm">{user.role}</span>.</p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => navigate(user.role === 'admin' || user.role === 'hr' ? '/admin' : '/candidate')}
                className="inline-flex items-center justify-center h-12 px-6 font-bold text-white dark:text-zinc-900 bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 dark:hover:bg-white rounded-xl transition-all active:scale-95 shadow-lg shadow-slate-300 dark:shadow-none gap-2"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="inline-flex items-center justify-center h-12 px-6 font-bold text-slate-600 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-xl transition-all active:scale-95"
              >
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center justify-center h-12 px-8 font-bold text-white dark:text-zinc-900 bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 dark:hover:bg-white rounded-xl shadow-lg shadow-slate-300 dark:shadow-none transition-all active:scale-95 gap-2 group"
            >
              <LogIn className="w-4 h-4" />
              Sign in
            </button>
            <button
              onClick={() => navigate('/register')}
              className="inline-flex items-center justify-center h-12 px-8 font-bold text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-xl shadow-sm dark:shadow-none transition-all active:scale-95 gap-2"
            >
              <UserPlus className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
              Create account
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
