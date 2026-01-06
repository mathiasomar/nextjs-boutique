"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";

// import { Card, CardContent } from "@/components/ui/card";

// const chartData = [
//   { month: "January", desktop: 186, mobile: 80 },
//   { month: "February", desktop: 305, mobile: 200 },
//   { month: "March", desktop: 237, mobile: 120 },
//   { month: "April", desktop: 73, mobile: 190 },
//   { month: "May", desktop: 209, mobile: 130 },
//   { month: "June", desktop: 214, mobile: 140 },
// ];
const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

interface RevenueChartProps {
  data: Array<{
    date: string;
    revenue: number;
  }>;
  timeFrame: "7d" | "30d" | "lastMonth" | "allMonths";
}

const RevenueChart = ({ data, timeFrame }: RevenueChartProps) => {
  const formatYAxis = (value: number) => {
    if (value >= 1000) {
      return `Ksh ${(value / 1000).toFixed(1)}k`;
    }
    return `Ksh ${value}`;
  };
  return (
    <div className="h-[350px] w-full">
      <ChartContainer config={chartConfig} className="mt-6 w-full h-full">
        <LineChart
          accessibilityLayer
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => value.slice(0, 3)}
            angle={timeFrame === "allMonths" ? -45 : 0}
            height={timeFrame === "allMonths" ? 60 : 40}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={formatYAxis}
            width={60}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Line
            dataKey="revenue"
            type="monotone"
            stroke="var(--color-revenue)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
};

export default RevenueChart;
