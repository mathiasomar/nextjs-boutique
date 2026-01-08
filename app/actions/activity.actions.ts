"use server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  subDays,
  subMonths,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  eachMonthOfInterval,
  format,
  isWithinInterval,
} from "date-fns";
import { headers } from "next/headers";

export type ActivityHeatmapData = {
  date: string;
  count: number;
  level: number; // 0-4 for color intensity
  activities: ActivitySummary[];
};

export type ActivitySummary = {
  id: string;
  action: string;
  entityType: string | null;
  createdAt: Date;
};

export type ActivityStats = {
  totalActivities: number;
  dailyAverage: number;
  mostActiveDay: string;
  mostCommonAction: string;
  activityByType: Record<string, number>;
  activityByHour: Record<number, number>;
};

export type ActivityTimeRange = "7d" | "30d" | "90d" | "6m" | "1y";

// Get user activity heatmap data
export const getUserActivityHeatmap = async (
  userId: string,
  range: ActivityTimeRange = "30d"
): Promise<ActivityHeatmapData[]> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(), // you need to pass the headers object.
    });
    if (!session?.user) throw new Error("Unauthorized");

    const now = new Date();
    let startDate: Date;

    // Set range
    switch (range) {
      case "7d":
        startDate = subDays(now, 7);
        break;
      case "30d":
        startDate = subDays(now, 30);
        break;
      case "90d":
        startDate = subDays(now, 90);
        break;
      case "6m":
        startDate = subMonths(now, 6);
        break;
      case "1y":
        startDate = subMonths(now, 12);
        break;
      default:
        startDate = subDays(now, 30);
    }

    // Fetch activities for the user within date range
    const activities = await prisma.activityLog.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: now,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        action: true,
        entityType: true,
        createdAt: true,
      },
    });

    // Generate date intervals
    const dates = eachDayOfInterval({ start: startDate, end: now });

    // Create heatmap data
    const heatmapData = dates.map((date) => {
      const dateStr = format(date, "yyyy-MM-dd");

      // Filter activities for this specific day
      const dayActivities = activities.filter((activity) => {
        const activityDate = format(activity.createdAt, "yyyy-MM-dd");
        return activityDate === dateStr;
      });

      // Calculate activity level (0-4)
      const count = dayActivities.length;
      let level = 0;

      if (count > 0) level = 1;
      if (count > 3) level = 2;
      if (count > 6) level = 3;
      if (count > 10) level = 4;

      return {
        date: dateStr,
        count,
        level,
        activities: dayActivities.slice(0, 5), // Limit to 5 for preview
      };
    });

    return heatmapData;
  } catch (error) {
    console.error("Failed to fetch activity heatmap:", error);
    throw new Error("Failed to fetch activity data");
  }
};

// Get monthly activity summary
export const getUserMonthlyActivity = async (
  userId: string,
  months: number = 12
): Promise<{ month: string; count: number; trend: number }[]> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(), // you need to pass the headers object.
    });
    if (!session?.user) throw new Error("Unauthorized");

    const now = new Date();
    const startDate = subMonths(now, months);

    // Get monthly intervals
    const monthsArray = eachMonthOfInterval({ start: startDate, end: now });

    const monthlyData = await Promise.all(
      monthsArray.map(async (monthStart) => {
        const monthEnd = endOfMonth(monthStart);
        const monthKey = format(monthStart, "yyyy-MM");

        const count = await prisma.activityLog.count({
          where: {
            userId,
            createdAt: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
        });

        // Calculate trend compared to previous month
        const prevMonthStart = subMonths(monthStart, 1);
        const prevMonthEnd = endOfMonth(prevMonthStart);

        const prevCount = await prisma.activityLog.count({
          where: {
            userId,
            createdAt: {
              gte: prevMonthStart,
              lte: prevMonthEnd,
            },
          },
        });

        const trend =
          prevCount > 0
            ? ((count - prevCount) / prevCount) * 100
            : count > 0
            ? 100
            : 0;

        return {
          month: format(monthStart, "MMM yyyy"),
          count,
          trend: Math.round(trend * 10) / 10,
        };
      })
    );

    return monthlyData.reverse(); // Most recent first
  } catch (error) {
    console.error("Failed to fetch monthly activity:", error);
    throw new Error("Failed to fetch monthly activity data");
  }
};

