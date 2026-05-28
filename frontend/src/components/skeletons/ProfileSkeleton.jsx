import React from 'react';

export default function ProfileSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-8">
        <div className="w-48 h-8 bg-zinc-200 dark:bg-zinc-800 rounded mb-2"></div>
        <div className="w-96 h-4 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column Skeleton (Personal Details) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
              <div className="w-5 h-5 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
              <div className="w-32 h-6 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="space-y-2">
                    <div className="w-24 h-3 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                    <div className="w-full h-10 bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="w-20 h-3 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                  <div className="w-10 h-3 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                </div>
                <div className="w-full h-24 bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-3 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                <div className="flex gap-2">
                  <div className="flex-1 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>
                  <div className="w-20 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>
                </div>
                <div className="flex gap-2 mt-3">
                  <div className="w-16 h-6 bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>
                  <div className="w-20 h-6 bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <div className="w-32 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column Skeleton (Security & Resume Vault) */}
        <div className="space-y-6">
          {/* Security Skeleton */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
              <div className="w-5 h-5 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
              <div className="w-24 h-6 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
            </div>
            <div className="p-6 space-y-4">
              {[1, 2, 3].map(n => (
                <div key={n} className="space-y-2">
                  <div className="w-24 h-3 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                  <div className="w-full h-10 bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>
                </div>
              ))}
              <div className="pt-2">
                <div className="w-full h-10 bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>
              </div>
            </div>
          </div>

          {/* Resume Vault Skeleton */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
                <div className="w-32 h-6 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
              </div>
              <div className="w-24 h-8 bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>
            </div>
            <div className="p-6 space-y-3">
              {[1, 2].map(n => (
                <div key={n} className="flex items-center p-3 border border-zinc-100 dark:border-zinc-800 rounded-xl">
                  <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-lg shrink-0 mr-3"></div>
                  <div className="flex-1 space-y-1.5">
                    <div className="w-2/3 h-4 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                    <div className="w-1/3 h-3 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
