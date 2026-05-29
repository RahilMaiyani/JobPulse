import React, { useState, useEffect } from 'react';
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../hooks/useNotifications";
import { useUnreadContactCount } from "../hooks/useContact";
import ContactUsModal from "./modals/ContactUsModal";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Search,
  FileText,
  User,
  MessageSquare,
  MessageCircle,
  X,
  LogOut
} from "lucide-react";

export default function NavigationHub({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isAdminOrHr = user?.role === "admin" || user?.role === "hr";

  const { data: notifications = [] } = useNotifications();
  const unreadCount = notifications.filter(n => !n.is_read).length;
  const { data: unreadContactCount = 0 } = useUnreadContactCount();
  const [showContactModal, setShowContactModal] = useState(false);

  // Close hub when route changes
  useEffect(() => {
    onClose();
  }, [location.pathname]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const isActive = (path) => {
    if (path === '/admin' || path === '/candidate') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const adminRoutes = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard, color: 'bg-indigo-500', colSpan: 'col-span-2 row-span-2' },
    { name: 'Job Listings', path: '/admin/jobs', icon: Briefcase, color: 'bg-emerald-500', colSpan: 'col-span-1 row-span-2' },
    { name: 'Manage Users', path: '/admin/users', icon: Users, color: 'bg-amber-500', colSpan: 'col-span-1 row-span-1' },
    { name: 'Messages', path: '/admin/messages', icon: MessageSquare, badge: unreadContactCount, color: 'bg-rose-500', colSpan: 'col-span-2 row-span-1' }
  ];

  const candidateRoutes = [
    { name: 'Dashboard', path: '/candidate', icon: LayoutDashboard, color: 'bg-indigo-500', colSpan: 'col-span-2 row-span-2' },
    { name: 'View Openings', path: '/candidate/openings', icon: Search, color: 'bg-blue-500', colSpan: 'col-span-1 row-span-1' },
    { name: 'My Applications', path: '/candidate/applications', icon: FileText, badge: unreadCount, color: 'bg-emerald-500', colSpan: 'col-span-1 row-span-2' },
    { name: 'My Profile', path: '/candidate/profile', icon: User, color: 'bg-purple-500', colSpan: 'col-span-1 row-span-1' },
  ];

  const routes = isAdminOrHr ? adminRoutes : candidateRoutes;

  return (
    <>
      <div 
        className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]
        ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        {/* Background Glass Overlay */}
        <div 
          className="absolute inset-0 bg-zinc-100/60 dark:bg-zinc-950/60 backdrop-blur-3xl transition-opacity duration-500"
          onClick={onClose}
        />

        {/* Hub Container */}
        <div 
          className={`relative w-full max-w-4xl p-6 md:p-12 mx-4 flex flex-col gap-8 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]
          ${isOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-8 opacity-0'}`}
        >
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-zinc-900 dark:bg-white rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                <Briefcase className="w-6 h-6 text-white dark:text-zinc-900" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">Navigation Hub</h2>
                <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 mt-1 uppercase tracking-widest">Select your destination</p>
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-white/50 dark:bg-zinc-900/50 hover:bg-white dark:hover:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-700/50 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white shadow-sm backdrop-blur-sm transition-all hover:scale-105 active:scale-95"
            >
              <X className="w-6 h-6" strokeWidth={2.5} />
            </button>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 grid-rows-3 md:grid-rows-2 gap-4 h-[50vh] min-h-[400px]">
            {routes.map((route, idx) => {
              const active = isActive(route.path);
              const Icon = route.icon;
              return (
                <Link
                  key={idx}
                  to={route.path}
                  className={`group relative overflow-hidden rounded-3xl transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] ${route.colSpan} 
                    ${active ? 'bg-zinc-900 dark:bg-white border-transparent' : 'bg-white/80 dark:bg-zinc-900/80 hover:bg-white dark:hover:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-800/50'}
                    shadow-sm hover:shadow-xl backdrop-blur-md flex flex-col justify-between p-6`}
                >
                  {/* Decorative Background Blob */}
                  <div className={`absolute -right-8 -bottom-8 w-32 h-32 rounded-full ${route.color} opacity-20 blur-2xl group-hover:opacity-40 transition-opacity duration-500`} />
                  
                  <div className="flex justify-between items-start relative z-10">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6
                      ${active ? 'bg-zinc-800 dark:bg-zinc-100' : 'bg-zinc-100 dark:bg-zinc-800'}
                    `}>
                      <Icon className={`w-6 h-6 ${active ? 'text-white dark:text-zinc-900' : 'text-zinc-700 dark:text-zinc-300'}`} strokeWidth={2.5} />
                    </div>

                    {route.badge > 0 && (
                      <span className="bg-rose-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-sm shadow-rose-500/30 animate-pulse border-2 border-white dark:border-zinc-900">
                        {route.badge > 9 ? '9+' : route.badge} New
                      </span>
                    )}
                  </div>
                  
                  <div className="relative z-10 mt-auto">
                    <h3 className={`text-xl md:text-2xl font-black tracking-tight mb-1
                      ${active ? 'text-white dark:text-zinc-900' : 'text-zinc-900 dark:text-white'}
                    `}>{route.name}</h3>
                    {active && <p className={`text-xs font-bold uppercase tracking-wider ${active ? 'text-zinc-400 dark:text-zinc-500' : ''}`}>Current Page</p>}
                  </div>
                </Link>
              )
            })}

            {/* Extra Actions Container */}
            {!isAdminOrHr && (
              <button
                onClick={() => { setShowContactModal(true); onClose(); }}
                className="group relative overflow-hidden rounded-3xl transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] col-span-1 row-span-1 bg-white/80 dark:bg-zinc-900/80 hover:bg-white dark:hover:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm hover:shadow-xl backdrop-blur-md flex flex-col justify-between p-6"
              >
                <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-orange-500 opacity-20 blur-2xl group-hover:opacity-40 transition-opacity duration-500" />
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6 bg-zinc-100 dark:bg-zinc-800">
                  <MessageCircle className="w-6 h-6 text-zinc-700 dark:text-zinc-300" strokeWidth={2.5} />
                </div>
                <h3 className="text-xl md:text-2xl font-black tracking-tight text-zinc-900 dark:text-white mt-auto text-left">Contact Us</h3>
              </button>
            )}

            {/* Global User / Logout Area inside Bento */}
            <div className={`col-span-2 md:col-span-2 row-span-1 rounded-3xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-md shadow-sm p-4 flex items-center justify-between transition-all duration-500 hover:shadow-xl hover:bg-white dark:hover:bg-zinc-800 ${isAdminOrHr ? '' : 'col-span-1 md:col-span-1'}`}>
              <div className="flex items-center gap-4">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name)}&background=0f172a&color=fff`}
                  className="w-14 h-14 rounded-2xl object-cover shadow-md border-2 border-white dark:border-zinc-800"
                  alt={user?.full_name}
                />
                <div>
                  <h3 className="text-lg font-black text-zinc-900 dark:text-white">{user?.full_name}</h3>
                  <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">{user?.role}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors group"
                title="Log Out"
              >
                <LogOut className="w-5 h-5 transition-transform group-hover:scale-110 group-hover:-translate-x-1" strokeWidth={2.5} />
              </button>
            </div>

          </div>
        </div>
      </div>

      {showContactModal && <ContactUsModal onClose={() => setShowContactModal(false)} />}
    </>
  );
}
