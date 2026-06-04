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

  // Particle generation
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!isVisible) {
      setParticles([]);
      return;
    }

    // Wait a moment before spawning particles so they "slowly come"
    const spawnTimer = setTimeout(() => {
      const newParticles = [];
      for (let i = 0; i < 80; i++) {
        let x, y, dist;
        // Re-roll until outside the center circle (radius ~ 38% of screen)
        do {
          x = Math.random() * 100;
          y = Math.random() * 100;
          dist = Math.sqrt(Math.pow(x - 50, 2) + Math.pow(y - 50, 2));
        } while (dist < 38);

        newParticles.push({
          id: i,
          x,
          y,
          size: Math.random() * 20 + 15, // 15px to 35px
          opacity: Math.random() * 0.4 + 0.1, // 0.1 to 0.5
          durationX: Math.random() * 20 + 15, // 15s to 35s
          durationY: Math.random() * 20 + 15, // Independent Y duration
          durationR: Math.random() * 30 + 20, // Slow tumbling rotation
          delay: Math.random() * 4, // 0 to 4s fade in delay
          xMove: (Math.random() - 0.5) * 15, // -7.5vw to 7.5vw drift
          yMove: (Math.random() - 0.5) * 15,
          spinDirection: Math.random() > 0.5 ? 'normal' : 'reverse',
          colorClass: Math.random() > 0.5 ? "text-indigo-500" : "text-indigo-300 dark:text-indigo-700",
        });
      }
      setParticles(newParticles);
    }, 800);

    return () => clearTimeout(spawnTimer);
  }, [isVisible]);

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
      {/* Particles & Styles */}
      <style>{`
        @keyframes driftX {
          0% { transform: translateX(0); }
          100% { transform: translateX(var(--xMove)); }
        }
        @keyframes driftY {
          0% { transform: translateY(0); }
          100% { transform: translateY(var(--yMove)); }
        }
        @keyframes spinDrift {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeInParticle {
          from { opacity: 0; }
          to { opacity: var(--targetOpacity); }
        }
      `}</style>

      {/* Render Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute"
            style={{
              left: `${p.x}vw`,
              top: `${p.y}vh`,
              opacity: 0,
              '--xMove': `${p.xMove}vw`,
              '--yMove': `${p.yMove}vh`,
              '--targetOpacity': p.opacity,
              animation: `fadeInParticle 4s ease forwards ${p.delay}s`
            }}
          >
            <div style={{ animation: `driftX ${p.durationX}s ease-in-out infinite alternate ${p.delay}s` }}>
              <div style={{ animation: `driftY ${p.durationY}s ease-in-out infinite alternate ${p.delay}s` }}>
                <svg
                  viewBox="0 0 24 24"
                  className={`${p.colorClass}`}
                  style={{
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    animation: `spinDrift ${p.durationR}s linear infinite ${p.spinDirection} ${p.delay}s`
                  }}
                >
                  <path d="M 4,13 Q 12,9 20,13" stroke="currentColor" fill="none" strokeWidth="5" strokeLinecap="round" />
                </svg>
              </div>
            </div >
          </div >
        ))
        }
      </div >

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
