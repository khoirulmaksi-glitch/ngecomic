export default function ChapterLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 animate-pulse">
      {/* Header skeleton */}
      <div className="mb-6">
        <div className="h-4 w-40 bg-muted/30 rounded mb-2" />
        <div className="h-6 w-64 bg-muted/30 rounded" />
      </div>

      {/* Nav skeleton */}
      <div className="flex items-center justify-between py-3 mb-4">
        <div className="h-10 w-24 bg-muted/30 rounded-lg" />
        <div className="h-10 w-16 bg-muted/30 rounded-lg" />
        <div className="h-10 w-24 bg-muted/30 rounded-lg" />
      </div>

      {/* Image skeletons */}
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="w-full aspect-[3/4] bg-muted/20 rounded" />
        ))}
      </div>
    </div>
  )
}
