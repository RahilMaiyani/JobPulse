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

  const baseClass = "group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-bold text-sm";
  const activeClass = "bg-white text-slate-900 shadow-sm";
  const inactiveClass = "text-slate-400 hover:bg-slate-800 hover:text-slate-100";

  return (
    <div className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-slate-950 text-white flex flex-col border-r border-slate-800 shrink-0 z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      
      {/* BRANDING */}
      <div className="p-6 md:p-8 mb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-lg shadow-sm">
            <Briefcase className="w-5 h-5 text-slate-900" />
          </div>
          <h1 className="text-xl font-black tracking-tighter uppercase">
            JobDrive
          </h1>
        </div>
        
        {/* Mobile Close Button */}
        <button 
          onClick={() => setIsOpen(false)}
          className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
        
        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4 ml-4 mt-2">
          Main Menu
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
      <div className="p-4 border-t border-slate-800 bg-slate-900/50 mt-auto">
        <div className="flex items-center gap-3 px-2">
          <img
            src={user?.profile_picture_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name)}&background=0f172a&color=fff`}
            className="w-10 h-10 rounded-full object-cover border border-slate-700 shadow-sm"
            alt={user?.full_name}
            draggable="false"
          />
          <div className="flex flex-col truncate">
            <span className="text-sm font-bold text-slate-200 truncate">{user?.full_name}</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{user?.role}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
