import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, LogIn, UserPlus } from 'lucide-react';

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

      <div className="max-w-2xl text-center space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">
            Job Drive System
          </h1>
          <p className="text-lg text-slate-500 max-w-lg mx-auto font-medium">
            Internal recruitment platform. Discover open roles, track applications, and manage interviews.
          </p>
        </div>
        
        {user ? (
          <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-xl shadow-slate-200/50 space-y-6">
            <p className="text-xl font-bold text-slate-900">Welcome back, {user.full_name}!</p>
            <p className="text-slate-500 font-medium">You are logged in as a <span className="font-bold text-slate-900 uppercase tracking-wide text-sm">{user.role}</span>.</p>
            <div className="flex items-center justify-center gap-4">
              <button 
                onClick={() => navigate(user.role === 'admin' || user.role === 'hr' ? '/admin' : '/candidate')} 
                className="inline-flex items-center justify-center h-12 px-6 font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all active:scale-95 shadow-lg shadow-slate-300 gap-2"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => { logout(); navigate('/login'); }} 
                className="inline-flex items-center justify-center h-12 px-6 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all active:scale-95"
              >
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <button 
              onClick={() => navigate('/login')}
              className="inline-flex items-center justify-center h-12 px-8 font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-lg shadow-slate-300 transition-all active:scale-95 gap-2 group"
            >
              <LogIn className="w-4 h-4" />
              Sign in
            </button>
            <button 
              onClick={() => navigate('/register')} 
              className="inline-flex items-center justify-center h-12 px-8 font-bold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl shadow-sm transition-all active:scale-95 gap-2"
            >
              <UserPlus className="w-4 h-4 text-slate-400" />
              Create account
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
