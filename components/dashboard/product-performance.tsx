"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProductPerformance } from "@/hooks/use-order";
import { ProductPerformance } from "@/app/types";
import { DataGridSkeleton } from "../loaders/data-grid-skeleton";
import AppBarChart from "../app-bar-chart";
import { ChartConfig } from "../ui/chart";

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--chart-1)",
  },
  units: {
    label: "Units",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

export function ProductPerformanceChart() {
  const { data, isLoading } = useProductPerformance();
  const chartData = data?.map((item) => ({
    name: item.name.substring(0, 20) + (item.name.length > 20 ? "..." : ""),
    revenue: item.revenue,
    units: item.unitsSold,
    growth: item.growth,
  }));

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Product Performance</CardTitle>
        <CardDescription>Top performing products this month</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <DataGridSkeleton columns={2} items={1} />
        ) : (
          <>
            {/* <BarChart
              data={chartData as ProductPerformance[]}
              xAxisKey="name"
              dataKeys={[
                { key: "revenue", name: "Revenue", color: "#8b5cf6" },
                { key: "units", name: "Units Sold", color: "#f59e0b" },
              ]}
              height={350}
              layout="vertical"
              barSize={20}
            /> */}
            <AppBarChart
              cofigs={chartConfig}
              data={chartData as ProductPerformance[]}
              xAxisKey="name"
              dataKeys={[
                { key: "revenue", name: "Revenue", color: "var(--chart-1)" },
                { key: "units", name: "Units Sold", color: "var(--chart-2)" },
              ]}
            />
            <div className="mt-6 space-y-4">
              {data?.slice(0, 5).map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {product.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {typeof product.category === "object"
                        ? product.category.name
                        : product.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="font-normal">
                      Ksh{product.revenue.toFixed(2)}
                    </Badge>
                    <Badge
                      variant={product.growth >= 0 ? "default" : "destructive"}
                      className="font-normal"
                    >
                      {product.growth >= 0 ? "+" : ""}
                      {product.growth}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
