"use client";

import { useMonthlyActivity } from "@/hooks/use-activity";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import { Skeleton } from "../ui/skeleton";

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--chart-1)",
  },
  quantity: {
    label: "Quantity",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

const MonthlyActivityChart = ({
  userId,
  months = 12,
}: {
  userId: string;
  months?: number;
}) => {
  const { data: monthlyData, isLoading } = useMonthlyActivity(userId, months);

  if (isLoading) {
    return <Skeleton className="h-[500px] w-full" />;
  }

  if (!monthlyData || monthlyData.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 text-muted-foreground">
        No activity data available
      </div>
    );
  }

  // Format data for chart
  const chartData = monthlyData.map((item) => ({
    name: item.month,
    activities: item.count,
    trend: item.trend,
  }));

  //   / Get bar color based on trend
  const getBarColor = (trend: number) => {
    if (trend > 20) return "#10b981"; // Green-500
    if (trend > 0) return "#34d399"; // Green-400
    if (trend < -20) return "#ef4444"; // Red-500
    if (trend < 0) return "#f87171"; // Red-400
    return "#9ca3af"; // Gray-400
  };
  return (
    <div className="bg-card border rounded-lg p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Monthly Activity</h3>
        <p className="text-sm text-muted-foreground">
          Activity trends over the past {months} months
        </p>
      </div>

      <div className="h-80">
        <ChartContainer config={chartConfig} className="mt-6 w-full h-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              label={{
                value: "Activities",
                angle: -90,
                position: "insideLeft",
                offset: -10,
                style: { textAnchor: "middle" },
              }}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar dataKey="activities" name="Activities" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.trend)} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span>Strong Growth ({"\u003E"}20%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-400" />
          <span>Growth (0-20%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-400" />
          <span>No Change</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <span>Decline (0-20%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span>Strong Decline ({"\u003C"}-20%)</span>
        </div>
      </div>
    </div>
  );
};

export default MonthlyActivityChart;
