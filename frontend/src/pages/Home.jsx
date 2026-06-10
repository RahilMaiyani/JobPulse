import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { ArrowRight, LogIn, UserPlus } from 'lucide-react';

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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

  const exactSeconds = time.getSeconds() + time.getMilliseconds() / 1000;
  const secondsDegrees = (exactSeconds / 60) * 360;
  const minutesDegrees = ((time.getMinutes() + exactSeconds / 60) / 60) * 360;
  const hoursDegrees = ((time.getHours() % 12 + time.getMinutes() / 60) / 12) * 360;

  // Clock numbers and target angles (in degrees, starting from 12 o'clock / 0 degrees)
  const clockNumbers = [
    { value: 12, angle: 0, isBold: true },
    { value: 1, angle: 30 },
    { value: 2, angle: 60 },
    { value: 3, angle: 90, isBold: true },
    { value: 4, angle: 120 },
    { value: 5, angle: 150 },
    { value: 6, angle: 180, isBold: true },
    { value: 7, angle: 210 },
    { value: 8, angle: 240 },
    { value: 9, angle: 270, isBold: true },
    { value: 10, angle: 300 },
    { value: 11, angle: 330 }
  ];

  // Get active numbers directly from the Date object
  const currentHourVal = time.getHours() % 12 === 0 ? 12 : time.getHours() % 12;
  const nearestMinuteIndex = Math.round(time.getMinutes() / 5);
  const currentMinuteVal = (nearestMinuteIndex === 0 || nearestMinuteIndex === 12) ? 12 : nearestMinuteIndex;

  const R = 33; // Radius for number placement in the 100x100 SVG viewbox
  const numberPositions = clockNumbers.map(num => {
    const phi = (num.angle - 90) * Math.PI / 180;
    const x = 50 + R * Math.cos(phi);
    const y = 50 + R * Math.sin(phi) + 3; // Small baseline offset for vertical alignment

    // Direct matching from Date values
    const isPointed = num.value === currentHourVal || num.value === currentMinuteVal;

    return {
      ...num,
      x,
      y,
      isPointed
    };
  });

  return (
    <>
      <SEO title="Home" />
      <div className="h-[100dvh] w-full bg-white dark:bg-zinc-950 flex relative overflow-hidden transition-colors duration-300">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

        <div className="w-full h-full flex flex-col lg:flex-row relative z-10 max-w-[1600px] mx-auto">

          {/* LEFT COLUMN: Content */}
          <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24 h-full animate-in fade-in slide-in-from-left-8 duration-700">
            <div className="max-w-xl space-y-8">
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-7xl font-black tracking-tight text-zinc-900 dark:text-white leading-[1.1]">
                  Empower Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-500 to-zinc-900 dark:from-zinc-400 dark:to-white">Workforce.</span>
                </h1>
                <p className="text-lg lg:text-xl text-zinc-500 dark:text-zinc-400 font-medium max-w-lg leading-relaxed">
                  The ultimate internal recruitment platform. Discover open roles, track your applications, and manage interviews with unprecedented ease.
                </p>
              </div>

              {user ? (
                <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-8 rounded-3xl shadow-xl shadow-zinc-200/50 dark:shadow-none space-y-6">
                  <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Welcome back, {user.full_name}!</p>
                  <p className="text-zinc-500 dark:text-zinc-400 font-medium">You are logged in as a <span className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide text-sm">{user.role}</span>.</p>
                  <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                    <button
                      onClick={() => navigate(user.role === 'admin' || user.role === 'hr' ? '/admin' : '/candidate')}
                      className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-8 font-bold text-white dark:text-zinc-900 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white rounded-xl transition-all active:scale-95 shadow-lg shadow-zinc-300 dark:shadow-none gap-2"
                    >
                      Go to Dashboard
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { logout(); navigate('/login'); }}
                      className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-8 font-bold text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all active:scale-95"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    onClick={() => navigate('/login')}
                    className="inline-flex items-center justify-center h-14 px-8 font-bold text-white dark:text-zinc-900 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white rounded-xl shadow-xl shadow-zinc-300 dark:shadow-none transition-all active:scale-95 gap-2 group text-base"
                  >
                    <LogIn className="w-5 h-5" />
                    Sign in to Portal
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="inline-flex items-center justify-center h-14 px-8 font-bold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-xl transition-all active:scale-95 gap-2 text-base"
                  >
                    <UserPlus className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
                    Create account
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: CSS Illustration */}
          <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden animate-in fade-in slide-in-from-right-8 duration-1000 delay-150">
            <div className="relative w-full max-w-[600px] aspect-square flex items-center justify-center">
              {/* Minimalist geometric composition */}
              <div className="absolute w-[80%] h-[80%] border-[40px] border-zinc-100 dark:border-zinc-800 rounded-full animate-[spin_60s_linear_infinite]" />
              <div className="absolute w-[50%] h-[50%] bg-zinc-900 dark:bg-zinc-100 rounded-2xl rotate-12 shadow-2xl shadow-zinc-300/50 dark:shadow-none" />

              {/* Original top-right circle reverted */}
              <div className="absolute w-24 h-24 bg-emerald-500/10 dark:bg-emerald-500/20 backdrop-blur-3xl rounded-full top-1/4 right-1/4" />

              {/* Bold, light/dark-themed Simple Analog Clock (Bottom-Left Circle) */}
              <div className="absolute w-[28%] h-[28%] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-full -translate-x-1/2 translate-y-1/2 shadow-2xl flex items-center justify-center select-none z-20 hover:scale-105 transition-transform duration-300">

                {/* Outer Ticks & Bezel Progress Ring SVG Layer */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100">
                  {/* Outer Dashed Track (Header clock style) */}
                  <circle cx="50" cy="50" r="46" className="stroke-zinc-100 dark:stroke-zinc-800 fill-none opacity-80" strokeWidth="2.5" strokeDasharray="2 4" transform="rotate(-90 50 50)"></circle>

                  {/* Dynamic Indigo Seconds Progress Ring (Header clock style) */}
                  <circle
                    cx="50" cy="50" r="46"
                    className="stroke-indigo-500 fill-none"
                    strokeWidth="2.5"
                    strokeDasharray="289.026"
                    strokeDashoffset={289.026 - (289.026 * (exactSeconds / 60))}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  ></circle>

                  {/* Dynamic focal numbers showing only where needles point */}
                  {numberPositions.map((num) => (
                    <text
                      key={num.value}
                      x={num.x}
                      y={num.y}
                      fontSize={num.isBold ? "9" : "6.5"}
                      fontWeight={num.isBold ? "1000" : "600"}
                      textAnchor="middle"
                      className="fill-zinc-900 dark:fill-zinc-100 font-sans tracking-tighter"
                      style={{
                        opacity: num.isPointed ? 1 : 0,
                        transition: 'opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      {num.value}
                    </text>
                  ))}
                </svg>

                {/* Hands & Center Pin Container */}
                <div className="relative w-full h-full flex items-center justify-center z-20 pointer-events-none">
                  {/* Hour Hand */}
                  <div
                    className="absolute w-[3px] h-[25%] bg-zinc-800 dark:bg-zinc-200 rounded-sm origin-bottom"
                    style={{ transform: `translateY(-50%) rotate(${hoursDegrees}deg)` }}
                  />
                  {/* Minute Hand */}
                  <div
                    className="absolute w-[2px] h-[35%] bg-zinc-400 dark:bg-zinc-500 rounded-sm origin-bottom"
                    style={{ transform: `translateY(-50%) rotate(${minutesDegrees}deg)` }}
                  />
                  {/* Second Hand (Vibrant Indigo Sweep) */}
                  <div
                    className="absolute w-[1.5px] h-[42%] bg-indigo-500 rounded-full origin-bottom"
                    style={{ transform: `translateY(-50%) rotate(${secondsDegrees}deg)` }}
                  />
                  {/* Center Dot (Matching header) */}
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-800 dark:bg-zinc-200 absolute z-10 border-[0.5px] border-white dark:border-zinc-900 shadow"></div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
