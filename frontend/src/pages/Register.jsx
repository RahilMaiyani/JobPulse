import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, UserPlus, ArrowRight, EyeOff, Eye, User } from 'lucide-react';
import toast from 'react-hot-toast';

const registerSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email format" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export default function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    try {
      setServerError("");
      await registerUser(data); // Role is automatically set to 'candidate' by backend
      toast.success("Account created successfully!");
      navigate('/candidate');
    } catch (err) {
      setServerError(err.response?.data?.error || "Failed to register");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 dark:from-zinc-950 via-white dark:via-zinc-900 to-slate-50 dark:to-zinc-950 relative overflow-hidden py-12 transition-colors duration-300">
      
      {/* Subtle grid background for professional feel */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 dark:opacity-50 pointer-events-none" />

      <div className="w-full max-w-[26rem] px-6 relative z-10 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Stark, clean card */}
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border border-white/20 dark:border-zinc-800 rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-none p-10">
          
          <div className="flex flex-col items-center gap-4 mb-10 justify-center">
            <div className="p-3 bg-slate-900 dark:bg-zinc-800 rounded-2xl shadow-lg shadow-slate-900/20 dark:shadow-none">
              <UserPlus className="text-white dark:text-zinc-100 w-7 h-7" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">Create Account</h1>
              <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1.5 font-medium">Join and find your next role</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            
            {/* FULL NAME */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 ml-1">Full Name</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 group-focus-within:text-slate-900 dark:group-focus-within:text-zinc-100 transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  {...register("fullName")}
                  className="w-full pl-11 pr-4 h-12 bg-white/50 dark:bg-zinc-950/50 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm font-medium text-slate-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-slate-900/20 dark:focus:ring-zinc-100/10 focus:border-slate-900 dark:focus:border-zinc-700 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600"
                  placeholder="John Doe"
                />
              </div>
              {errors.fullName && <p className="text-rose-500 text-[11px] font-bold mt-1 ml-1">{errors.fullName.message}</p>}
            </div>

            {/* EMAIL */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 ml-1">Work Email</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 group-focus-within:text-slate-900 dark:group-focus-within:text-zinc-100 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  {...register("email")}
                  className="w-full pl-11 pr-4 h-12 bg-white/50 dark:bg-zinc-950/50 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm font-medium text-slate-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-slate-900/20 dark:focus:ring-zinc-100/10 focus:border-slate-900 dark:focus:border-zinc-700 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600"
                  placeholder="name@company.com"
                />
              </div>
              {errors.email && <p className="text-rose-500 text-[11px] font-bold mt-1 ml-1">{errors.email.message}</p>}
            </div>

            {/* PASSWORD */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 ml-1">Password</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 group-focus-within:text-slate-900 dark:group-focus-within:text-zinc-100 transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className="w-full pl-11 pr-11 h-12 bg-white/50 dark:bg-zinc-950/50 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm font-medium text-slate-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-slate-900/20 dark:focus:ring-zinc-100/10 focus:border-slate-900 dark:focus:border-zinc-700 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600"
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors"
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
                className="w-full h-12 bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-zinc-900 text-sm font-bold rounded-xl shadow-lg shadow-slate-900/20 dark:shadow-none transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
            
            <div className="pt-6 text-center text-sm font-medium text-slate-500 dark:text-zinc-400">
              Already have an account?{" "}
              <Link to="/login" className="text-slate-900 dark:text-zinc-100 font-bold hover:underline">
                Sign in here
              </Link>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
