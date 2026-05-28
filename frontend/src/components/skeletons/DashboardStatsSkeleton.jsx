import React from 'react';

export default function DashboardStatsSkeleton({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div className="space-y-3">
            <div className="w-24 h-4 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
            <div className="w-16 h-8 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
          </div>
          <div className="w-14 h-14 rounded-xl bg-zinc-200 dark:bg-zinc-800"></div>
        </div>
      ))}
    </div>
  );
}
