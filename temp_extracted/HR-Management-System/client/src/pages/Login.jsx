import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLogin } from "../hooks/useAuth";
import toast from "react-hot-toast";
import { Mail, Lock, ShieldCheck, ArrowRight, AlertCircle } from "lucide-react"; //Added AlertCircle for layout
import { useTitle } from "../hooks/useTitle";

export default function Login() {
  useTitle("Login");
  
  const [searchParams] = useSearchParams(); 
  const isExpired = searchParams.get("session") === "expired";
  const isInvalidated = searchParams.get("session") === "invalidated";

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(user.role === "admin" ? "/admin" : "/employee");
    }
  }, [user, navigate]);

  const mutation = useLogin(
    (data) => {
      login(data);
      toast.success("Logged in successfully");
    },
    (err) => {
      setServerError(err.response?.data?.msg || "Authentication failed");
    }
  );
  
  const validate = () => {
    const newErrors = {};
    if (!form.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Minimum 6 characters";
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    setServerError("");
    mutation.mutate(form);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="relative h-screen w-full flex items-center justify-center bg-slate-50 overflow-hidden">
      
      {/* --- BACKGROUND GLOW ORBS --- */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-140 h-140 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="w-full max-w-115 px-6 relative z-10">
        
        {/* Glass card with top border accent */}
        <div className="bg-white/90 backdrop-blur-xl border border-indigo-100 rounded-2xl shadow-2xl shadow-indigo-900/5 p-10">
          
          {/* Logo moved inside the card */}
          <div className="flex flex-col items-center gap-4 mb-8 justify-center">
            <div className="p-3 bg-indigo-600 rounded-xl shadow-indigo-200">
              <ShieldCheck className="text-white w-8 h-8" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">OfficeLink</h1>
              <p className="text-slate-500 text-sm mt-1 font-medium">Secure Corporate Workspace</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* --- SESSION EXPIRED ALERT ENGINE --- */}
            {isExpired && (
              <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl flex items-center gap-2.5 text-amber-800 text-xs font-bold leading-normal">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Your session has expired. Please login again.</span>
              </div>
            )}
            {isInvalidated && (
              <div className="p-3.5 bg-rose-50/60 border border-rose-200 rounded-xl flex items-center gap-2.5 text-rose-800 text-xs font-bold leading-normal">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Your session was invalidated by another login. Please login again.</span>
              </div>
            )}

            {/* EMAIL */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 h-12 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-400"
                  placeholder="name@company.com"
                />
              </div>
              {errors.email && <p className="text-rose-500 text-[11px] font-bold mt-1 ml-1 tracking-tight"> {errors.email}</p>}
            </div>

            {/* PASSWORD */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Password</label>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 h-12 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-400"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="text-rose-500 text-[11px] font-bold mt-1 ml-1 tracking-tight"> {errors.password}</p>}
            </div>

            {/* SERVER ERROR ALERT */}
            {serverError && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-[11px] uppercase tracking-wide font-bold text-center">
                {serverError}
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={mutation.isPending || mutation.isLoading || mutation.isSuccess}
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {mutation.isPending || mutation.isLoading || mutation.isSuccess ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    Log In to Dashboard
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )
              }
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}