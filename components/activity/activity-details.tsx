// app/components/activity/ActivityDetails.tsx
"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Activity,
  User,
  FileText,
  ShoppingCart,
  Users,
  Settings,
  Loader2,
} from "lucide-react";
import { useActivityStats, useRecentActivities } from "@/hooks/use-activity";

// Icons for different entity types
const entityIcons: Record<string, React.ReactNode> = {
  Order: <ShoppingCart className="h-4 w-4" />,
  Product: <FileText className="h-4 w-4" />,
  Customer: <Users className="h-4 w-4" />,
  User: <User className="h-4 w-4" />,
  Settings: <Settings className="h-4 w-4" />,
  default: <Activity className="h-4 w-4" />,
};

export default function ActivityDetails({ userId }: { userId: string }) {
  const [activeTab, setActiveTab] = useState<"recent" | "types" | "hours">(
    "recent"
  );

  const { data: stats, isLoading: isStatsLoading } = useActivityStats(
    userId,
    "30d"
  );
  const { data: recentActivities, isLoading: isRecentLoading } =
    useRecentActivities(userId, 10);

  if (isStatsLoading || isRecentLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Prepare activity by hour data for chart
  const hourData = stats?.activityByHour
    ? Object.entries(stats.activityByHour)
        .map(([hour, count]) => ({
          hour: parseInt(hour),
          label: `${hour}:00`,
          count,
        }))
        .sort((a, b) => a.hour - b.hour)
    : [];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab("recent")}
            className={`pb-3 px-1 border-b-2 transition-colors ${
              activeTab === "recent"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Recent Activities
          </button>
          <button
            onClick={() => setActiveTab("types")}
            className={`pb-3 px-1 border-b-2 transition-colors ${
              activeTab === "types"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            By Type
          </button>
          <button
            onClick={() => setActiveTab("hours")}
            className={`pb-3 px-1 border-b-2 transition-colors ${
              activeTab === "hours"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Time Distribution
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "recent" && (
          <div className="space-y-3">
            {recentActivities?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No recent activities found
              </div>
            ) : (
              recentActivities?.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="mt-1">
                    {entityIcons[activity.entityType || ""] ||
                      entityIcons.default}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-medium">{activity.action}</span>
                      <span className="text-sm text-muted-foreground">
                        {format(activity.createdAt, "HH:mm")}
                      </span>
                    </div>
                    {activity.entityType && (
                      <p className="text-sm text-muted-foreground">
                        {activity.entityType}
                        {activity.entityId && ` • ID: ${activity.entityId}`}
                      </p>
                    )}
                    {activity.details && (
                      <p className="text-sm mt-1 text-muted-foreground line-clamp-2">
                        {JSON.stringify(activity.details)}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "types" && (
          <div className="space-y-4">
            <h4 className="font-medium">Activity Distribution by Type</h4>
            {Object.entries(stats?.activityByType || {}).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No type distribution data available
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(stats?.activityByType || {})
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, count]) => {
                    const total = stats?.totalActivities || 1;
                    const percentage = ((count / total) * 100).toFixed(1);

                    return (
                      <div key={type} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-2">
                            {entityIcons[type] || entityIcons.default}
                            {type}
                          </span>
                          <span className="font-medium">
                            {count} ({percentage}%)
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {activeTab === "hours" && (
          <div className="space-y-4">
            <h4 className="font-medium">Activity by Hour of Day</h4>
            {hourData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hourly data available
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2">
                {hourData.map((hour) => {
                  const maxCount = Math.max(...hourData.map((h) => h.count));
                  const heightPercentage =
                    maxCount > 0 ? (hour.count / maxCount) * 100 : 0;

                  return (
                    <div key={hour.hour} className="space-y-1">
                      <div className="text-center text-xs text-muted-foreground">
                        {hour.hour === 0
                          ? "12AM"
                          : hour.hour < 12
                          ? `${hour.hour}AM`
                          : hour.hour === 12
                          ? "12PM"
                          : `${hour.hour - 12}PM`}
                      </div>
                      <div
                        className={`w-full rounded-t-sm transition-all duration-300 ${
                          hour.count > 0
                            ? "bg-primary hover:bg-primary/80"
                            : "bg-muted"
                        }`}
                        style={{
                          height: `${Math.max(20, heightPercentage)}px`,
                        }}
                        title={`${hour.count} activities at ${hour.label}`}
                      />
                      <div className="text-center text-xs">{hour.count}</div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Peak Activity Time:</p>
                {hourData.length > 0 ? (
                  (() => {
                    const peakHour = hourData.reduce((prev, current) =>
                      prev.count > current.count ? prev : current
                    );
                    return (
                      <p>
                        {peakHour.hour === 0
                          ? "12 AM"
                          : peakHour.hour < 12
                          ? `${peakHour.hour} AM`
                          : peakHour.hour === 12
                          ? "12 PM"
                          : `${peakHour.hour - 12} PM`}{" "}
                        with {peakHour.count} activities
                      </p>
                    );
                  })()
                ) : (
                  <p>No data available</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
