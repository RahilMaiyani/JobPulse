import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { createPortal } from 'react-dom';
import { AlertTriangle, Clock } from 'lucide-react';

const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const WARNING_DURATION_SEC = 60; // 60 seconds

export default function IdleMonitor() {
  const { user, logout } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(WARNING_DURATION_SEC);
  const lastActivityRef = useRef(Date.now());
  const countdownIntervalRef = useRef(null);

  // Update activity timestamp
  const updateActivity = () => {
    if (!showWarning) {
      lastActivityRef.current = Date.now();
    }
  };

  useEffect(() => {
    if (!user) return; // Only monitor when logged in

    // Activity events
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];

    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    // Check for idle time every 5 seconds
    const checkInterval = setInterval(() => {
      const now = Date.now();
      if (now - lastActivityRef.current >= IDLE_TIMEOUT_MS && !showWarning) {
        setShowWarning(true);
        setCountdown(WARNING_DURATION_SEC);
        window.dispatchEvent(new Event('idle-warning-started'));
      }
    }, 5000);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
      clearInterval(checkInterval);
    };
  }, [user, showWarning]);

  // Handle countdown
  useEffect(() => {
    if (showWarning) {
      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current);
            handleLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [showWarning]);

  const handleLogout = () => {
    logout();
    setShowWarning(false);
  };

  const handleExtendSession = () => {
    setShowWarning(false);
    lastActivityRef.current = Date.now();
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
  };

  if (!showWarning || !user) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-zinc-900/60 dark:bg-black/70 backdrop-blur-sm transition-opacity" />
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-500 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-inner">
            <AlertTriangle className="w-8 h-8" strokeWidth={2.5} />
          </div>

          <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight mb-3">
            Are you still there?
          </h2>

          <p className="text-zinc-500 dark:text-zinc-400 font-medium mb-6">
            You've been idle for a while. For your security, you will be automatically logged out in:
          </p>

          <div className="flex items-center justify-center gap-2 text-4xl font-black text-rose-500 mb-8 tracking-tighter">
            <Clock className="w-8 h-8 text-rose-500 animate-pulse" />
            {countdown}s
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleLogout}
              className="flex-1 py-3.5 px-4 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-bold rounded-xl transition-colors"
            >
              Log me out
            </button>
            <button
              onClick={handleExtendSession}
              className="flex-1 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
            >
              I'm still here
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
