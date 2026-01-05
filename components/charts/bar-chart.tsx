"use client";

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface BarChartProps {
  data: unknown[];
  xAxisKey: string;
  dataKeys: {
    key: string;
    name: string;
    color: string;
  }[];
  height?: number;
  showGrid?: boolean;
  stacked?: boolean;
  layout?: "horizontal" | "vertical";
  barSize?: number;
}

export function BarChart({
  data,
  xAxisKey,
  dataKeys,
  height = 300,
  showGrid = true,
  stacked = false,
  layout = "vertical",
  barSize = 30,
}: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={data}
        layout={layout}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
        <XAxis
          type={layout === "vertical" ? "category" : "number"}
          dataKey={layout === "vertical" ? xAxisKey : undefined}
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          type={layout === "vertical" ? "number" : "category"}
          dataKey={layout === "vertical" ? undefined : xAxisKey}
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "6px",
          }}
          formatter={(value) => [`$${Number(value).toFixed(2)}`, "Amount"]}
        />
        <Legend />
        {dataKeys.map((dataKey) => (
          <Bar
            key={dataKey.key}
            dataKey={dataKey.key}
            name={dataKey.name}
            fill={dataKey.color}
            stackId={stacked ? "stack" : undefined}
            radius={[4, 4, 0, 0]}
            barSize={barSize}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
