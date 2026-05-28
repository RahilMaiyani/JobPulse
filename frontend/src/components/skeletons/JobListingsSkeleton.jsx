import React from 'react';

export default function JobListingsSkeleton({ count = 6, viewMode = 'grid' }) {
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, n) => (
          <div key={n} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-5 animate-pulse flex flex-col justify-between h-[280px]">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-zinc-200 dark:bg-zinc-800 shrink-0"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4"></div>
                  <div className="flex gap-2">
                    <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-16"></div>
                    <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-20"></div>
                  </div>
                </div>
              </div>
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-zinc-200 dark:bg-zinc-800"></div>
                  <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2"></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-zinc-200 dark:bg-zinc-800"></div>
                  <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-2/3"></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-zinc-200 dark:bg-zinc-800"></div>
                  <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3"></div>
                </div>
              </div>
            </div>
            <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-4">
              <div className="h-9 bg-zinc-200 dark:bg-zinc-800 rounded-xl w-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
            <th className="px-6 py-4 text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Role</th>
            <th className="px-6 py-4 text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest hidden md:table-cell">Type</th>
            <th className="px-6 py-4 text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Status</th>
            <th className="px-6 py-4 text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest hidden sm:table-cell">Deadline</th>
            <th className="px-6 py-4 text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {Array.from({ length: count }).map((_, n) => (
            <tr key={n} className="animate-pulse">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-zinc-200 dark:bg-zinc-800 shrink-0"></div>
                  <div className="space-y-1">
                    <div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                    <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 hidden md:table-cell"><div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded"></div></td>
              <td className="px-6 py-4"><div className="h-6 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-md"></div></td>
              <td className="px-6 py-4 hidden sm:table-cell"><div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded"></div></td>
              <td className="px-6 py-4 text-right"><div className="h-9 w-9 bg-zinc-200 dark:bg-zinc-800 rounded-lg ml-auto"></div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
