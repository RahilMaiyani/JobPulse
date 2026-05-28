import React from 'react';

export default function ManageQuizSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* SKELETON CONFIGURATION */}
      <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-6">
        <div className="w-40 h-6 bg-zinc-200 dark:bg-zinc-800 rounded mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="w-24 h-4 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
            <div className="w-full h-10 bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>
          </div>
          <div className="space-y-2">
            <div className="w-24 h-4 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
            <div className="w-full h-10 bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>
          </div>
        </div>
      </div>
      
      {/* SKELETON QUESTIONS LIST */}
      <div className="space-y-4">
        {[1, 2].map(n => (
          <div key={n} className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="w-24 h-5 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
              <div className="w-8 h-8 bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="w-full h-10 bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>
              <div className="w-full h-10 bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[1, 2, 3, 4].map(o => (
                <div key={o} className="w-full h-10 bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
