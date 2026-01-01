"use client";

export default function LessonLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="stats-card p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 space-y-3">
                <div className="skeleton-text h-3 w-20" />
                <div className="skeleton-text h-8 w-16" />
                <div className="skeleton-text h-3 w-24" />
              </div>
              <div className="skeleton-circle w-14 h-14" />
            </div>
          </div>
        ))}
      </div>

      {/* Filters Skeleton */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
        <div className="flex gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton h-10 w-40 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Lesson Cards Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map((moduleIndex) => (
          <div key={moduleIndex} className="module-card p-6">
            {/* Module Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="skeleton-circle w-12 h-12" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton-text h-5 w-48" />
                  <div className="skeleton-text h-3 w-32" />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="skeleton h-8 w-24 rounded-lg" />
                <div className="skeleton h-8 w-8 rounded-lg" />
              </div>
            </div>

            {/* Lesson Items */}
            <div className="space-y-3">
              {[1, 2, 3].map((lessonIndex) => (
                <div key={lessonIndex} className="lesson-card p-4">
                  <div className="flex items-start gap-3">
                    <div className="skeleton w-16 h-16 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="skeleton-text h-4 w-64" />
                      <div className="flex gap-3">
                        <div className="skeleton-text h-3 w-16" />
                        <div className="skeleton-text h-3 w-16" />
                        <div className="skeleton-text h-3 w-16" />
                      </div>
                      <div className="flex gap-2">
                        <div className="skeleton h-6 w-20 rounded-full" />
                        <div className="skeleton h-6 w-16 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
