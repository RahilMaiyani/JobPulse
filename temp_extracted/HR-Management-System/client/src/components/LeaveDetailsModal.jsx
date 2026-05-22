import { 
  X, 
  Calendar, 
  FileText, 
  MessageSquare, 
  Info, 
  ArrowRight, 
  Wallet, 
  AlertTriangle,
  BriefcaseMedical,
  Coffee,
  Award,
  Scale
} from "lucide-react";

export default function LeaveDetailsModal({ leave, onClose, hideBalances = false }) {
  if (!leave) return null;

  const statusStyles = {
    approved: {
      text: "text-emerald-700",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      badge: "bg-emerald-100 text-emerald-700 border-emerald-200"
    },
    rejected: {
      text: "text-rose-700",
      bg: "bg-rose-50",
      border: "border-rose-100",
      badge: "bg-rose-100 text-rose-700 border-rose-200"
    },
    pending: {
      text: "text-amber-700",
      bg: "bg-amber-50",
      border: "border-amber-100",
      badge: "bg-amber-100 text-amber-700 border-amber-200"
    }
  };

  const current = statusStyles[leave.status] || statusStyles.pending;

  const formatDate = (dateStr) => {
    return dateStr ? dateStr.slice(0, 10) : "";
  };

  // --- BALANCE CALCULATIONS ---
  const start = new Date(leave.fromDate);
  const end = new Date(leave.toDate);
  const requestedDays = Math.round(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1;
  const balances = leave.userId?.leaveBalance || { sick: 0, casual: 0, earned: 0, unpaid: 0 };
  const specificBalance = balances[leave.type];
  const isOutOfBalance = leave.type !== 'unpaid' && specificBalance !== undefined && requestedDays > specificBalance;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6">
      
      {/* MODAL CONTAINER - Dynamically wider for Admin view to fit columns, locked height */}
      <div 
        className={`bg-white w-full ${!hideBalances ? 'max-w-4xl' : 'max-w-2xl'} rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* STICKY HEADER */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white rounded-lg border border-slate-200 shadow-sm">
              <FileText className="w-4 h-4 text-indigo-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">
              Leave Application
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SCROLLABLE BODY (Though structured to not need scrolling on laptops) */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* COMPACT USER PROFILE SECTION */}
          <div className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
            <img
              src={
                leave.userId?.profilePic ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(leave.userId?.name)}&background=random`
              }
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
              alt="Applicant"
              draggable="false"
            />
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-800 tracking-tight">
                {leave.userId?.name}
              </p>
              <p className="text-xs font-medium text-slate-500">
                {leave.userId?.email}
              </p>
            </div>
            <div className="shrink-0">
              <span className={`inline-flex items-center px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest border ${current.badge}`}>
                {leave.status}
              </span>
            </div>
          </div>

          {/* ALL LEAVE BALANCES GRID (Hidden for employees) */}
          {!hideBalances && (
            <div className="grid grid-cols-4 gap-3 bg-white shadow-sm p-3 rounded-xl border border-slate-200">
              <div className={`flex items-center justify-between p-2.5 rounded-lg transition-colors ${leave.type === 'sick' ? 'bg-indigo-50 border border-indigo-100' : 'bg-slate-50/50 opacity-80'}`}>
                <div className="flex items-center gap-2">
                  <BriefcaseMedical className={`w-3.5 h-3.5 ${leave.type === 'sick' ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sick</span>
                </div>
                <span className="text-sm font-black text-slate-700">{balances.sick}</span>
              </div>
              <div className={`flex items-center justify-between p-2.5 rounded-lg transition-colors ${leave.type === 'casual' ? 'bg-indigo-50 border border-indigo-100' : 'bg-slate-50/50 opacity-80'}`}>
                <div className="flex items-center gap-2">
                  <Coffee className={`w-3.5 h-3.5 ${leave.type === 'casual' ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Casual</span>
                </div>
                <span className="text-sm font-black text-slate-700">{balances.casual}</span>
              </div>
              <div className={`flex items-center justify-between p-2.5 rounded-lg transition-colors ${leave.type === 'earned' ? 'bg-indigo-50 border border-indigo-100' : 'bg-slate-50/50 opacity-80'}`}>
                <div className="flex items-center gap-2">
                  <Award className={`w-3.5 h-3.5 ${leave.type === 'earned' ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Earned</span>
                </div>
                <span className="text-sm font-black text-slate-700">{balances.earned}</span>
              </div>
              <div className={`flex items-center justify-between p-2.5 rounded-lg transition-colors ${leave.type === 'unpaid' ? 'bg-indigo-50 border border-indigo-100' : 'bg-slate-50/50 opacity-80'}`}>
                <div className="flex items-center gap-2">
                  <Scale className={`w-3.5 h-3.5 ${leave.type === 'unpaid' ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Unpaid</span>
                </div>
                <span className="text-sm font-black text-slate-600">{balances.unpaid}</span>
              </div>
            </div>
          )}

          {/* MASTER GRID: 3 Columns for Admins, 1 Column for Employees */}
          <div className={`grid grid-cols-1 ${!hideBalances ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-5 h-full`}>
            
            {/* LEFT SIDE (Details, Reason, Comment) - Spans 2 columns if admin */}
            <div className={`${!hideBalances ? 'lg:col-span-2' : ''} flex flex-col gap-5`}>
              
              {/* Type & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1 mb-1.5">
                    <Info className="w-3 h-3" /> Leave Type
                  </p>
                  <div className="h-11 flex items-center px-4 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 capitalize shadow-sm">
                    {leave.type}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1 mb-1.5">
                    <Calendar className="w-3 h-3" /> Duration ({requestedDays} {requestedDays > 1 ? 'Days' : 'Day'})
                  </p>
                  <div className="h-11 flex items-center justify-between px-4 bg-slate-50/50 border border-slate-200 rounded-xl text-[12px] font-bold text-slate-700 tabular-nums shadow-sm">
                    <span>{formatDate(leave.fromDate)}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatDate(leave.toDate)}</span>
                  </div>
                </div>
              </div>

              {/* SIDE-BY-SIDE: REASON & ADMIN COMMENT (Massive vertical space saver) */}
              <div className={`grid grid-cols-1 ${leave.adminComment ? 'sm:grid-cols-2' : ''} gap-4 flex-1`}>
                
                {/* REASON */}
                <div className="flex flex-col h-full">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1.5">Reason for Leave</p>
                  <div className="bg-white p-4 rounded-xl text-slate-700 text-sm leading-relaxed border border-slate-200 italic shadow-sm flex-1 min-h-25">
                    "{leave.reason}"
                  </div>
                </div>

                {/* ADMIN COMMENT */}
                {leave.adminComment && (
                  <div className="flex flex-col h-full">
                    <p className={`text-[10px] font-bold uppercase tracking-widest ml-1 mb-1.5 flex items-center gap-1.5 ${current.text}`}>
                      <MessageSquare className="w-3 h-3" />
                      Administrative Feedback
                    </p>
                    <div className={`${current.bg} ${current.border} p-4 rounded-xl border shadow-sm flex-1 text-sm text-slate-700 font-medium leading-relaxed min-h-25`}>
                      {leave.adminComment}
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* RIGHT SIDE (Admin Gatekeeper Sidebar) */}
            {!hideBalances && (
              <div className="h-full">
                {leave.type !== "unpaid" && specificBalance !== undefined ? (
                  <div className={`p-6 rounded-xl border flex flex-col h-full transition-colors ${isOutOfBalance ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200 shadow-sm'}`}>
                    
                    <div className="flex items-center gap-3 mb-6">
                      <div className={`p-2.5 rounded-lg ${isOutOfBalance ? 'bg-rose-100' : 'bg-white border border-slate-200'}`}>
                        {isOutOfBalance ? <AlertTriangle className="w-5 h-5 text-rose-600" /> : <Wallet className="w-5 h-5 text-emerald-600" />}
                      </div>
                      <p className={`text-sm font-bold uppercase tracking-widest ${isOutOfBalance ? 'text-rose-700' : 'text-slate-500'}`}>
                        Wallet Check
                      </p>
                    </div>
                    
                    <div className="space-y-4 flex-1 flex flex-col justify-center">
                      <div className="flex justify-between items-center border-b border-slate-200/60 pb-4">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Requested</p>
                        <p className={`text-2xl font-black tabular-nums ${isOutOfBalance ? 'text-rose-700' : 'text-slate-700'}`}>
                          {requestedDays} <span className="text-xs text-slate-400 font-bold uppercase">Days</span>
                        </p>
                      </div>
                      <div className="flex justify-between items-center pt-1">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Available</p>
                        <p className={`text-2xl font-black tabular-nums ${isOutOfBalance ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {specificBalance} <span className="text-xs opacity-50 font-bold uppercase">Days</span>
                        </p>
                      </div>
                    </div>
                    
                    {isOutOfBalance && (
                      <div className="mt-6 pt-4 border-t border-rose-200/50 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider leading-relaxed">
                          Request exceeds available balance.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-sm h-full">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-slate-200 mb-4 shadow-sm">
                      <Scale className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-sm font-bold text-slate-600 uppercase tracking-widest">Unpaid Leave</p>
                    <p className="text-[11px] text-slate-400 mt-2 font-medium">Balance check is bypassed for unpaid requests.</p>
                  </div>
                )}
              </div>
            )}
            
          </div>
        </div>

        {/* STICKY FOOTER */}
        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-8 h-10 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-100 transition-all active:scale-95 shadow-sm"
          >
            Dismiss
          </button>
        </div>

      </div>
    </div>
  );
}