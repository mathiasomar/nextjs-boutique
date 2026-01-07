"use client";

import React from "react";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Activity,
  BarChart3,
  DollarSign,
  Package,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { Product } from "@/generated/prisma/client";

export type ProductDetailsType = Product & {
  lastMonthRevenue: number;
  lastMonthQuantity: number;
  previousMonthRevenue: number;
  previousMonthQuantity: number;
  revenueChange: number;
  quantityChange: number;
  revenueChangePercent: number;
  currentStockStatus: string;
};

export interface ProductPerformanceChartProps {
  data: Array<{
    date: string;
    revenue: number;
    quantity: number;
    orders: number;
    avgPrice: number;
  }>;
  timeFrame: "7d" | "30d" | "lastMonth" | "allMonths";
  productDetails: ProductDetailsType;
}

type ViewType = "revenue" | "quantity" | "combined";

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

const ProductPerformanceChart = ({
  data,
  timeFrame,
  productDetails,
}: ProductPerformanceChartProps) => {
  const [chartView, setChartView] = React.useState<ViewType>("revenue");

  const formatYAxis = (value: number) => {
    if (value >= 1000) {
      return `KSH ${(value / 1000).toFixed(1)}k`;
    }
    return `KSH ${value}`;
  };

  const totalOrders = data.reduce((sum, day) => sum + day.orders, 0);
  const maxOrders = Math.max(totalOrders, 1);
  const averageOrderValue = (
    data.reduce((sum, day) => sum + day.revenue, 0) / maxOrders
  ).toFixed(2);

  const renderChart = () => {
    switch (chartView) {
      case "revenue":
        return (
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
                // tickFormatter={(value) => value.slice(0, 3)}
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
                name="Revenue"
              />
            </LineChart>
          </ChartContainer>
        );

      case "quantity":
        return (
          <ChartContainer config={chartConfig} className="mt-6 w-full h-full">
            <BarChart
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
                // tickFormatter={(value) => value.slice(0, 3)}
                angle={timeFrame === "allMonths" ? -45 : 0}
                height={timeFrame === "allMonths" ? 60 : 40}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={60}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar
                dataKey="quantity"
                fill="var(--color-quantity)"
                radius={[2, 2, 0, 0]}
                name="Quantity Sold"
              />
            </BarChart>
          </ChartContainer>
        );

      case "combined":
        return (
          <ChartContainer config={chartConfig} className="mt-6 w-full h-full">
            <ComposedChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                angle={timeFrame === "allMonths" ? -45 : 0}
                height={timeFrame === "allMonths" ? 60 : 40}
              />
              <YAxis
                yAxisId="left"
                tickFormatter={formatYAxis}
                tick={{ fontSize: 12 }}
                width={60}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12 }}
                width={60}
              />
              <Tooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar
                yAxisId="right"
                dataKey="quantity"
                fill="var(--color-quantity)"
                name="Quantity Sold"
                radius={[2, 2, 0, 0]}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                stroke="var(--color-revenue)"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name="Revenue"
              />
            </ComposedChart>
          </ChartContainer>
        );
    }
  };
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Product Performance Analysis
            </CardTitle>
            <CardDescription>
              {productDetails?.name} - {productDetails?.sku}
            </CardDescription>
          </div>

          <div className="flex flex-wrap gap-2">
            <Tabs
              value={chartView}
              onValueChange={(v) => setChartView(v as ViewType)}
            >
              <TabsList>
                <TabsTrigger
                  value="revenue"
                  className="flex items-center gap-2"
                >
                  <DollarSign className="h-4 w-4" />
                  Revenue
                </TabsTrigger>
                <TabsTrigger
                  value="quantity"
                  className="flex items-center gap-2"
                >
                  <Package className="h-4 w-4" />
                  Quantity
                </TabsTrigger>
                <TabsTrigger
                  value="combined"
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Combined
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Product Metrics Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm font-medium text-gray-500">
                Current Price
              </div>
              <div className="text-2xl font-bold">
                KSH{Number(productDetails?.price || 0).toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-sm font-medium text-gray-500">
                Stock Level
              </div>
              <div className="flex items-center flex-wrap gap-2">
                <div className="text-2xl font-bold">
                  {productDetails?.currentStock || 0}
                </div>
                <Badge
                  variant={
                    productDetails?.currentStockStatus === "LOW"
                      ? "destructive"
                      : productDetails?.currentStockStatus === "WARNING"
                      ? "default"
                      : "outline"
                  }
                  className={
                    productDetails?.currentStockStatus === "LOW"
                      ? "bg-red-100 text-red-800"
                      : productDetails?.currentStockStatus === "WARNING"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }
                >
                  {productDetails?.currentStockStatus || "GOOD"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-sm font-medium text-gray-500">
                Last Month Revenue
              </div>
              <div className="flex items-center flex-wrap gap-2">
                <div className="text-2xl font-bold">
                  KSH{(productDetails?.lastMonthRevenue || 0).toLocaleString()}
                </div>
                {productDetails?.revenueChangePercent !== undefined && (
                  <div
                    className={`flex items-center gap-1 text-sm ${
                      productDetails.revenueChangePercent >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {productDetails.revenueChangePercent >= 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    {Math.abs(productDetails.revenueChangePercent).toFixed(1)}%
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-sm font-medium text-gray-500">
                Last Month Quantity
              </div>
              <div className="flex items-center flex-wrap gap-2">
                <div className="text-2xl font-bold">
                  {productDetails?.lastMonthQuantity || 0}
                </div>
                {productDetails?.quantityChange !== undefined && (
                  <div
                    className={`text-sm ${
                      productDetails.quantityChange >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {productDetails.quantityChange >= 0 ? "+" : ""}
                    {productDetails.quantityChange}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <div className="h-[350px] w-full">{renderChart()}</div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Avg. Order Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                KSH
                {averageOrderValue === "NaN" ? "0.00" : averageOrderValue}
              </div>
              <p className="text-xs text-gray-500">Per order</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Period Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                KSH
                {data
                  .reduce((sum, day) => sum + day.revenue, 0)
                  .toLocaleString()}
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <ShoppingCart className="h-3 w-3" />
                {data.reduce((sum, day) => sum + day.quantity, 0)} units
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Avg. Daily Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                KSH
                {(
                  data.reduce((sum, day) => sum + day.revenue, 0) / data.length
                ).toFixed(2)}
              </div>
              <p className="text-xs text-gray-500">Based on selected period</p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductPerformanceChart;
