import { useState } from "react";
import EmailModal from "./EmailModal";
import { 
  Mail, 
  Briefcase, 
  Shield, 
  Clock, 
  LogIn, 
  LogOut, 
  Calendar,
  Wallet,
  BriefcaseMedical,
  Coffee,
  Award,
  Scale,
  X
} from "lucide-react";
import Skeleton from "./Skeleton";
import { useUserAttendance } from "../hooks/useAttendance";

export default function UserDetailsModal({ user, onClose }) {
  const [openEmail, setOpenEmail] = useState(false);
  const { data: attendance, isLoading } = useUserAttendance(user?._id);

  if (!user) return null;

  const balances = user.leaveBalance || { sick: 0, casual: 0, earned: 0, unpaid: 0 };

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6">
        {/* MODAL CONTAINER - Locked to 90% of screen height */}
        <div 
          className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* STICKY HEADER */}
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 shrink-0">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-600" />
              Employee Profile
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* SCROLLABLE BODY */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            
            {/* HORIZONTAL PROFILE SECTION (Saves vertical space) */}
            <div className="flex items-center gap-5 p-5 bg-slate-50/50 rounded-xl border border-slate-100">
              <div className="relative shrink-0">
                <img
                  src={user.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=f1f5f9&color=475569`}
                  className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-sm"
                  alt={user.name}
                  draggable="false"
                />
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
              </div>
              
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">{user.name}</h2>
                <div className="flex items-center gap-1.5 text-slate-500 text-sm mt-1">
                  <Mail className="w-3.5 h-3.5" />
                  {user.email}
                </div>
              </div>

              {/* ROLE BADGES */}
              <div className="flex flex-col gap-2 shrink-0 text-right">
                <span className="inline-flex items-center justify-end gap-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                  <Shield className="w-3 h-3" /> {user.role}
                </span>
                <span className="inline-flex items-center justify-end gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                  <Briefcase className="w-3 h-3" /> {user.department || "General"}
                </span>
              </div>
            </div>

            {/* LEAVE WALLET SECTION */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                <Wallet className="w-4 h-4 text-slate-300" /> Leave Wallet
              </h3>
              
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-3 flex flex-col items-center text-center">
                  <BriefcaseMedical className="w-4 h-4 text-rose-500 mb-1" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sick</span>
                  <span className="text-lg font-black text-slate-800 mt-0.5">{balances.sick}</span>
                </div>
                <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-3 flex flex-col items-center text-center">
                  <Coffee className="w-4 h-4 text-emerald-500 mb-1" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Casual</span>
                  <span className="text-lg font-black text-slate-800 mt-0.5">{balances.casual}</span>
                </div>
                <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-3 flex flex-col items-center text-center">
                  <Award className="w-4 h-4 text-indigo-500 mb-1" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Earned</span>
                  <span className="text-lg font-black text-slate-800 mt-0.5">{balances.earned}</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 shadow-sm rounded-xl p-3 flex flex-col items-center text-center opacity-80">
                  <Scale className="w-4 h-4 text-slate-500 mb-1" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unpaid</span>
                  <span className="text-lg font-black text-slate-600 mt-0.5">{balances.unpaid}</span>
                </div>
              </div>
            </div>

            {/* COMPACT ATTENDANCE SECTION */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                <Clock className="w-4 h-4 text-slate-300" /> Today's Activity
              </h3>

              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-14 w-full rounded-xl" />
                </div>
              ) : attendance ? (
                <div className="flex items-center justify-between p-4 bg-white border border-slate-200 shadow-sm rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      <Calendar className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</p>
                      <p className="text-sm font-bold text-slate-700">{attendance.date}</p>
                    </div>
                  </div>

                  <div className="flex gap-6">
                    <div>
                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter flex items-center gap-1">
                        <LogIn className="w-3 h-3" /> Check In
                      </p>
                      <p className="text-sm font-black text-emerald-700 tabular-nums">
                        {attendance.checkIn ? new Date(attendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-rose-600 uppercase tracking-tighter flex items-center gap-1">
                        <LogOut className="w-3 h-3" /> Check Out
                      </p>
                      <p className="text-sm font-black text-rose-700 tabular-nums">
                        {attendance.checkout || attendance.checkOut 
                          ? new Date(attendance.checkout || attendance.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                          : "—"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No activity found today</p>
                </div>
              )}
            </div>
          </div>

          {/* STICKY FOOTER ACTIONS */}
          <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 shrink-0 flex gap-3">
            <button
              onClick={() => setOpenEmail(true)}
              className="flex-1 h-11 bg-indigo-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Message Employee
            </button>
            <button
              onClick={onClose}
              className="px-8 h-11 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
          </div>

        </div>
      </div>

      <EmailModal
        isOpen={openEmail}
        onClose={() => setOpenEmail(false)}
        user={user}
        template={null}
      />
    </>
  );
}