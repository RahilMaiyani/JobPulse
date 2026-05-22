import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { FileQuestion, ArrowLeft, ShieldAlert } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoHome = () => {
    if (!user) {
      navigate("/");
    } else {
      navigate(user.role === "admin" ? "/admin" : "/employee");
    }
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <div className="relative mb-8">
        {/* Decorative Background Icon */}
        <div className="absolute inset-0 scale-150 opacity-5 text-slate-900">
           <ShieldAlert className="w-full h-full" />
        </div>
        
        <div className="relative z-10 p-6 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <FileQuestion className="w-16 h-16 text-indigo-600" />
        </div>
      </div>

      <h1 className="text-6xl font-bold text-slate-900 tracking-tighter mb-2">404</h1>
      <h2 className="text-xl font-bold text-slate-800 tracking-tight">Resource Not Found</h2>
      <p className="text-slate-500 max-w-xs mt-3 font-medium leading-relaxed">
        The page you are looking for doesn't exist or has been moved to a different directory.
      </p>

      <button
        onClick={handleGoHome}
        className="mt-10 flex items-center gap-2 px-8 h-12 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Dashboard
      </button>

      <footer className="fixed bottom-8 text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">
        OfficeLink Internal System • 2026
      </footer>
    </div>
  );
}