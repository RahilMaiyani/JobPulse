import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Briefcase, ArrowRight, EyeOff, Eye, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [pendingLoginData, setPendingLoginData] = useState(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      setServerError("");
      const loggedInUser = await login(data.email, data.password, data.force || false);
      toast.success("Logged in successfully");

      if (loggedInUser.role === 'admin' || loggedInUser.role === 'hr') {
        navigate('/admin');
      } else {
        navigate('/candidate');
      }
    } catch (err) {
      if (err.response?.status === 409 && err.response?.data?.hasActiveSession) {
        setPendingLoginData(data);
        setShowWarningModal(true);
      } else {
        setServerError(err.response?.data?.error || "Authentication failed");
      }
    }
  };

  const confirmForceLogin = () => {
    setShowWarningModal(false);
    if (pendingLoginData) {
      onSubmit({ ...pendingLoginData, force: true });
    }
  };

  return (
    <>
      <SEO title="Sign In" description="Sign in to your JobPulse account to manage applications." />
      <div className="h-[100dvh] w-full flex bg-white dark:bg-zinc-950 overflow-hidden transition-colors duration-300">

      {/* LEFT PANE: Form */}
      <div className="w-full lg:w-1/2 h-full flex flex-col justify-center p-8 sm:p-12 lg:p-24 relative overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <style dangerouslySetInnerHTML={{__html: `::-webkit-scrollbar { display: none; }`}} />
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 dark:opacity-50 pointer-events-none" />

        <div className="w-full max-w-md mx-auto relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">

          <div className="flex flex-col gap-4 mb-9">
            <Link to="/" className="inline-flex items-center justify-center w-12 h-12 bg-zinc-900 dark:bg-zinc-100 rounded-2xl shadow-lg shadow-zinc-900/20 dark:shadow-none hover:scale-105 transition-transform">
              <Briefcase className="text-white dark:text-zinc-900 w-6 h-6" strokeWidth={2.5} />
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight mt-2">Welcome Back</h1>
              <p className="text-zinc-500 dark:text-zinc-400 text-base mt-2 font-medium">Sign in to your account to continue.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* EMAIL */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 ml-1 uppercase tracking-wider">Work Email</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 group-focus-within:text-zinc-900 dark:group-focus-within:text-zinc-100 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  autoComplete="email"
                  {...register("email")}
                  className="w-full pl-12 pr-4 h-14 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-base font-medium text-zinc-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-zinc-900/20 dark:focus:ring-zinc-100/10 focus:border-zinc-900 dark:focus:border-zinc-700 outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                  placeholder="name@company.com"
                />
              </div>
              {errors.email && <p className="text-rose-500 text-[12px] font-bold mt-1.5 ml-1">{errors.email.message}</p>}
            </div>

            {/* PASSWORD */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Password</label>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 group-focus-within:text-zinc-900 dark:group-focus-within:text-zinc-100 transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  {...register("password")}
                  className="w-full pl-12 pr-12 h-14 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-base font-medium text-zinc-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-zinc-900/20 dark:focus:ring-zinc-100/10 focus:border-zinc-900 dark:focus:border-zinc-700 outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 tracking-wide"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-rose-500 text-[12px] font-bold mt-1.5 ml-1">{errors.password.message}</p>}
            </div>

            {/* SERVER ERROR ALERT */}
            {serverError && (
              <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400 text-sm font-bold text-center">
                {serverError}
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 text-base font-bold rounded-2xl shadow-xl shadow-zinc-900/20 dark:shadow-none transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {isSubmitting ? (
                  <div className="w-6 h-6 border-2 border-zinc-400 border-t-white dark:border-t-zinc-900 rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                  </>
                )}
              </button>
            </div>

            <div className="pt-8 text-center text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Don't have an account?{" "}
              <Link to="/register" className="text-zinc-900 dark:text-zinc-100 font-bold hover:underline">
                Create one now
              </Link>
            </div>

          </form>
        </div>
      </div>

      {/* RIGHT PANE: Clean Minimalist Graphic */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-zinc-50 dark:bg-zinc-900 items-center justify-center overflow-hidden">
        {/* Simple geometric aesthetic */}
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="absolute w-[120%] aspect-square bg-white dark:bg-zinc-950 rounded-full -translate-x-[20%] translate-y-[20%] border border-zinc-200 dark:border-zinc-800" />
          <div className="absolute w-[80%] aspect-square bg-zinc-100 dark:bg-zinc-900 rounded-full translate-x-[10%] -translate-y-[10%] border border-zinc-200 dark:border-zinc-800" />

          <div className="relative z-10 max-w-md px-12 text-center animate-in fade-in slide-in-from-right-8 duration-1000 delay-300">
            <h2 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight mb-4">Secure & Seamless.</h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-lg font-medium">
              Access your personalized dashboard to manage job applications, track interview schedules, and explore internal opportunities.
            </p>
          </div>
        </div>
      </div>

    </div>

      {/* WARNING MODAL */}
      {showWarningModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
          <div 
            className="absolute inset-0 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setShowWarningModal(false)}
          ></div>
          
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] shadow-2xl w-full max-w-sm relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-300 flex flex-col">
            
            <div className="p-6 md:p-8 space-y-4">
              <div className="flex items-start justify-between">
                <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">Active Session Detected</h2>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
                  You are already logged in on another device. Logging in here will log you out of the other device. Do you want to continue?
                </p>
              </div>
            </div>

            <div className="p-6 md:p-8 pt-0 flex gap-3">
              <button 
                type="button"
                onClick={() => setShowWarningModal(false)} 
                className="flex-1 h-12 font-bold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-2xl transition-all"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={confirmForceLogin} 
                className="flex-1 h-12 font-black text-white rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 shadow-rose-500/20"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
