import React, { useState, useEffect } from "react";
import { WifiOff } from "lucide-react";

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] animate-in slide-in-from-bottom-10 duration-300">
      <div className="bg-slate-900 border border-slate-700 text-white px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-4">
        <div className="flex items-center justify-center w-10 h-10 bg-rose-500/20 rounded-xl">
          <WifiOff className="w-5 h-5 text-rose-500 animate-pulse" />
        </div>
        <div>
          <p className="text-sm font-bold tracking-tight">Network Connection Lost</p>
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">
            Offline Mode Active
          </p>
        </div>
      </div>
    </div>
  );
}
