import { Link, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../hooks/useNotifications";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileText,
  Search,
  User,
  X,
  MessageSquare,
  MessageCircle
} from "lucide-react";
import ContactUsModal from "./modals/ContactUsModal";
import { useState } from "react";
import { useUnreadContactCount } from "../hooks/useContact";
import { prefetchRoute } from "../utils/prefetchRoutes";

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user } = useAuth();
  const location = useLocation();
  const queryClient = useQueryClient();
  const isAdminOrHr = user?.role === "admin" || user?.role === "hr";

  const { data: notifications = [] } = useNotifications();
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const { data: unreadContactCount = 0 } = useUnreadContactCount(isAdminOrHr);

  const [showContactModal, setShowContactModal] = useState(false);

  const isActive = (path) => {
    if (path === '/admin' || path === '/candidate') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const baseClass = "group flex items-center gap-3 px-4 py-3.5 mx-3 rounded-xl transition-all duration-300 font-bold text-sm relative z-10 overflow-hidden";
  const activeClass = "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md shadow-zinc-900/10 dark:shadow-white/10";
  const inactiveClass = "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-zinc-900 dark:hover:text-zinc-100";

  return (
    <div className={`fixed md:relative top-2 bottom-2 left-2 md:top-0 md:bottom-0 md:left-0 h-[calc(100vh-1rem)] md:h-full w-72 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col border border-zinc-200 dark:border-zinc-800 rounded-3xl shrink-0 z-50 transform transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] shadow-sm ${isOpen ? 'translate-x-0' : '-translate-x-[120%] md:translate-x-0'}`}>

      {/* BRANDING */}
      <div className="p-8 mb-2 flex items-center justify-between group cursor-pointer">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-zinc-900 dark:bg-white rounded-xl flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm">
            <Briefcase className="w-5 h-5 text-white dark:text-zinc-900" strokeWidth={2.5} />
          </div>
          <h1 className="text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 transition-colors group-hover:text-zinc-600 dark:group-hover:text-zinc-400">
            JobPulse<span className="text-zinc-400 dark:text-zinc-600 animate-pulse">.</span>
          </h1>
        </div>

        {/* Mobile Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="md:hidden p-2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto custom-scrollbar relative z-10 py-4">

        <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-4 ml-8 flex items-center gap-2">
          Menu <span className="h-[1px] flex-1 bg-zinc-100 dark:bg-zinc-800 mr-6"></span>
        </p>

        {/* ADMIN / HR ROUTES */}
        {isAdminOrHr && (
          <>
            <Link
              to="/admin"
              onMouseEnter={() => prefetchRoute("/admin", queryClient)}
              onTouchStart={() => prefetchRoute("/admin", queryClient)}
              onClick={() => setIsOpen(false)}
              className={`${baseClass} ${isActive("/admin") && location.pathname === '/admin' ? activeClass : inactiveClass}`}
            >
              {isActive("/admin") && location.pathname === '/admin' && <span className="absolute inset-0 bg-zinc-900 dark:bg-white -z-10 rounded-2xl animate-page-transition" />}
              <LayoutDashboard className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive("/admin") && location.pathname === '/admin' ? 'scale-110' : 'group-hover:-rotate-3'}`} />
              <span className={isActive("/admin") && location.pathname === '/admin' ? "animate-text-reveal inline-block" : "inline-block"}>Overview</span>
            </Link>

            <Link
              to="/admin/jobs"
              onMouseEnter={() => prefetchRoute("/admin/jobs", queryClient)}
              onTouchStart={() => prefetchRoute("/admin/jobs", queryClient)}
              onClick={() => setIsOpen(false)}
              className={`${baseClass} ${isActive("/admin/jobs") ? activeClass : inactiveClass}`}
            >
              {isActive("/admin/jobs") && <span className="absolute inset-0 bg-zinc-900 dark:bg-white -z-10 rounded-2xl animate-page-transition" />}
              <Briefcase className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive("/admin/jobs") ? 'scale-110' : 'group-hover:-rotate-3'}`} />
              <span className={isActive("/admin/jobs") ? "animate-text-reveal inline-block" : "inline-block"}>Job Listings</span>
            </Link>

            <Link
              to="/admin/users"
              onMouseEnter={() => prefetchRoute("/admin/users", queryClient)}
              onTouchStart={() => prefetchRoute("/admin/users", queryClient)}
              onClick={() => setIsOpen(false)}
              className={`${baseClass} ${isActive("/admin/users") ? activeClass : inactiveClass}`}
            >
              {isActive("/admin/users") && <span className="absolute inset-0 bg-zinc-900 dark:bg-white -z-10 rounded-2xl animate-page-transition" />}
              <Users className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive("/admin/users") ? 'scale-110' : 'group-hover:-rotate-3'}`} />
              <span className={isActive("/admin/users") ? "animate-text-reveal inline-block" : "inline-block"}>Manage Users</span>
            </Link>

            <Link
              to="/admin/messages"
              onMouseEnter={() => prefetchRoute("/admin/messages", queryClient)}
              onTouchStart={() => prefetchRoute("/admin/messages", queryClient)}
              onClick={() => setIsOpen(false)}
              className={`${baseClass} ${isActive("/admin/messages") ? activeClass : inactiveClass} justify-between`}
            >
              {isActive("/admin/messages") && <span className="absolute inset-0 bg-zinc-900 dark:bg-white -z-10 rounded-2xl animate-page-transition" />}
              <div className="flex items-center gap-3">
                <MessageSquare className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive("/admin/messages") ? 'scale-110' : 'group-hover:-rotate-3'}`} />
                <span className={isActive("/admin/messages") ? "animate-text-reveal inline-block" : "inline-block"}>Messages</span>
              </div>
              {unreadContactCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm shadow-rose-500/20 animate-pulse">
                  {unreadContactCount}
                </span>
              )}
            </Link>
          </>
        )}

        {/* CANDIDATE ROUTES */}
        {!isAdminOrHr && (
          <>
            <Link
              to="/candidate"
              onMouseEnter={() => prefetchRoute("/candidate", queryClient)}
              onTouchStart={() => prefetchRoute("/candidate", queryClient)}
              onClick={() => setIsOpen(false)}
              className={`${baseClass} ${isActive("/candidate") && location.pathname === '/candidate' ? activeClass : inactiveClass}`}
            >
              {isActive("/candidate") && location.pathname === '/candidate' && <span className="absolute inset-0 bg-zinc-900 dark:bg-white -z-10 rounded-2xl animate-page-transition" />}
              <LayoutDashboard className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive("/candidate") && location.pathname === '/candidate' ? 'scale-110' : 'group-hover:-rotate-3'}`} />
              <span className={isActive("/candidate") && location.pathname === '/candidate' ? "animate-text-reveal inline-block" : "inline-block"}>Dashboard</span>
            </Link>

            <Link
              to="/candidate/openings"
              onMouseEnter={() => prefetchRoute("/candidate/openings", queryClient)}
              onTouchStart={() => prefetchRoute("/candidate/openings", queryClient)}
              onClick={() => setIsOpen(false)}
              className={`${baseClass} ${isActive("/candidate/openings") ? activeClass : inactiveClass}`}
            >
              {isActive("/candidate/openings") && <span className="absolute inset-0 bg-zinc-900 dark:bg-white -z-10 rounded-2xl animate-page-transition" />}
              <Search className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive("/candidate/openings") ? 'scale-110' : 'group-hover:-rotate-3'}`} />
              <span className={isActive("/candidate/openings") ? "animate-text-reveal inline-block" : "inline-block"}>View Openings</span>
            </Link>

            <Link
              to="/candidate/applications"
              onMouseEnter={() => prefetchRoute("/candidate/applications", queryClient)}
              onTouchStart={() => prefetchRoute("/candidate/applications", queryClient)}
              onClick={() => setIsOpen(false)}
              className={`${baseClass} ${isActive("/candidate/applications") ? activeClass : inactiveClass} justify-between`}
            >
              {isActive("/candidate/applications") && <span className="absolute inset-0 bg-zinc-900 dark:bg-white -z-10 rounded-2xl animate-page-transition" />}
              <div className="flex items-center gap-3">
                <FileText className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive("/candidate/applications") ? 'scale-110' : 'group-hover:-rotate-3'}`} />
                <span className={isActive("/candidate/applications") ? "animate-text-reveal inline-block" : "inline-block"}>My Applications</span>
              </div>
              {unreadCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm shadow-rose-500/20 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </Link>

            <Link
              to="/candidate/profile"
              onMouseEnter={() => prefetchRoute("/candidate/profile", queryClient)}
              onTouchStart={() => prefetchRoute("/candidate/profile", queryClient)}
              onClick={() => setIsOpen(false)}
              className={`${baseClass} ${isActive("/candidate/profile") ? activeClass : inactiveClass}`}
            >
              {isActive("/candidate/profile") && <span className="absolute inset-0 bg-zinc-900 dark:bg-white -z-10 rounded-2xl animate-page-transition" />}
              <User className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive("/candidate/profile") ? 'scale-110' : 'group-hover:-rotate-3'}`} />
              <span className={isActive("/candidate/profile") ? "animate-text-reveal inline-block" : "inline-block"}>My Profile</span>
            </Link>

            <button
              onClick={() => setShowContactModal(true)}
              className={`${baseClass} ${inactiveClass} w-[calc(100%-1.5rem)] text-left justify-start`}
            >
              <MessageCircle className="w-5 h-5 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3" />
              Contact Us
            </button>
          </>
        )}
      </nav>

      {showContactModal && <ContactUsModal onClose={() => setShowContactModal(false)} />}

      {/* USER CONTEXT FOOTER */}
      <div className="p-4 m-4 rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 relative z-10 group hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors cursor-pointer">
        <div className="flex items-center gap-3">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name)}&background=0f172a&color=fff`}
            className="w-10 h-10 rounded-2xl object-cover border-2 border-white dark:border-zinc-800 shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3"
            alt={user?.full_name}
            draggable="false"
          />
          <div className="flex flex-col truncate">
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors">{user?.full_name}</span>
            <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">{user?.role}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
