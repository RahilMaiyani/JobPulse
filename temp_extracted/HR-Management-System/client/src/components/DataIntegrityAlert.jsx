import { useState } from "react";
import { CalendarDays, AlertTriangle } from "lucide-react";
import API from "../api/axios";

export default function DataIntegrityAlert({
  ghostSessions,
  users,
  handleRefresh,
  customTimes,
  defaultCheckout,
  handleTimeChange,
  formatTime
}) {
  const [showGhostList, setShowGhostList] = useState(false);

  if (!ghostSessions || ghostSessions.length === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl mb-6 transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div className="flex items-start md:items-center gap-4">
          {/* Soft Tinted Icon Box */}
          <div className="bg-amber-50 p-3 rounded-xl text-amber-600 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">
                Data Integrity Alert
              </h3>
              <span className="bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md">
                Attendance
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1 leading-relaxed">
              <strong className="text-slate-700">{ghostSessions.length}</strong> missing check-outs detected. Please resolve these before running payroll.
            </p>
          </div>
        </div>
        
        <div className="flex gap-2 shrink-0">
          <button 
            onClick={() => setShowGhostList(!showGhostList)}
            className="flex-1 md:flex-none bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm"
          >
            {showGhostList ? "Hide Details" : "Review List"}
          </button>
          <button 
            onClick={async () => {
              try {
                await API.patch('/attendance/bulk-fix'); 
                await handleRefresh(); 
              } catch (err) {
                console.error("Fix failed", err);
              }
            }}
            className="flex-1 md:flex-none bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-sm"
          >
            Fix All ({defaultCheckout})
          </button>
        </div>
      </div>

      {/* EXPANDABLE GHOST LIST */}
      {showGhostList && (
        <div className="mt-5 pt-5 border-t border-amber-100 space-y-3">
          {ghostSessions.map((session) => {
            const user = users.find((u) => u._id === session.userId) || {};
            const selectedTime = customTimes[session._id] || defaultCheckout;
            
            return (
              <div key={session._id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50/50 p-3.5 rounded-xl border border-amber-200 shadow-sm hover:border-amber-300 transition-colors gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={user.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'Unknown')}&background=f8fafc&color=0f172a`}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    alt={user.name}
                    draggable="false"
                  />
                  <div>
                    <p className="text-sm font-bold text-slate-800">{user.name || "Unknown User"}</p>
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                      <CalendarDays className="w-3.5 h-3.5 text-slate-400" /> 
                      {session.date} 
                      <span className="text-slate-300 mx-1">•</span> 
                      <span className="text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">In: {formatTime(session.checkIn)}</span>
                    </p>
                  </div>
                </div>
                
                {/* Custom Time Selector & Action Button */}
                <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-slate-200 shadow-sm">
                  <input 
                    type="time" 
                    value={selectedTime}
                    onChange={(e) => handleTimeChange(session._id, e.target.value)}
                    className="text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
                    title="Select checkout time"
                  />
                  <button
                    onClick={async () => {
                      try {
                        await API.patch(`/attendance/fix/${session._id}`, { customTime: selectedTime });
                        await handleRefresh();
                      } catch (err) {
                        console.error("Single fix failed", err);
                      }
                    }}
                    className="text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 px-4 py-2 rounded-md transition-all active:scale-95"
                  >
                    Close Session
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}