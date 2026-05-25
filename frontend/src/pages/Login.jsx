import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Briefcase, ArrowRight, EyeOff, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      setServerError("");
      const loggedInUser = await login(data.email, data.password);
      toast.success("Logged in successfully");
      
      if (loggedInUser.role === 'admin' || loggedInUser.role === 'hr') {
        navigate('/admin');
      } else {
        navigate('/candidate');
      }
    } catch (err) {
      setServerError(err.response?.data?.error || "Authentication failed");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-white to-slate-50 relative overflow-hidden">
      
      {/* Subtle grid background for professional feel */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      <div className="w-full max-w-[26rem] px-6 relative z-10 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Stark, clean card */}
        <div className="bg-white/80 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl shadow-indigo-100/50 p-10">
          
          <div className="flex flex-col items-center gap-4 mb-10 justify-center">
            <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/20">
              <Briefcase className="text-white w-7 h-7" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Welcome Back</h1>
              <p className="text-slate-500 text-sm mt-1.5 font-medium">Sign in to the internal portal</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            
            {/* EMAIL */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 ml-1">Work Email</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  {...register("email")}
                  className="w-full pl-11 pr-4 h-12 bg-white/50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-400"
                  placeholder="name@company.com"
                />
              </div>
              {errors.email && <p className="text-rose-500 text-[11px] font-bold mt-1 ml-1">{errors.email.message}</p>}
            </div>

            {/* PASSWORD */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-slate-700">Password</label>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className="w-full pl-11 pr-11 h-12 bg-white/50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-400"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-rose-500 text-[11px] font-bold mt-1 ml-1">{errors.password.message}</p>}
            </div>

            {/* SERVER ERROR ALERT */}
            {serverError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-bold text-center">
                {serverError}
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
            
            <div className="pt-6 text-center text-sm font-medium text-slate-500">
              Don't have an account?{" "}
              <Link to="/register" className="text-indigo-600 font-bold hover:underline">
                Register here
              </Link>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
