"use client";

import ProductPerformanceTable from "@/components/analytic/product-performance-table";
import RevenueChart from "@/components/analytic/revenue-chart";
import RevenueSplitChart from "@/components/analytic/revenue-split-chart";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useDashboardStats,
  useProductPerformance,
  useRevenueLoss,
  useRevenueSplit,
  useRevenueTrends,
} from "@/hooks/use-analytic";
import {
  AlertTriangle,
  BarChart3,
  DollarSign,
  Package,
  PieChart,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import React from "react";

type ProductPerformance = {
  id: string;
  name: string;
  sku: string;
  category: string;
  currentRevenue: number;
  previousRevenue: number;
  revenueChange: number;
  changePercentage: number;
  currentStock: number;
  minStockLevel: number;
};

type TimeFrameType = "7d" | "30d" | "lastMonth" | "allMonths";

const AnalyticsPage = () => {
  const [timeFrame, setTimeFrame] = React.useState<TimeFrameType>("30d");
  const { data: stats, isLoading: isLoadingStats } = useDashboardStats();
  const { data: revenueTrends, isLoading: isLoadingRevenueTrends } =
    useRevenueTrends({ timeFrame });
  const { data: revenueLoss, isLoading: isLoadingLoss } = useRevenueLoss();
  const { data: revenueSplit, isLoading: isLoadingSplit } = useRevenueSplit();
  const { data: productPerformance, isLoading: isLoadingPerformance } =
    useProductPerformance();
  return (
    <div>
      <Breadcrumb className="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Analytics</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="space-y-6 py-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive analytics for your boutique sales performance
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    KSH
                    {stats?.totalRevenue.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    All completed orders
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Orders
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {stats?.totalOrders.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Completed orders
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Low Stock Alert
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-amber-600">
                    {stats?.lowStockCount}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Products need restocking
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Revenue Loss
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              {isLoadingLoss ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-red-600">
                    KSH
                    {revenueLoss?.totalLoss.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Estimated from low stock
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Revenue Trends */}
          <Card className="col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Revenue Trends
                  </CardTitle>
                  <CardDescription>
                    Revenue over selected time period
                  </CardDescription>
                </div>
                <Tabs
                  value={timeFrame}
                  onValueChange={(v) => setTimeFrame(v as TimeFrameType)}
                >
                  <TabsList className="grid grid-cols-4 w-64">
                    <TabsTrigger value="7d">7D</TabsTrigger>
                    <TabsTrigger value="30d">30D</TabsTrigger>
                    <TabsTrigger value="lastMonth">Last Month</TabsTrigger>
                    <TabsTrigger value="allMonths">12M</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingRevenueTrends ? (
                <Skeleton className="h-[350px] w-full" />
              ) : (
                <RevenueChart
                  data={revenueTrends as { date: string; revenue: number }[]}
                  timeFrame={timeFrame}
                />
              )}
            </CardContent>
          </Card>

          {/* Revenue Split */}
          <Card className="col-span-1">
            <CardHeader>
              <div className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                <CardTitle>Revenue Split by Category</CardTitle>
              </div>
              <CardDescription>
                Current month revenue distribution
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingSplit ? (
                <Skeleton className="h-[350px] w-full" />
              ) : revenueSplit && revenueSplit.length > 0 ? (
                <RevenueSplitChart data={revenueSplit} />
              ) : (
                <div className="flex flex-col items-center justify-center h-[350px] text-gray-500">
                  <BarChart3 className="h-12 w-12 mb-4" />
                  <p>No revenue data for this month</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Product Performance */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Top 5 Products */}
          <Card>
            <CardHeader className="bg-linear-to-r from-green-50 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-green-700">
                    Top 5 Products
                  </CardTitle>
                  <CardDescription>
                    Products driving revenue growth
                  </CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className="bg-green-100 text-green-800"
                >
                  +Revenue
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingPerformance ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <ProductPerformanceTable
                  products={
                    (productPerformance?.top5 as ProductPerformance[]) || []
                  }
                  type="top"
                />
              )}
            </CardContent>
          </Card>

          {/* Bottom 5 Products */}
          <Card>
            <CardHeader className="bg-linear-to-r from-red-50 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-red-700">
                    Bottom 5 Products
                  </CardTitle>
                  <CardDescription>
                    Products with declining revenue
                  </CardDescription>
                </div>
                <Badge variant="outline" className="bg-red-100 text-red-800">
                  -Revenue
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingPerformance ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <ProductPerformanceTable
                  products={
                    (productPerformance?.bottom5 as ProductPerformance[]) || []
                  }
                  type="bottom"
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Impact */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Low Stock Impact Analysis</CardTitle>
                <CardDescription>
                  Top products contributing to estimated revenue loss
                </CardDescription>
              </div>
              <Badge variant="destructive">High Impact</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingLoss ? (
              <Skeleton className="h-48 w-full" />
            ) : revenueLoss?.productLosses &&
              revenueLoss.productLosses.length > 0 ? (
              <div className="space-y-4">
                {revenueLoss.productLosses.map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{product.productName}</div>
                      <div className="text-sm text-gray-500">
                        Stock: {product.currentStock} / Min:{" "}
                        {product.minStockLevel}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-red-600">
                        -KSH
                        {product.estimatedLoss.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                      <div className="text-sm text-gray-500">
                        Avg daily sales: {product.avgDailySales.toFixed(1)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                <Package className="h-12 w-12 mb-4" />
                <p>No critical low stock issues detected</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage;
