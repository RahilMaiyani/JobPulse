const DocumentSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow p-4 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-200 rounded"></div>
          <div className="h-6 w-20 bg-gray-200 rounded"></div>
        </div>
        <div className="w-5 h-5 bg-gray-200 rounded"></div>
      </div>

      {/* Title */}
      <div className="h-4 w-3/4 bg-gray-200 rounded mb-3"></div>

      {/* Info lines */}
      <div className="space-y-2 mb-3">
        <div className="h-3 w-full bg-gray-200 rounded"></div>
        <div className="h-3 w-5/6 bg-gray-200 rounded"></div>
        <div className="h-3 w-4/5 bg-gray-200 rounded"></div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <div className="flex-1 h-8 bg-gray-200 rounded"></div>
        <div className="flex-1 h-8 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
};

export default DocumentSkeleton;
