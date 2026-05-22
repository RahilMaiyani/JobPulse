import { Link, useLocation } from "react-router-dom";
import { usePendingLeavesCount } from "../hooks/useLeaves";
import { useActiveTicketCount } from "../hooks/useTickets"; 
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  FileStack, 
  CalendarDays,
  ShieldCheck,
  DoorOpen,
  Vault,
  FileBox,
  LifeBuoy,
  IndianRupee,
} from "lucide-react";

export default function Sidebar({ user }) {
  const location = useLocation();
  const isAdmin = user?.role === "admin";
  
  // Custom Hooks for Badges
  const { data: pendingCount = 0 } = usePendingLeavesCount(isAdmin);
  const activeTicketCount = useActiveTicketCount(isAdmin);

  const isActive = (path) => location.pathname === path;

  const baseClass = "group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm";
  const activeClass = "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20";
  const inactiveClass = "text-slate-400 hover:bg-slate-800 hover:text-slate-100";

  return (
    <div className="w-64 bg-slate-950 text-white flex flex-col h-screen sticky top-0 border-r border-slate-800/50">
      
      {/* BRANDING */}
      <div className="p-8 mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-black tracking-tighter uppercase">
            OfficeLink
          </h1>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
        
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 ml-4">
          Main Menu
        </p>

        {/* ADMIN ROUTES */}
        {isAdmin && (
          <>
            <Link
              to="/admin"
              className={`${baseClass} ${isActive("/admin") ? activeClass : inactiveClass}`}
            >
              <LayoutDashboard className="w-5 h-5" />
              Overview
            </Link>

            <Link
              to="/users"
              className={`${baseClass} ${isActive("/users") ? activeClass : inactiveClass}`}
            >
              <Users className="w-5 h-5" />
              Employees
            </Link>

            <Link
              to="/admin/leaves"
              className={`${baseClass} ${isActive("/admin/leaves") ? activeClass : inactiveClass}`}
            >
              <ClipboardList className="w-5 h-5" />
              <span className="flex-1">Management</span>
              {pendingCount > 0 && (
                <span className={`flex items-center animate-pulse justify-center min-w-5 h-5 px-1.5 text-[10px] font-black bg-rose-500 text-white rounded-full ring-4 ring-slate-950`}>
                  {pendingCount}
                </span>
              )}
            </Link>

            <Link 
              to="/admin/reports" 
              className={`${baseClass} ${isActive("/admin/reports") ? activeClass : inactiveClass}`}
            >
              <FileStack className="w-5 h-5" />
              Leave Logs
            </Link>

            <Link 
              to="/admin/documents" 
              className={`${baseClass} ${isActive("/admin/documents") ? activeClass : inactiveClass}`}
            >
              <FileBox className="w-5 h-5" />
              Documents
            </Link>

            {/* Admin Helpdesk with Badge */}
            <Link 
              to="/admin/helpdesk" 
              className={`${baseClass} ${isActive("/admin/helpdesk") ? activeClass : inactiveClass}`}
            >
              <LifeBuoy className={`w-5 h-5 `} />
              <span className="flex-1">Helpdesk</span>
              {activeTicketCount > 0 && (
                <span className={`flex items-center animate-pulse justify-center min-w-5 h-5 px-1.5 text-[10px] font-black bg-blue-500 text-white rounded-full ring-4 ring-slate-950 animate-in zoom-in duration-300`}>
                  {activeTicketCount}
                </span>
              )}
            </Link>
          </>
        )}

        {/* EMPLOYEE ROUTES */}
        {!isAdmin && (
          <>
            <Link
              to="/employee"
              className={`${baseClass} ${isActive("/employee") ? activeClass : inactiveClass}`}
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </Link>

            <Link
              to="/employee/leaves"
              className={`${baseClass} ${isActive("/employee/leaves") ? activeClass : inactiveClass}`}
            >
              <DoorOpen className="w-5 h-5" />
              My Leaves
            </Link>

            <Link
              to="/employee/attendance"
              className={`${baseClass} ${isActive("/employee/attendance") ? activeClass : inactiveClass}`}
            >
              <CalendarDays className="w-5 h-5" />
              Attendance
            </Link>

            <Link
              to="/employee/vault"
              className={`${baseClass} ${isActive("/employee/vault") ? activeClass : inactiveClass}`}
            >
              <Vault className="w-5 h-5" />
              Document Vault
            </Link>

            {/* Employee Helpdesk with Badge */}
            <Link
              to="/employee/helpdesk"
              className={`${baseClass} ${isActive("/employee/helpdesk") ? activeClass : inactiveClass}`}
            >
              <LifeBuoy className={`w-5 h-5 `} />
              <span className="flex-1">Support Helpdesk</span>
              {activeTicketCount > 0 && (
                <span className="flex items-center justify-center min-w-5 h-5 px-1.5 text-[10px] font-black bg-blue-500 text-white rounded-full ring-4 ring-slate-950 animate-in zoom-in duration-300">
                  {activeTicketCount}
                </span>
              )}
            </Link>

            <Link
              to="/employee/financials"
              className={`${baseClass} ${isActive("/employee/financials") ? activeClass : inactiveClass}`}
            >
              <IndianRupee className="w-5 h-5" />
              My Payslips
            </Link>
          </>
        )}
      </nav>

      {/* USER CONTEXT FOOTER */}
      <div className="p-4 border-t border-slate-900 bg-slate-900/30">
        <div className="flex items-center gap-3 px-2">
          <img
            src={user?.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name)}&background=f1f5f9&color=475569`}
            className="w-9 h-9 rounded-full object-cover border border-slate-100 shadow-sm transition-transform group-hover:scale-105"
            alt={user?.name}
            draggable="false"
          />
          <div className="flex flex-col truncate">
            <span className="text-xs font-bold text-slate-200 truncate">{user?.name}</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{user?.role}</span>
          </div>
        </div>
      </div>
    </div>
  );
}