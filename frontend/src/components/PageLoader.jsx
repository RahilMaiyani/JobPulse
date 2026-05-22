import React from "react";
import { Loader2 } from "lucide-react";

export default function PageLoader() {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading experience...</p>
      </div>
    </div>
  );
}
