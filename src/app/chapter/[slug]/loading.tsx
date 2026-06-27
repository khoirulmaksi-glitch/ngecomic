export default function ChapterLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Loading bar */}
      <div className="fixed top-0 left-0 right-0 z-[100] h-0.5 bg-brand overflow-hidden">
        <div className="h-full w-1/3 bg-brand/40 rounded-full animate-loading-bar" />
      </div>

      <div className="animate-pulse">
        {/* Header skeleton */}
        <div className="mb-6">
          <div className="h-4 w-48 bg-muted/30 rounded mb-2" />
          <div className="h-7 w-72 bg-muted/30 rounded" />
        </div>

        {/* Nav skeleton */}
        <div className="flex items-center justify-between py-3 mb-6 border-b border-outline">
          <div className="h-10 w-20 bg-muted/20 rounded-lg" />
          <div className="h-10 w-14 bg-muted/20 rounded-lg" />
          <div className="h-10 w-20 bg-muted/20 rounded-lg" />
        </div>

        {/* Image skeletons */}
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-full aspect-[3/4] bg-muted/10 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}
