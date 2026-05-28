import React from 'react';

export default function ManageUsersSkeleton({ count = 5 }) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto min-h-[400px] flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
              <th className="px-6 py-4 text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">User</th>
              <th className="px-6 py-4 text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Role</th>
              <th className="px-6 py-4 text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {Array.from({ length: count }).map((_, n) => (
              <tr key={n} className="animate-pulse">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0"></div>
                    <div className="space-y-1">
                      <div className="h-5 w-32 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                      <div className="h-4 w-40 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4"><div className="h-6 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-md"></div></td>
                <td className="px-6 py-4"><div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-800 rounded"></div></td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="h-9 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>
                    <div className="h-9 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
