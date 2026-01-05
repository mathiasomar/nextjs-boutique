"use client";

import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface AreaChartProps {
  data: unknown[];
  xAxisKey: string;
  dataKeys: {
    key: string;
    name: string;
    color: string;
  }[];
  height?: number;
  showGrid?: boolean;
  gradient?: boolean;
}

export function AreaChart({
  data,
  xAxisKey,
  dataKeys,
  height = 300,
  showGrid = true,
  gradient = true,
}: AreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
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
        {dataKeys.map((dataKey) => (
          <Area
            key={dataKey.key}
            type="monotone"
            dataKey={dataKey.key}
            name={dataKey.name}
            stroke={dataKey.color}
            fill={gradient ? `url(#color${dataKey.key})` : `${dataKey.color}20`}
            strokeWidth={2}
          />
        ))}
        {gradient && (
          <defs>
            {dataKeys.map((dataKey) => (
              <linearGradient
                key={dataKey.key}
                id={`color${dataKey.key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={dataKey.color} stopOpacity={0.8} />
                <stop offset="95%" stopColor={dataKey.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
        )}
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
}
