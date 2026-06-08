import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Briefcase } from 'lucide-react';

export default function ScreensaverOverlay({ isOpen, onClose }) {
  const [isRendered, setIsRendered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      // Small delay to allow display:block to apply before animating opacity
      const timer = requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsVisible(true));
      });
      return () => cancelAnimationFrame(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setIsRendered(false), 700); // match transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isVisible) return;

    // Record the time it became visible to prevent immediate closing
    const visibleSince = Date.now();

    const handleUserActivity = () => {
      if (Date.now() - visibleSince < 500) return;
      onCloseRef.current();
    };

    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('click', handleUserActivity);
    window.addEventListener('touchstart', handleUserActivity);

    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
    };
  }, [isVisible]);

  // Smooth clock animation
  useEffect(() => {
    if (!isRendered) return;
    let animationFrameId;
    const updateTime = () => {
      setTime(new Date());
      animationFrameId = requestAnimationFrame(updateTime);
    };
    animationFrameId = requestAnimationFrame(updateTime);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isRendered]);


  if (!isRendered) return null;

  const exactSeconds = time.getSeconds() + time.getMilliseconds() / 1000;
  const secondsDegrees = (exactSeconds / 60) * 360;
  const minutesDegrees = ((time.getMinutes() + exactSeconds / 60) / 60) * 360;
  const hoursDegrees = ((time.getHours() % 12 + time.getMinutes() / 60) / 12) * 360;

  // Generate 60 ticks
  const ticks = Array.from({ length: 60 }).map((_, i) => {
    const isHour = i % 5 === 0;
    return (
      <g key={i} transform={`rotate(${i * 6} 400 400)`}>
        <line
          x1="400"
          y1="60"
          x2="400"
          y2={isHour ? "100" : "80"}
          className={isHour ? "stroke-zinc-800 dark:stroke-zinc-200" : "stroke-zinc-300 dark:stroke-zinc-700"}
          strokeWidth={isHour ? "10" : "4"}
          strokeLinecap="round"
        />
      </g>
    );
  });

  return createPortal(
    <div
      className={`fixed inset-0 z-[9999] cursor-none bg-zinc-50 dark:bg-[#09090b] flex items-center justify-center transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
        }`}
    >

      <div className="relative w-full max-w-[800px] aspect-square flex items-center justify-center pointer-events-none">

        {/* Subtle JobPulse Logo in background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] dark:opacity-[0.05]">
          <Briefcase className="w-48 h-48" />
        </div>

        {/* Clock SVG */}
        <svg viewBox="0 0 800 800" className="w-full h-full max-w-[85vw] max-h-[85vh]">
          {/* Ticks */}
          {ticks}

          {/* Hour Hand */}
          <g transform={`rotate(${hoursDegrees} 400 400)`}>
            <line
              x1="400"
              y1="400"
              x2="400"
              y2="190"
              className="stroke-zinc-900 dark:stroke-zinc-100"
              strokeWidth="16"
              strokeLinecap="round"
            />
          </g>

          {/* Minute Hand */}
          <g transform={`rotate(${minutesDegrees} 400 400)`}>
            <line
              x1="400"
              y1="400"
              x2="400"
              y2="120"
              className="stroke-zinc-500 dark:stroke-zinc-400"
              strokeWidth="10"
              strokeLinecap="round"
            />
          </g>

          {/* Second Hand */}
          <g transform={`rotate(${secondsDegrees} 400 400)`}>
            <line
              x1="400"
              y1="460"
              x2="400"
              y2="110"
              className="stroke-indigo-500"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Center dot */}
            <circle cx="400" cy="400" r="12" className="fill-indigo-500" />
            <circle cx="400" cy="400" r="5" className="fill-zinc-50 dark:fill-zinc-950" />
          </g>
        </svg>
      </div>
    </div >,
    document.body
  );
}
