"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DailySalesData } from "@/app/types";
import { useDailySales } from "@/hooks/use-order";
import { DataGridSkeleton } from "../loaders/data-grid-skeleton";
import { useState } from "react";
import AppAreaChart from "../app-area-chart";

export function RevenueChart() {
  const [period, setPeriod] = useState("7");
  const { data, isLoading } = useDailySales(Number(period));
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>
              Daily revenue for the last 30 days
            </CardDescription>
          </div>
          <Select defaultValue={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <DataGridSkeleton columns={1} items={1} />
        ) : (
          //   <LineChart
          //     data={data as DailySalesData[]}
          //     xAxisKey="date"
          //     dataKeys={[
          //       { key: "revenue", name: "Revenue", color: "#3b82f6" },
          //       { key: "average", name: "Average Order", color: "#10b981" },
          //     ]}
          //     height={350}
          //     tooltipFormatter={(value) => `$${value.toFixed(2)}`}
          //   />
          <AppAreaChart
            data={data as DailySalesData[]}
            cofigs={{
              revenue: {
                label: "Revenue",
                color: "var(--chart-1)",
              },
              average: {
                label: "Average",
                color: "var(--chart-4)",
              },
            }}
            xAxisKey="date"
            height={350}
            dataKeys={[
              {
                key: "revenue",
                name: "Revenue",
                color: "var(--color-revenue)",
              },
              {
                key: "average",
                name: "Average Order",
                color: "var(--color-average)",
              },
            ]}
          />
        )}
      </CardContent>
    </Card>
  );
}
