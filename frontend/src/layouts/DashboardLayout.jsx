import React, { useState } from 'react';
import NavigationHub from "../components/NavigationHub";
import Header from "../components/Header";
import { useLocation } from "react-router-dom";

export default function DashboardLayout({ children }) {
  const [isHubOpen, setIsHubOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-100 dark:bg-zinc-900 transition-colors duration-300 p-2 md:p-4 gap-2 md:gap-4 relative">
      
      <div className="flex-1 flex flex-col overflow-hidden relative gap-2 md:gap-4 w-full">
        <Header toggleHub={() => setIsHubOpen(true)} />

        <div className="flex-1 overflow-auto p-4 md:p-8 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl relative z-10 custom-scrollbar shadow-sm">
          <div key={location.pathname} className="max-w-7xl mx-auto animate-page-transition">
            {children}
          </div>
        </div>
      </div>

      {/* Central Navigation Hub Overlay */}
      <NavigationHub isOpen={isHubOpen} onClose={() => setIsHubOpen(false)} />
    </div>
  );
}
