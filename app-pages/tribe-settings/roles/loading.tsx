import { Skeleton } from "@/components/ui/skeleton";

export function RolesSettingsSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-9 w-64 mb-2" />
        <Skeleton className="h-5 w-full max-w-2xl" />
      </div>

      <div className="rounded-lg border bg-card p-6">
        <div className="mb-4">
          <Skeleton className="h-7 w-48 mb-2" />
          <Skeleton className="h-4 w-full max-w-xl" />
        </div>

        <div className="space-y-2">
          {/* Table header */}
          <div className="flex gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>

          {/* Table rows */}
          {[...Array(12)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-12 flex-1" />
              <Skeleton className="h-12 w-24" />
              <Skeleton className="h-12 w-24" />
              <Skeleton className="h-12 w-24" />
              <Skeleton className="h-12 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
