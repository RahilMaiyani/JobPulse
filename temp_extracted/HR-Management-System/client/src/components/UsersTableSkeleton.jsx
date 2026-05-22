export default function UsersTableSkeleton() {
  return (
    <div className="animate-pulse space-y-8 w-full">
      
      {/* HEADER & FILTERS SKELETON */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        {/* Title Area */}
        <div className="space-y-3">
          <div className="h-8 w-64 bg-slate-200 rounded-md"></div>
          <div className="h-4 w-96 bg-slate-100 rounded-md"></div>
        </div>

        {/* Search & Filter Area */}
        <div className="flex items-center gap-4">
          <div className="h-11 w-64 bg-slate-200 rounded-lg"></div>
          <div className="h-11 w-45 bg-slate-200 rounded-lg"></div>
        </div>
      </div>

      {/* TABLE SKELETON */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Table Header */}
        <div className="bg-slate-50 h-12 border-b border-slate-200"></div>
        
        {/* Table Rows */}
        <div className="divide-y divide-slate-100">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="px-6 py-5 flex items-center justify-between">
              
              {/* Employee Col (Avatar + Name + Badge) */}
              <div className="flex items-center gap-4 w-1/4">
                <div className="w-11 h-11 rounded-full bg-slate-200 shrink-0"></div>
                <div className="space-y-2 w-full">
                  <div className="h-4 w-32 bg-slate-200 rounded-sm"></div>
                  <div className="h-4 w-16 bg-slate-100 rounded"></div>
                </div>
              </div>

              {/* Contact Info Col */}
              <div className="w-1/4 flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-slate-100 shrink-0"></div>
                <div className="h-4 w-40 bg-slate-100 rounded-sm"></div>
              </div>

              {/* Organization Col */}
              <div className="w-1/4 flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-slate-100 shrink-0"></div>
                <div className="h-4 w-24 bg-slate-100 rounded-sm"></div>
              </div>

              {/* Actions Col */}
              <div className="w-1/4 flex justify-end gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100"></div>
                <div className="w-8 h-8 rounded-lg bg-slate-100"></div>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}