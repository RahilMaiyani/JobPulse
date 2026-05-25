import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  LayoutDashboard, 
  Briefcase,
  Users,
  FileText,
  Search,
  User,
  X
} from "lucide-react";

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user } = useAuth();
  const location = useLocation();
  const isAdminOrHr = user?.role === "admin" || user?.role === "hr";

  const isActive = (path) => {
    if (path === '/admin' || path === '/candidate') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const baseClass = "group flex items-center gap-3 px-4 py-3.5 mx-3 rounded-xl transition-all duration-300 font-bold text-sm relative z-10 overflow-hidden";
  const activeClass = "bg-slate-900 dark:bg-white text-white dark:text-zinc-900 shadow-md shadow-slate-900/10 dark:shadow-white/10";
  const inactiveClass = "text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/80 hover:text-slate-900 dark:hover:text-zinc-100";

  return (
    <div className={`fixed md:sticky top-0 left-0 h-screen w-72 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col border-r border-slate-200 dark:border-zinc-800 shrink-0 z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      
      {/* BRANDING */}
      <div className="p-8 mb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center shrink-0">
            <Briefcase className="w-5 h-5 text-white dark:text-zinc-900" strokeWidth={2.5} />
          </div>
          <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-zinc-100">
            JobDrive<span className="text-slate-400 dark:text-zinc-600">.</span>
          </h1>
        </div>
        
        {/* Mobile Close Button */}
        <button 
          onClick={() => setIsOpen(false)}
          className="md:hidden p-2 text-slate-400 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-zinc-100 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto custom-scrollbar relative z-10 py-4">
        
        <p className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-3 ml-7">
          Menu
        </p>

        {/* ADMIN / HR ROUTES */}
        {isAdminOrHr && (
          <>
            <Link
              to="/admin"
              onClick={() => setIsOpen(false)}
              className={`${baseClass} ${isActive("/admin") && location.pathname === '/admin' ? activeClass : inactiveClass}`}
            >
              <LayoutDashboard className="w-5 h-5" />
              Overview
            </Link>

            <Link
              to="/admin/jobs"
              onClick={() => setIsOpen(false)}
              className={`${baseClass} ${isActive("/admin/jobs") ? activeClass : inactiveClass}`}
            >
              <Briefcase className="w-5 h-5" />
              Job Listings
            </Link>

            <Link
              to="/admin/users"
              onClick={() => setIsOpen(false)}
              className={`${baseClass} ${isActive("/admin/users") ? activeClass : inactiveClass}`}
            >
              <Users className="w-5 h-5" />
              Manage Users
            </Link>
          </>
        )}

        {/* CANDIDATE ROUTES */}
        {!isAdminOrHr && (
          <>
            <Link
              to="/candidate"
              onClick={() => setIsOpen(false)}
              className={`${baseClass} ${isActive("/candidate") && location.pathname === '/candidate' ? activeClass : inactiveClass}`}
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </Link>

            <Link
              to="/candidate/openings"
              onClick={() => setIsOpen(false)}
              className={`${baseClass} ${isActive("/candidate/openings") ? activeClass : inactiveClass}`}
            >
              <Search className="w-5 h-5" />
              View Openings
            </Link>

            <Link
              to="/candidate/applications"
              onClick={() => setIsOpen(false)}
              className={`${baseClass} ${isActive("/candidate/applications") ? activeClass : inactiveClass}`}
            >
              <FileText className="w-5 h-5" />
              My Applications
            </Link>

            <Link
              to="/candidate/profile"
              onClick={() => setIsOpen(false)}
              className={`${baseClass} ${isActive("/candidate/profile") ? activeClass : inactiveClass}`}
            >
              <User className="w-5 h-5" />
              My Profile
            </Link>
          </>
        )}
      </nav>

      {/* USER CONTEXT FOOTER */}
      <div className="p-4 m-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 relative z-10">
        <div className="flex items-center gap-3">
          <img
            src={user?.profile_picture_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name)}&background=0f172a&color=fff`}
            className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-zinc-800 shadow-sm"
            alt={user?.full_name}
            draggable="false"
          />
          <div className="flex flex-col truncate">
            <span className="text-sm font-bold text-slate-900 dark:text-zinc-100 truncate">{user?.full_name}</span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest">{user?.role}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
