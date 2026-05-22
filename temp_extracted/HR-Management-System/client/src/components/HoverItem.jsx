import { useState } from "react";
import { LogOut, Calendar } from "lucide-react";

export default function HoverItem({ user, isCheckedout, toDate, content }) {
  const [pos, setPos] = useState(null);

  return (
    <div
      className="flex items-center gap-3 py-2 px-3 rounded-xl cursor-default w-full hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all duration-200 group"
      onMouseEnter={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setPos({
          top: rect.top + rect.height / 2,
          left: rect.right + 10 // Positioned slightly to the right for better visibility
        });
      }}
      onMouseLeave={() => setPos(null)}
    >
      {/* AVATAR */}
      <img
        src={
          user.profilePic ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=f1f5f9&color=475569`
        }
        className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-sm"
        alt={user.name}
        draggable="false"
      />

      {/* NAME */}
      <p className="text-sm font-bold text-slate-700 truncate flex-1">
        {user.name}
      </p>
      
      {/* CHECKOUT INDICATOR */}
      {isCheckedout && (
        <div className="ml-auto p-1.5 bg-slate-100 rounded-lg text-slate-400 group-hover:text-rose-500 transition-colors">
          <LogOut className="w-3.5 h-3.5" />
        </div>
      )}

      {/* LEAVE DATE INDICATOR */}
      {!!toDate && (
        <div className="ml-auto flex items-center gap-1.5 px-2 py-1 bg-amber-50 border border-amber-100 rounded-md">
          <Calendar className="w-3 h-3 text-amber-600" />
          <span className="text-[10px] font-black text-amber-700 uppercase tracking-tighter tabular-nums">
            {toDate}
          </span>
        </div>
      )}

      {/* REFINED TOOLTIP */}
      {pos && content && (
        <div
          style={{
            position: "fixed",
            top: pos.top,
            left: pos.left,
            transform: "translateY(-50%)"
          }}
          className="z-50 w-64 p-4 rounded-xl shadow-2xl bg-slate-900 border border-slate-800 text-white animate-in fade-in zoom-in duration-150 pointer-events-none"
        >
          {/* Subtle Accent Line */}
          <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-indigo-500 rounded-r-full" />
          
          <div className="relative text-[11px] leading-relaxed font-medium">
            {content}
          </div>
        </div>
      )}
    </div>
  );
}