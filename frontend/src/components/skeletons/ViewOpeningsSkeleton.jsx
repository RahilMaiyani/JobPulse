import React from 'react';

export default function ViewOpeningsSkeleton({ count = 3 }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 animate-pulse">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-zinc-200 dark:bg-zinc-800 shrink-0"></div>
            <div className="space-y-2 pt-0.5">
              <div className="h-7 w-48 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
              <div className="h-5 w-32 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right space-y-2">
              <div className="h-5 w-20 bg-zinc-200 dark:bg-zinc-800 rounded ml-auto"></div>
              <div className="h-3 w-16 bg-zinc-200 dark:bg-zinc-800 rounded ml-auto"></div>
            </div>
            <div className="h-10 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
