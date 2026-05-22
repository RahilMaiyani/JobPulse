
const LeaveTableSkeleton = () => {
  return (
    <div className="animate-pulse space-y-8">
      {/* HEADER SKELETON */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div className="space-y-3">
          <div className="h-7 w-48 bg-slate-200 rounded-md"></div>
          <div className="h-4 w-64 bg-slate-100 rounded-md"></div>
        </div>
        <div className="h-11 w-32 bg-slate-200 rounded-lg"></div>
      </div>

      {/* TABLE SKELETON */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 h-12 border-b border-slate-200"></div>
        <div className="divide-y divide-slate-100">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="px-6 py-5 flex items-center justify-between">
              {/* Type & Reason */}
              <div className="space-y-2 flex-1">
                <div className="h-4 w-24 bg-slate-200 rounded"></div>
                <div className="h-3 w-40 bg-slate-100 rounded"></div>
              </div>
              {/* Duration */}
              <div className="flex-1 flex justify-center gap-3">
                <div className="h-8 w-12 bg-slate-100 rounded"></div>
                <div className="h-8 w-12 bg-slate-100 rounded"></div>
              </div>
              {/* Status */}
              <div className="flex-1 flex justify-center">
                <div className="h-6 w-20 bg-slate-200 rounded-md"></div>
              </div>
              {/* Action */}
              <div className="flex-1 flex justify-end">
                <div className="h-4 w-16 bg-slate-100 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeaveTableSkeleton;