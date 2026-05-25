import React from 'react';

export default function AptitudeTestSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-900 flex flex-col font-sans animate-pulse">
      {/* SKELETON HEADER */}
      <header className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 sticky top-0 z-40 shadow-sm px-6 h-20 flex items-center justify-between">
        <div className="w-48 h-6 bg-slate-200 dark:bg-zinc-800 rounded"></div>
        <div className="w-32 h-10 bg-slate-200 dark:bg-zinc-800 rounded-xl"></div>
      </header>

      {/* SKELETON MAIN CONTENT */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-8">
        {/* SKELETON SIDEBAR */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 shadow-sm">
            <div className="w-32 h-4 bg-slate-200 dark:bg-zinc-800 rounded mb-4"></div>
            <div className="grid grid-cols-5 gap-2">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-10 rounded-lg bg-slate-200 dark:bg-zinc-800"></div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-zinc-800">
               <div className="w-full h-4 bg-slate-200 dark:bg-zinc-800 rounded mb-2"></div>
               <div className="w-full h-2 bg-slate-200 dark:bg-zinc-800 rounded-full mt-2"></div>
            </div>
          </div>
        </div>

        {/* SKELETON QUESTION AREA */}
        <div className="flex-1 flex flex-col">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm p-6 sm:p-10 flex-1">
            <div className="mb-8">
              <div className="w-32 h-8 bg-slate-200 dark:bg-zinc-800 rounded-lg mb-4"></div>
              <div className="w-full h-8 bg-slate-200 dark:bg-zinc-800 rounded mb-2"></div>
              <div className="w-3/4 h-8 bg-slate-200 dark:bg-zinc-800 rounded"></div>
            </div>
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-full h-16 bg-slate-200 dark:bg-zinc-800 rounded-2xl border-2 border-slate-100 dark:border-zinc-800"></div>
              ))}
            </div>
          </div>
          
          {/* SKELETON BOTTOM NAV */}
          <div className="mt-6 flex items-center justify-between">
            <div className="w-32 h-12 bg-slate-200 dark:bg-zinc-800 rounded-xl"></div>
            <div className="w-32 h-12 bg-slate-200 dark:bg-zinc-800 rounded-xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
