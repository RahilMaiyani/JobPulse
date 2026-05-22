import { Loader2 } from "lucide-react";

export default function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 animate-in fade-in duration-500">
      <div className="relative flex items-center justify-center">
        {/* Outer pulse effect */}
        <div className="absolute inset-0 rounded-full bg-indigo-100 animate-ping opacity-20"></div>
        
        {/* Main Spinner */}
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin transition-all" />
      </div>

      <div className="flex flex-col items-center">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">
          Synchronizing Data
        </p>
        <div className="h-0.5 w-12 bg-slate-100 rounded-full mt-2 overflow-hidden">
          <div className="h-full bg-indigo-500 w-1/2 rounded-full animate-[loading_1.5s_infinite_ease-in-out]"></div>
        </div>
      </div>

      {/* Basic keyframe for the progress line animation */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}} />
    </div>
  );
}