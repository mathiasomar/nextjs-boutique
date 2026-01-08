// app/components/activity/ActivityHeatmap.tsx
"use client";

import { useState } from "react";
import { format, parseISO, isToday, isSameDay } from "date-fns";
import { Calendar, TrendingUp, BarChart3, Clock, Loader2 } from "lucide-react";
import { useActivityHeatmap, useActivityStats } from "@/hooks/use-activity";

type ActivityTimeRange = "7d" | "30d" | "90d" | "6m" | "1y";

const colorLevels = [
  "bg-gray-100 dark:bg-gray-800", // Level 0
  "bg-green-100 dark:bg-green-900/30", // Level 1
  "bg-green-300 dark:bg-green-700/50", // Level 2
  "bg-green-400 dark:bg-green-600", // Level 3
  "bg-green-500 dark:bg-green-500", // Level 4
];

export default function ActivityHeatmap({
  userId,
  initialRange = "30d",
}: {
  userId: string;
  initialRange?: ActivityTimeRange;
}) {
  const [selectedRange, setSelectedRange] =
    useState<ActivityTimeRange>(initialRange);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { data: heatmapData, isLoading: isHeatmapLoading } = useActivityHeatmap(
    userId,
    selectedRange
  );
  const { data: stats, isLoading: isStatsLoading } = useActivityStats(
    userId,
    selectedRange
  );

  const ranges: { label: string; value: ActivityTimeRange }[] = [
    { label: "Last 7 days", value: "7d" },
    { label: "Last 30 days", value: "30d" },
    { label: "Last 90 days", value: "90d" },
    { label: "Last 6 months", value: "6m" },
    { label: "Last year", value: "1y" },
  ];

  const selectedDayData = selectedDate
    ? heatmapData?.find((d) => d.date === selectedDate)
    : null;

  const getTooltipContent = (date: string, count: number) => {
    const formattedDate = format(parseISO(date), "MMM dd, yyyy");
    const activityText = count === 1 ? "activity" : "activities";
    return `${count} ${activityText} on ${formattedDate}`;
  };

  if (isHeatmapLoading || isStatsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Activity Overview</h3>
          <p className="text-sm text-muted-foreground">
            Track your contributions and activity patterns
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex gap-2">
          {ranges.map((range) => (
            <button
              key={range.value}
              onClick={() => setSelectedRange(range.value)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                selectedRange === range.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Total Activities
            </span>
          </div>
          <p className="text-2xl font-bold">{stats?.totalActivities || 0}</p>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Daily Average</span>
          </div>
          <p className="text-2xl font-bold">
            {stats?.dailyAverage?.toFixed(1) || "0.0"}
          </p>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Most Active Day
            </span>
          </div>
          <p className="text-lg font-semibold truncate">
            {stats?.mostActiveDay || "No data"}
          </p>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Most Common Action
            </span>
          </div>
          <p className="text-lg font-semibold truncate">
            {stats?.mostCommonAction || "None"}
          </p>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="bg-card border rounded-lg p-6">
        <div className="mb-4">
          <h4 className="font-medium">Activity Heatmap</h4>
          <p className="text-sm text-muted-foreground">
            Each square represents a day. Darker colors indicate more activity.
          </p>
        </div>

        <div className="overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {heatmapData?.map((day) => {
              const isCurrentDay = isToday(parseISO(day.date));
              const isSelected = selectedDate === day.date;

              return (
                <button
                  key={day.date}
                  onClick={() =>
                    setSelectedDate(day.date === selectedDate ? null : day.date)
                  }
                  className={`relative w-8 h-8 rounded-sm border transition-all duration-200 hover:scale-110 hover:z-10 ${
                    isCurrentDay ? "border-primary" : "border-transparent"
                  } ${isSelected ? "ring-2 ring-primary ring-offset-2" : ""} ${
                    colorLevels[day.level]
                  }`}
                  title={getTooltipContent(day.date, day.count)}
                  aria-label={getTooltipContent(day.date, day.count)}
                >
                  {/* Show count on hover for mobile */}
                  <span className="sr-only">
                    {getTooltipContent(day.date, day.count)}
                  </span>

                  {day.count > 0 && (
                    <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {day.count}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-2 mt-4 text-sm text-muted-foreground">
          <span>Less</span>
          {colorLevels.map((color, index) => (
            <div
              key={index}
              className={`w-6 h-6 rounded-sm ${color}`}
              title={`Level ${index}`}
            />
          ))}
          <span>More</span>
        </div>

        {/* Selected Day Details */}
        {selectedDayData && selectedDayData.count > 0 && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <h5 className="font-medium">
                Activities on {format(parseISO(selectedDate!), "MMMM dd, yyyy")}
              </h5>
              <span className="px-2 py-1 bg-primary/10 text-primary text-sm rounded-full">
                {selectedDayData.count} activities
              </span>
            </div>

            <div className="space-y-2">
              {selectedDayData.activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 bg-background rounded"
                >
                  <div>
                    <span className="font-medium">{activity.action}</span>
                    {activity.entityType && (
                      <span className="text-sm text-muted-foreground ml-2">
                        on {activity.entityType}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {format(activity.createdAt, "HH:mm")}
                  </span>
                </div>
              ))}

              {selectedDayData.count > 5 && (
                <div className="text-center text-sm text-muted-foreground pt-2">
                  +{selectedDayData.count - 5} more activities
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
