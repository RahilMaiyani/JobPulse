import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut, Menu, Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function Header({ toggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'system') setTheme('light');
    else if (theme === 'light') setTheme('dark');
    else setTheme('system');
  };

  const ThemeIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;

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
    <div className="h-16 md:h-[72px] bg-white dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between px-4 md:px-8 shrink-0 z-10 transition-all duration-300 relative">
      
      <div className="flex items-center gap-4">
        {/* Mobile Toggle */}
        <button 
          onClick={toggleSidebar}
          className="md:hidden p-2 -ml-2 text-slate-500 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-zinc-100 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Clock Section */}
        <div className="hidden md:flex flex-col ml-4 border-l border-slate-200 dark:border-zinc-800 pl-4">
          <div className="flex items-baseline gap-1 text-slate-900 dark:text-zinc-100">
            <span className="text-sm font-black tabular-nums">{hours}:{minutes}</span>
            <span className="text-xs font-bold text-slate-400 dark:text-zinc-500 tabular-nums">{seconds}</span>
          </div>
          <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest">
            {dateString}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        
        {/* Theme Toggle */}
        <button
          onClick={cycleTheme}
          className="p-2.5 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 bg-slate-50 dark:bg-zinc-900/50 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors border border-slate-200 dark:border-zinc-800"
          title={`Current theme: ${theme}. Click to change.`}
        >
          <ThemeIcon className="w-4 h-4" />
        </button>

        <div className="hidden sm:flex flex-col text-right mr-2">
          <span className="text-sm font-bold text-slate-900 dark:text-zinc-100 leading-tight">{user?.full_name}</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-500">{user?.role}</span>
        </div>

        <button
          onClick={handleLogout}
          className="inline-flex items-center justify-center h-10 px-4 gap-2 font-bold text-slate-600 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-400 bg-slate-50 dark:bg-zinc-900 hover:bg-rose-50 dark:hover:bg-zinc-800 rounded-xl transition-colors border border-slate-200 dark:border-zinc-700 hover:border-rose-200 dark:hover:border-zinc-600"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </div>
  );
}
