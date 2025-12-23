import { queryOptions } from "@tanstack/react-query";
import { queryKeys } from "@/lib/constants/query-keys";

// Waitlist queries don't need any fetch functions since we only mutate
// This file is here for consistency with the pattern
export function waitlistOptions() {
  return queryOptions({
    queryKey: queryKeys.waitlist.all,
    queryFn: () => Promise.resolve([]),
    enabled: false, // Never actually fetch
  });
}
