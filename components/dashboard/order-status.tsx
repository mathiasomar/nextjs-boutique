import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PieChart } from "@/components/charts/pie-chart";
import { OrderStatusSummary } from "@/app/types";

interface OrderStatusProps {
  data: OrderStatusSummary[];
}

export function OrderStatusChart({ data }: OrderStatusProps) {
  const chartData = data.map((item) => ({
    name: item.status,
    value: item.count,
    percentage: item.percentage,
  }));

  const colors = [
    "#3b82f6", // PENDING - blue
    "#f59e0b", // PROCESSING - amber
    "#8b5cf6", // SHIPPED - purple
    "#10b981", // DELIVERED - green
    "#ef4444", // CANCELLED - red
    "#6b7280", // RETURNED - gray
  ];

  //   const getStatusColor = (status: string) => {
  //     const colorMap: Record<string, string> = {
  //       PENDING: "bg-blue-100 text-blue-800",
  //       PROCESSING: "bg-amber-100 text-amber-800",
  //       SHIPPED: "bg-purple-100 text-purple-800",
  //       DELIVERED: "bg-green-100 text-green-800",
  //       CANCELLED: "bg-red-100 text-red-800",
  //       REFUNDED: "bg-gray-100 text-gray-800",
  //     };
  //     return colorMap[status] || "bg-gray-100 text-gray-800";
  //   };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Status</CardTitle>
        <CardDescription>Distribution of orders by status</CardDescription>
      </CardHeader>
      <CardContent>
        <PieChart
          data={chartData}
          dataKey="value"
          nameKey="name"
          colors={colors}
          height={250}
        />
        <div className="mt-6 space-y-3">
          {data.map((item) => (
            <div
              key={item.status}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{
                    backgroundColor:
                      colors[
                        data.findIndex((d) => d.status === item.status) %
                          colors.length
                      ],
                  }}
                />
                <span className="text-sm font-medium capitalize">
                  {item.status.toLowerCase()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{item.count}</Badge>
                <span className="text-sm text-muted-foreground">
                  {item.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
