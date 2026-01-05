"use client";

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface LineChartProps {
  data: unknown[];
  xAxisKey: string;
  dataKeys: {
    key: string;
    name: string;
    color: string;
  }[];
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  tooltipFormatter?: (value: number) => string;
}

export function LineChart({
  data,
  xAxisKey,
  dataKeys,
  height = 300,
  showGrid = true,
  showLegend = true,
  tooltipFormatter = (value) => value.toString(),
}: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
        <XAxis
          dataKey={xAxisKey}
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={tooltipFormatter}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "6px",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          }}
          formatter={(value) => [tooltipFormatter(Number(value)), "Value"]}
        />
        {showLegend && (
          <Legend verticalAlign="bottom" height={36} iconType="circle" />
        )}
        {dataKeys.map((dataKey) => (
          <Line
            key={dataKey.key}
            type="monotone"
            dataKey={dataKey.key}
            name={dataKey.name}
            stroke={dataKey.color}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6, strokeWidth: 2 }}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
