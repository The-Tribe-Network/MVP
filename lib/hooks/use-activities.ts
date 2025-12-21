"use client";

import { useQuery } from "@tanstack/react-query";
import { tribeActivitiesOptions, userActivitiesOptions } from "@/lib/query-options/activities";

/**
 * Fetch activities for a tribe
 */
export function useTribeActivities(tribeId: string, options?: { limit?: number; offset?: number }) {
  return useQuery(tribeActivitiesOptions(tribeId, options));
}

/**
 * Fetch activities from all tribes the user is a member of
 */
export function useUserActivities(options?: { limit?: number; offset?: number }) {
  return useQuery(userActivitiesOptions(options));
}

