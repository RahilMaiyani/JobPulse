import React from 'react';

export default function PayslipsSkeleton() {
  // Array of 6 to match your ITEMS_PER_PAGE limit
  const skeletonItems = Array(6).fill(0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {skeletonItems.map((_, i) => (
        <div 
          key={i} 
          className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col animate-pulse"
        >
          
          {/* Header Skeleton */}
          <div className="flex justify-between items-start mb-4">
            <div className="space-y-2.5 mt-1">
              {/* Pay Period Label */}
              <div className="h-2 w-16 bg-slate-200/60 rounded uppercase"></div>
              {/* Month/Year Title */}
              <div className="h-5 w-32 bg-slate-200 rounded"></div>
            </div>
            {/* Icon Box */}
            <div className="w-10 h-10 bg-indigo-50/50 rounded-xl"></div>
          </div>

          {/* Body List Skeleton */}
          <div className="space-y-3.5 mb-8 flex-1 mt-2">
            {/* Net Pay Row */}
            <div className="flex items-center">
              <div className="w-24 h-3 bg-slate-100 rounded mr-2"></div>
              <div className="w-20 h-4 bg-slate-200 rounded"></div>
            </div>
            {/* Generated Date Row */}
            <div className="flex items-center">
              <div className="w-24 h-3 bg-slate-100 rounded mr-2"></div>
              <div className="w-24 h-3 bg-slate-200 rounded"></div>
            </div>
            {/* Status Row */}
            <div className="flex items-center">
              <div className="w-24 h-3 bg-slate-100 rounded mr-2"></div>
              <div className="w-16 h-4 bg-emerald-50 rounded"></div>
            </div>
          </div>

          {/* Action Buttons Skeleton */}
          <div className="flex gap-3 mt-auto border-t border-slate-100 pt-5">
            <div className="flex-1 h-9 bg-slate-50 rounded-xl"></div>
            <div className="flex-1 h-9 bg-indigo-50/50 rounded-xl"></div>
          </div>
          
        </div>
      ))}
    </div>
  );
}