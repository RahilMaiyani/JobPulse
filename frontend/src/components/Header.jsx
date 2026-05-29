import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut, Menu, Sun, Moon, Monitor, Grip } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function Header({ toggleHub }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'system') setTheme('light');
    else if (theme === 'light') setTheme('dark');
    else setTheme('system');
  };

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    let animationFrameId;
    const updateTime = () => {
      setTime(new Date());
      animationFrameId = requestAnimationFrame(updateTime);
    };
    animationFrameId = requestAnimationFrame(updateTime);
    return () => cancelAnimationFrame(animationFrameId);
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

  const exactSeconds = time.getSeconds() + time.getMilliseconds() / 1000;
  const secondsDegrees = (exactSeconds / 60) * 360;
  const minutesDegrees = ((time.getMinutes() + exactSeconds / 60) / 60) * 360;
  const hoursDegrees = ((time.getHours() % 12 + time.getMinutes() / 60) / 12) * 360;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="h-16 md:h-[72px] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl flex items-center justify-between px-4 md:px-8 shrink-0 z-10 transition-all duration-300 relative shadow-sm hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700">

      <div className="flex items-center gap-4">
        {/* Hub Toggle */}
        <button
          onClick={toggleHub}
          className="p-2 -ml-2 text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all active:scale-95 group"
          title="Open Navigation Hub"
        >
          <Grip className="w-6 h-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
        </button>

        {/* Final Clock Section */}
        <div className="hidden md:flex items-center gap-4 ml-4 border-l border-zinc-200 dark:border-zinc-800 pl-4 group cursor-default">
          
          <div className="flex items-center gap-3">
            {/* Indigo Chrono Analog + Ring */}
            <div className="relative w-10 h-10 flex items-center justify-center bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-full shadow-sm hover:scale-105 transition-transform duration-300">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="20" cy="20" r="18" className="stroke-zinc-100 dark:stroke-zinc-800 fill-none" strokeWidth="2" strokeDasharray="2 4"></circle>
                <circle 
                  cx="20" cy="20" r="18" 
                  className="stroke-indigo-500 fill-none" 
                  strokeWidth="2" 
                  strokeDasharray="113.097" 
                  strokeDashoffset={113.097 - (113.097 * (exactSeconds / 60))} 
                  strokeLinecap="round"
                ></circle>
              </svg>
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Hour Hand */}
                <div 
                  className="absolute w-[2px] h-2.5 bg-zinc-800 dark:bg-zinc-200 rounded-sm origin-bottom" 
                  style={{ transform: `translateY(-50%) rotate(${hoursDegrees}deg)` }}
                ></div>
                {/* Minute Hand */}
                <div 
                  className="absolute w-[2px] h-3.5 bg-zinc-400 dark:bg-zinc-500 rounded-sm origin-bottom" 
                  style={{ transform: `translateY(-50%) rotate(${minutesDegrees}deg)` }}
                ></div>
                {/* Second Hand */}
                <div 
                  className="absolute w-[1px] h-4.5 bg-indigo-500 rounded-full origin-bottom" 
                  style={{ transform: `translateY(-50%) rotate(${secondsDegrees}deg)` }}
                ></div>
                {/* Center Dot */}
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-800 dark:bg-zinc-200 absolute z-10 border-[0.5px] border-white dark:border-zinc-900"></div>
              </div>
            </div>

            {/* Digital Time & Date */}
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1 text-zinc-900 dark:text-zinc-100">
                <span className="text-sm font-black tabular-nums">{hours}:{minutes}</span>
              </div>
              <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest mt-0.5">
                {dateString}
              </span>
            </div>
          </div>

        </div>
      </div>

      <div className="flex items-center gap-4">

        {/* Theme Toggle */}
        <button
          onClick={cycleTheme}
          className="group relative w-10 h-10 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-xl transition-all shadow-sm hover:shadow active:scale-95 overflow-hidden"
          title={`Current theme: ${theme}. Click to change.`}
        >
          <Sun className={`absolute w-5 h-5 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${theme === 'light' ? 'scale-100 opacity-100 rotate-0' : 'scale-50 opacity-0 -rotate-90'}`} />
          <Moon className={`absolute w-5 h-5 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${theme === 'dark' ? 'scale-100 opacity-100 rotate-0' : 'scale-50 opacity-0 rotate-90'}`} />
          <Monitor className={`absolute w-5 h-5 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${theme === 'system' ? 'scale-100 opacity-100 translate-y-0' : 'scale-50 opacity-0 translate-y-4'}`} />
        </button>

        <button
          onClick={handleLogout}
          className="group inline-flex items-center justify-center h-10 px-4 gap-2 font-bold text-zinc-600 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-400 bg-zinc-50 dark:bg-zinc-900 hover:bg-rose-50 dark:hover:bg-zinc-800 rounded-xl transition-all border border-zinc-200 dark:border-zinc-700 hover:border-rose-200 dark:hover:border-zinc-600 active:scale-95 overflow-hidden"
        >
          <LogOut className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1 group-hover:scale-110" />
          <span className="hidden sm:inline transition-transform duration-300 group-hover:translate-x-1">Logout</span>
        </button>
      </div>
    </div>
  );
}
