import React from 'react';

export default function AdminMessagesSkeleton({ count = 4 }) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="p-5 animate-pulse flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-zinc-200 dark:bg-zinc-800"></div>
                <div className="h-5 w-48 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
              </div>
              <div className="flex items-center gap-2 pl-5">
                <div className="h-3 w-32 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                <div className="h-3 w-4 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                <div className="h-3 w-24 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
              </div>
              <div className="space-y-2 pl-5">
                <div className="h-4 w-full max-w-2xl bg-zinc-100 dark:bg-zinc-800/50 rounded"></div>
                <div className="h-4 w-3/4 max-w-lg bg-zinc-100 dark:bg-zinc-800/50 rounded"></div>
              </div>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 rounded-xl bg-zinc-200 dark:bg-zinc-800"></div>
               <div className="w-8 h-8 rounded-xl bg-zinc-200 dark:bg-zinc-800"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
