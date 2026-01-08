// app/hooks/useActivity.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getUserActivityHeatmap,
  getUserMonthlyActivity,
  getUserActivityStats,
  getUserRecentActivities,
  type ActivityTimeRange,
} from "@/app/actions/activity.actions";

// React Query keys
export const activityKeys = {
  all: ["activity"] as const,
  user: (userId: string) => [...activityKeys.all, "user", userId] as const,
  heatmap: (userId: string, range: ActivityTimeRange) =>
    [...activityKeys.user(userId), "heatmap", range] as const,
  monthly: (userId: string, months: number) =>
    [...activityKeys.user(userId), "monthly", months] as const,
  stats: (userId: string, range: ActivityTimeRange) =>
    [...activityKeys.user(userId), "stats", range] as const,
  recent: (userId: string, limit: number) =>
    [...activityKeys.user(userId), "recent", limit] as const,
};

// Heatmap hook
export function useActivityHeatmap(
  userId: string,
  range: ActivityTimeRange = "30d"
) {
  return useQuery({
    queryKey: activityKeys.heatmap(userId, range),
    queryFn: () => getUserActivityHeatmap(userId, range),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!userId,
  });
}

// Monthly activity hook
export function useMonthlyActivity(userId: string, months: number = 12) {
  return useQuery({
    queryKey: activityKeys.monthly(userId, months),
    queryFn: () => getUserMonthlyActivity(userId, months),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!userId,
  });
}

// Stats hook
export function useActivityStats(
  userId: string,
  range: ActivityTimeRange = "30d"
) {
  return useQuery({
    queryKey: activityKeys.stats(userId, range),
    queryFn: () => getUserActivityStats(userId, range),
    staleTime: 5 * 60 * 1000,
    enabled: !!userId,
  });
}

// Recent activities hook
export function useRecentActivities(userId: string, limit: number = 20) {
  return useQuery({
    queryKey: activityKeys.recent(userId, limit),
    queryFn: () => getUserRecentActivities(userId, limit),
    staleTime: 1 * 60 * 1000, // 1 minute
    enabled: !!userId,
  });
}
