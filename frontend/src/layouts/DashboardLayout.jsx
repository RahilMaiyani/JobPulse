import React, { useState } from 'react';
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";

export default function DashboardLayout({ children }) {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-100 dark:bg-zinc-900 transition-colors duration-300 p-2 md:p-4 gap-2 md:gap-4">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-zinc-900/50 dark:bg-zinc-950/80 backdrop-blur-sm z-40 md:hidden rounded-3xl m-2"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Component */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden relative gap-2 md:gap-4">
        <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        <div className="flex-1 overflow-auto p-4 md:p-8 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl relative z-10 custom-scrollbar shadow-sm">
          <div key={location.pathname} className="max-w-7xl mx-auto animate-page-transition">
            {children}
          </div>
        </div>

      </div>
    </div>
  );
}
