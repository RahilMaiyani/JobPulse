import React from 'react';

export default function ViewOpeningsSkeleton({ count = 3 }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 animate-pulse">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-200 shrink-0"></div>
            <div className="space-y-2 pt-0.5">
              <div className="h-7 w-48 bg-slate-200 rounded"></div>
              <div className="h-5 w-32 bg-slate-200 rounded"></div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right space-y-2">
              <div className="h-5 w-20 bg-slate-200 rounded ml-auto"></div>
              <div className="h-3 w-16 bg-slate-200 rounded ml-auto"></div>
            </div>
            <div className="h-10 w-32 bg-slate-200 rounded-xl"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
