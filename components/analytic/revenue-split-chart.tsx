"use client";

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";

const chartConfig = {
  category: {
    label: "Category",
    color: "var(--chart-1)",
  },
  revenue: {
    label: "Revenue",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

// const chartData = [
//   { month: "January", total: 186, successful: 80 },
//   { month: "February", total: 305, successful: 200 },
//   { month: "March", total: 237, successful: 120 },
//   { month: "April", total: 173, successful: 100 },
//   { month: "May", total: 209, successful: 130 },
//   { month: "June", total: 214, successful: 140 },
// ];

interface RevenueSplitChartProps {
  data: Array<{
    category: string;
    revenue: number;
  }>;
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
];

const RevenueSplitChart = ({ data }: RevenueSplitChartProps) => {
  const chartData = data.map((item) => ({
    ...item,
    formattedRevenue: `Ksh ${item.revenue.toLocaleString()}`,
  }));
  return (
    <div className="h-[350px] w-full">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <BarChart
          accessibilityLayer
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            type="number"
            // tickLine={false}
            // tickMargin={10}
            // axisLine={false}
            tickFormatter={(value) => `Ksh ${(value / 1000).toFixed(0)}k`}
          />
          <YAxis
            type="category"
            dataKey="category"
            width={100}
            tickLine={false}
            tickMargin={5}
            axisLine={false}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="revenue" radius={[0, 4, 4, 0]} barSize={20}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
};

export default RevenueSplitChart;
