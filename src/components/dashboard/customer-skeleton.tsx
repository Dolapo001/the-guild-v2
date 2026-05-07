import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard } from "@/components/ui/glass-card";

export function CustomerSkeleton() {
  return (
    <div className="space-y-12">
      {/* Header Skeleton */}
      <div className="space-y-2 px-1">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-48" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-12">
          {/* Active Booking Skeleton */}
          <section className="space-y-4">
            <Skeleton className="h-4 w-32 ml-1" />
            <GlassCard className="p-5 sm:p-8 border-primary/20 space-y-8">
              <div className="flex justify-between">
                <div className="space-y-4 flex-1">
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-20 w-20 rounded-2xl" />
              </div>
              <div className="flex gap-3">
                <Skeleton className="h-11 w-40 rounded-xl" />
                <Skeleton className="h-11 w-40 rounded-xl" />
              </div>
            </GlassCard>
          </section>

          {/* Recommendations Skeleton */}
          <section className="space-y-6">
            <div className="flex justify-between items-center px-1">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-8 w-40 rounded-lg" />
            </div>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-64 rounded-2xl bg-white/40 border border-glass-border p-4 space-y-4">
                  <Skeleton className="h-32 w-full rounded-xl" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar Widgets Skeleton */}
        <div className="space-y-8">
          <GlassCard className="p-6 border-white/40 space-y-6">
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-12" />
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
