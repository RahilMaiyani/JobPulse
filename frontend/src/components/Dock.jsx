import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../hooks/useNotifications";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileText,
  Search,
  User,
  MessageSquare,
  MessageCircle,
} from "lucide-react";
import ContactUsModal from "./modals/ContactUsModal";
import { useState, useEffect, useRef } from "react";
import { useUnreadContactCount } from "../hooks/useContact";

export default function Dock() {
  const { user } = useAuth();
  const location = useLocation();
  const isAdminOrHr = user?.role === "admin" || user?.role === "hr";

  const { data: notifications = [] } = useNotifications();
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const { data: unreadContactCount = 0 } = useUnreadContactCount();
  const [showContactModal, setShowContactModal] = useState(false);

  // Robust Auto-hide logic
  const [isDockVisible, setIsDockVisible] = useState(true); // Start visible
  const hideTimeoutRef = useRef(null);
  const isCursorInAreaRef = useRef(false);
  const isDockVisibleRef = useRef(true);

  // Sync ref with state to allow stable effect dependencies
  useEffect(() => {
    isDockVisibleRef.current = isDockVisible;
  }, [isDockVisible]);

  const showDock = () => {
    setIsDockVisible(true);
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  const hideDockDeferred = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    // Stay visible for 3 seconds after leaving the area
    hideTimeoutRef.current = setTimeout(() => {
      setIsDockVisible(false);
    }, 3000);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      // If a modal is open, don't show the dock
      const isModalOpen = document.querySelectorAll('.fixed.inset-0.z-50').length > 0;
      if (isModalOpen) {
        if (isDockVisibleRef.current) {
          setIsDockVisible(false);
          isCursorInAreaRef.current = false;
        }
        return;
      }

      const ww = window.innerWidth;

      // Trigger area: bottom 50px of the screen, center 600px (around the extended dock area)
      const inTriggerY = window.innerHeight - e.clientY < 100;
      const inTriggerX = e.clientX > (ww / 2 - 300) && e.clientX < (ww / 2 + 300);
      const inTriggerArea = inTriggerY && inTriggerX;

      // Keep open area: bottom 160px, center 650px (covering dock and its tooltips comfortable hover region)
      const inKeepOpenY = window.innerHeight - e.clientY < 160;
      const inKeepOpenX = e.clientX > (ww / 2 - 325) && e.clientX < (ww / 2 + 325);
      const inKeepOpenArea = isDockVisibleRef.current && inKeepOpenY && inKeepOpenX;

      const inArea = inTriggerArea || inKeepOpenArea;

      if (inArea) {
        if (!isCursorInAreaRef.current) {
          isCursorInAreaRef.current = true;
          showDock();
        } else {
          // If the cursor is in the area but there's a pending hide timer, clear it
          if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
            hideTimeoutRef.current = null;
          }
        }
      } else {
        if (isCursorInAreaRef.current) {
          isCursorInAreaRef.current = false;
          hideDockDeferred();
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []); // Bound only once!

  // Show dock briefly on page change and keep it up for 3s if cursor is not there
  useEffect(() => {
    showDock();
    if (!isCursorInAreaRef.current) {
      hideDockDeferred();
    }
  }, [location.pathname]);

  const isActive = (path) => {
    if (path === '/admin' || path === '/candidate') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const NavItem = ({ to, icon: Icon, label, badge, onClick }) => {
    const active = isActive(to);

    const Wrapper = to ? Link : 'button';
    const wrapperProps = to ? { to } : { onClick };

    return (
      <Wrapper
        {...wrapperProps}
        className={`relative group flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-110 
          ${active
            ? 'bg-zinc-900/90 dark:bg-white/90 text-white dark:text-zinc-900 shadow-lg shadow-zinc-900/20 dark:shadow-white/20'
            : 'bg-white/40 dark:bg-zinc-800/40 text-zinc-600 dark:text-zinc-300 hover:bg-white/80 dark:hover:bg-zinc-700/80 hover:text-zinc-900 dark:hover:text-zinc-100 hover:shadow-md border border-transparent hover:border-white/50 dark:hover:border-zinc-600/50'
          }
        `}
      >
        <Icon className={`w-5 h-5 md:w-6 md:h-6 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />

        {/* Tooltip */}
        <span className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-zinc-900/90 dark:bg-white/90 backdrop-blur-md text-white dark:text-zinc-900 text-xs font-bold px-3 py-1.5 rounded-xl pointer-events-none whitespace-nowrap shadow-xl border border-white/10 dark:border-black/10">
          {label}
        </span>

        {/* Indicator for Active State */}
        {active && (
          <span className="absolute -bottom-2 w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-white shadow-[0_0_8px_rgba(0,0,0,0.5)] dark:shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
        )}

        {/* Badge */}
        {badge > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-sm shadow-rose-500/30 animate-pulse border-2 border-white dark:border-zinc-900">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </Wrapper>
    );
  };

  return (
    <>
      <div
        className={`hidden md:block fixed bottom-8 left-1/2 -translate-x-1/2 z-40 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isDockVisible ? 'translate-y-0' : 'translate-y-[150%]'
          }`}
      >
        {/* Liquid Glass Container */}
        <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-white/30 dark:bg-zinc-900/40 backdrop-blur-3xl border border-white/50 dark:border-white/10 rounded-[2rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.6)]">

          {/* Logo / Branding Indicator */}
          <Link to={isAdminOrHr ? "/admin" : "/candidate"} className="relative group flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-[1.2rem] bg-zinc-900/90 dark:bg-white/90 shadow-lg transition-transform duration-300 hover:scale-110 hover:-translate-y-2 border border-white/10 dark:border-black/10">
            <Briefcase className="w-6 h-6 text-white dark:text-zinc-900" strokeWidth={2.5} />
            <span className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-zinc-900/90 dark:bg-white/90 backdrop-blur-md text-white dark:text-zinc-900 text-xs font-bold px-3 py-1.5 rounded-xl pointer-events-none whitespace-nowrap shadow-xl border border-white/10 dark:border-black/10">
              JobPulse
            </span>
          </Link>

          <div className="w-px h-8 bg-black/10 dark:bg-white/10 mx-1 md:mx-2 rounded-full" />

          {isAdminOrHr ? (
            <>
              <NavItem to="/admin" icon={LayoutDashboard} label="Overview" />
              <NavItem to="/admin/jobs" icon={Briefcase} label="Job Listings" />
              <NavItem to="/admin/users" icon={Users} label="Manage Users" />
              <NavItem to="/admin/messages" icon={MessageSquare} label="Messages" badge={unreadContactCount} />
            </>
          ) : (
            <>
              <NavItem to="/candidate" icon={LayoutDashboard} label="Dashboard" />
              <NavItem to="/candidate/openings" icon={Search} label="View Openings" />
              <NavItem to="/candidate/applications" icon={FileText} label="Applications" badge={unreadCount} />
              <NavItem to="/candidate/profile" icon={User} label="My Profile" />
              <NavItem onClick={() => setShowContactModal(true)} icon={MessageCircle} label="Contact Us" />
            </>
          )}

          <div className="w-px h-8 bg-black/10 dark:bg-white/10 mx-1 md:mx-2 rounded-full" />

          {/* User Profile */}
          <Link to={isAdminOrHr ? "#" : "/candidate/profile"} className="relative group cursor-pointer w-12 h-12 md:w-14 md:h-14 transition-transform duration-300 hover:scale-110 hover:-translate-y-2">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name)}&background=18181b&color=fff`}
              className="w-full h-full rounded-[1.2rem] object-cover border-2 border-white/50 dark:border-zinc-800 shadow-sm"
              alt={user?.full_name}
              draggable="false"
            />
            <span className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-zinc-900/90 dark:bg-white/90 backdrop-blur-md text-white dark:text-zinc-900 text-xs font-bold px-3 py-1.5 rounded-xl pointer-events-none whitespace-nowrap shadow-xl border border-white/10 dark:border-black/10">
              {user?.full_name}
            </span>
          </Link>

        </div>
      </div>

      {showContactModal && <ContactUsModal onClose={() => setShowContactModal(false)} />}
    </>
  );
}
