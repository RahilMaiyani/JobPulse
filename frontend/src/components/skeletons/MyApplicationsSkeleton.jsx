import React from 'react';

export default function MyApplicationsSkeleton({ count = 5 }) {
  return (
    <>
      {/* Mobile Grid View Skeleton */}
      <div className="grid md:hidden grid-cols-1 gap-4 mb-4">
        {Array.from({ length: count }).map((_, n) => (
          <div key={n} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm flex flex-col gap-4 animate-pulse">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-zinc-200 dark:bg-zinc-800 shrink-0"></div>
              <div className="space-y-2 flex-1">
                <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4"></div>
                <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2"></div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="h-6 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-md"></div>
              <div className="h-6 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-md"></div>
            </div>
            <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/60 pt-4 mt-1">
              <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
              <div className="h-6 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View Skeleton */}
      <div className="hidden md:block bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm dark:shadow-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                <th className="p-4 text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Role & Company</th>
                <th className="p-4 text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Applied On</th>
                <th className="p-4 text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">AI Score</th>
                <th className="p-4 text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {Array.from({ length: count }).map((_, n) => (
                <tr key={n} className="animate-pulse">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-zinc-200 dark:bg-zinc-800 shrink-0"></div>
                      <div className="space-y-1">
                        <div className="h-5 w-32 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                        <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4"><div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded"></div></td>
                  <td className="p-4"><div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div></td>
                  <td className="p-4 text-right"><div className="h-6 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-full ml-auto"></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
