// app/components/activity/ActivityDashboard.tsx
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, BarChart3, List, Download } from "lucide-react";
import ActivityHeatmap from "./activity-heat-map";
import MonthlyActivityChart from "./montly-activity-chart";
import ActivityDetails from "./activity-details";

export default function ActivityDashboard({ userId }: { userId: string }) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    // Implement export functionality
    setTimeout(() => {
      setExporting(false);
      // Trigger download
      const blob = new Blob(["Activity export functionality"], {
        type: "text/csv",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `activity-export-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      a.click();
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Activity Dashboard
          </h2>
          <p className="text-muted-foreground">
            Monitor and analyze user activity patterns
          </p>
        </div>

        <button
          onClick={handleExport}
          disabled={exporting}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {exporting ? (
            "Exporting..."
          ) : (
            <>
              <Download className="h-4 w-4" />
              Export Data
            </>
          )}
        </button>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="details" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ActivityHeatmap userId={userId} />
          <MonthlyActivityChart userId={userId} />
        </TabsContent>

        <TabsContent value="analytics">
          <div className="bg-card border rounded-lg p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold">Advanced Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Detailed analysis of user activity patterns and trends
              </p>
            </div>
            <MonthlyActivityChart userId={userId} months={24} />
          </div>
        </TabsContent>

        <TabsContent value="details">
          <div className="bg-card border rounded-lg p-6">
            <ActivityDetails userId={userId} />
          </div>
        </TabsContent>
      </Tabs>

      {/* Insights Section */}
      <div className="bg-muted/50 border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Activity Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium">Productivity Patterns</h4>
            <p className="text-sm text-muted-foreground">
              Your most productive hours are typically in the morning. Consider
              scheduling important tasks during this time.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Weekly Trends</h4>
            <p className="text-sm text-muted-foreground">
              Activity peaks mid-week. Monday mornings show lower activity,
              suggesting a gradual start to the week.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
