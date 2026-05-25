import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut, Menu } from "lucide-react";

export default function Header({ toggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer); 
  }, []);

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');

  const dateString = time.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="h-16 md:h-[72px] bg-white/80 backdrop-blur-2xl border-b md:border border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] z-10 md:mt-4 md:mr-4 md:rounded-3xl transition-all duration-300 relative">
      
      <div className="flex items-center gap-4">
        {/* Mobile Toggle */}
        <button 
          onClick={toggleSidebar}
          className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Clock Section - Elegant Glass Design */}
        <div className="hidden md:flex items-center gap-2.5 bg-slate-50/50 hover:bg-slate-100/80 transition-colors px-4 py-2 rounded-2xl border border-slate-200/50 shadow-sm">
          <div className="flex items-baseline gap-0.5 text-slate-700">
            <span className="text-[13px] font-black tabular-nums">{hours}</span>
            <span className="text-[13px] font-black animate-pulse text-indigo-400 mx-0.5">:</span>
            <span className="text-[13px] font-black tabular-nums">{minutes}</span>
            <span className="text-[13px] font-black animate-pulse text-indigo-400 mx-0.5">:</span>
            <span className="text-[13px] font-black tabular-nums">{seconds}</span>
          </div>
          <div className="w-px h-4 bg-slate-300 mx-1"></div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            {dateString}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        
        <div className="hidden sm:flex flex-col text-right mr-2">
          <span className="text-sm font-bold text-slate-900 leading-tight">{user?.full_name}</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{user?.role}</span>
        </div>

        <button
          onClick={handleLogout}
          className="inline-flex items-center justify-center h-10 px-4 gap-2 font-bold text-slate-600 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 rounded-xl transition-colors border border-slate-200 hover:border-rose-200"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </div>
  );
}