// Get user activity statistics
export const getUserActivityStats = async (
  userId: string,
  range: ActivityTimeRange = "30d"
): Promise<ActivityStats> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(), // you need to pass the headers object.
    });
    if (!session?.user) throw new Error("Unauthorized");

    const now = new Date();
    let startDate: Date;

    switch (range) {
      case "7d":
        startDate = subDays(now, 7);
        break;
      case "30d":
        startDate = subDays(now, 30);
        break;
      case "90d":
        startDate = subDays(now, 90);
        break;
      case "6m":
        startDate = subMonths(now, 6);
        break;
      case "1y":
        startDate = subMonths(now, 12);
        break;
      default:
        startDate = subDays(now, 30);
    }

    // Fetch aggregated data
    const [activities, actionGroups, typeGroups, hourGroups] =
      await Promise.all([
        // All activities
        prisma.activityLog.findMany({
          where: {
            userId,
            createdAt: { gte: startDate, lte: now },
          },
          orderBy: { createdAt: "asc" },
        }),

        // Group by action
        prisma.activityLog.groupBy({
          by: ["action"],
          where: {
            userId,
            createdAt: { gte: startDate, lte: now },
          },
          _count: true,
          orderBy: { _count: { action: "desc" } },
        }),

        // Group by entity type
        prisma.activityLog.groupBy({
          by: ["entityType"],
          where: {
            userId,
            createdAt: { gte: startDate, lte: now },
          },
          _count: true,
        }),

        // Group by hour of day
        prisma.$queryRaw`
        SELECT 
          EXTRACT(HOUR FROM "createdAt") as hour,
          COUNT(*) as count
        FROM "activity_logs"
        WHERE "userId" = ${userId}
          AND "createdAt" >= ${startDate}
          AND "createdAt" <= ${now}
        GROUP BY EXTRACT(HOUR FROM "createdAt")
        ORDER BY hour
      `,
      ]);

    // Calculate most active day
    const dayGroups: Record<string, number> = {};
    let mostActiveDay = "";
    let maxDayCount = 0;

    activities.forEach((activity) => {
      const day = format(activity.createdAt, "yyyy-MM-dd");
      dayGroups[day] = (dayGroups[day] || 0) + 1;

      if (dayGroups[day] > maxDayCount) {
        maxDayCount = dayGroups[day];
        mostActiveDay = format(activity.createdAt, "MMM dd, yyyy");
      }
    });

    // Format activity by type
    const activityByType: Record<string, number> = {};
    typeGroups.forEach((group) => {
      const type = group.entityType || "Unknown";
      activityByType[type] = group._count;
    });

    // Format activity by hour
    const activityByHour: Record<number, number> = {};
    (hourGroups as unknown[]).forEach((row: any) => {
      activityByHour[parseInt(row.hour)] = parseInt(row.count);
    });

    // Fill missing hours
    for (let hour = 0; hour < 24; hour++) {
      if (!activityByHour[hour]) {
        activityByHour[hour] = 0;
      }
    }

    return {
      totalActivities: activities.length,
      dailyAverage:
        activities.length / Math.max(1, Object.keys(dayGroups).length),
      mostActiveDay,
      mostCommonAction: actionGroups[0]?.action || "No activity",
      activityByType,
      activityByHour,
    };
  } catch (error) {
    console.error("Failed to fetch activity stats:", error);
    throw new Error("Failed to fetch activity statistics");
  }
};

// Get recent activities
export const getUserRecentActivities = async (
  userId: string,
  limit: number = 20
) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(), // you need to pass the headers object.
    });
    if (!session?.user) throw new Error("Unauthorized");

    return await prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch recent activities:", error);
    throw new Error("Failed to fetch recent activities");
  }
};
