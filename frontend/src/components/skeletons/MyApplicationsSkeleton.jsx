import React from 'react';

export default function MyApplicationsSkeleton({ count = 5 }) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-sm overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800">
            <th className="p-4 text-xs font-black text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Role & Company</th>
            <th className="p-4 text-xs font-black text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Applied On</th>
            <th className="p-4 text-xs font-black text-slate-500 dark:text-zinc-400 uppercase tracking-wider">AI Score</th>
            <th className="p-4 text-xs font-black text-slate-500 dark:text-zinc-400 uppercase tracking-wider text-right">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {Array.from({ length: count }).map((_, n) => (
            <tr key={n} className="animate-pulse">
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-zinc-800 shrink-0"></div>
                  <div className="space-y-1">
                    <div className="h-5 w-32 bg-slate-200 dark:bg-zinc-800 rounded"></div>
                    <div className="h-4 w-24 bg-slate-200 dark:bg-zinc-800 rounded"></div>
                  </div>
                </div>
              </td>
              <td className="p-4"><div className="h-4 w-24 bg-slate-200 dark:bg-zinc-800 rounded"></div></td>
              <td className="p-4"><div className="w-10 h-10 bg-slate-200 dark:bg-zinc-800 rounded-xl"></div></td>
              <td className="p-4 text-right"><div className="h-6 w-20 bg-slate-200 dark:bg-zinc-800 rounded-full ml-auto"></div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
