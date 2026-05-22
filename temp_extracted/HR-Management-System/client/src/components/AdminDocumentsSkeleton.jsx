export default function AdminDocumentsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* HEADER SKELETON */}
      <div>
        <div className="h-9 w-72 bg-slate-200 rounded-md mb-2"></div>
        <div className="h-4 w-96 bg-slate-100 rounded-md"></div>
      </div>

      {/* SEARCH & SELECT CARD SKELETON */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="h-4 w-32 bg-slate-100 rounded"></div>
        
        {/* Search Input Box */}
        <div className="h-10 w-full bg-slate-100 rounded-lg"></div>

        {/* List of Employees */}
        <div className="space-y-2 border border-slate-100 rounded-lg p-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 space-y-2">
              <div className="h-4 w-48 bg-slate-200 rounded"></div>
              <div className="h-3 w-64 bg-slate-100 rounded"></div>
            </div>
          ))}
        </div>
      </div>

      {/* DOCUMENT GRID AREA PLACEHOLDER */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 bg-slate-50 border border-slate-100 rounded-xl"></div>
        ))}
      </div>
    </div>
  );
}