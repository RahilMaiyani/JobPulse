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

  const timeString = time.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

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
    <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-10 shrink-0 shadow-sm z-10">
      
      <div className="flex items-center gap-4">
        {/* Mobile Toggle */}
        <button 
          onClick={toggleSidebar}
          className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Clock Section - Modern Pill Design */}
        <div className="hidden md:flex items-center gap-2.5 bg-slate-100/80 hover:bg-slate-200/80 transition-colors px-3.5 py-1.5 rounded-full border border-slate-200 shadow-inner">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[13px] font-black text-slate-700 tracking-tight">
            {timeString}
          </span>
          <div className="w-px h-3 bg-slate-300 mx-1"></div>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
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
