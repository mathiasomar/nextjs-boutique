import { ArrowDownRight, ArrowUpRight, Package } from "lucide-react";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";

interface Product {
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
}

interface ProductPerformanceTableProps {
  products: Product[];
  type: "top" | "bottom";
}

const ProductPerformanceTable = ({
  products,
  type,
}: ProductPerformanceTableProps) => {
  const isPositive = type === "top";

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <Package className="h-12 w-12 mb-4" />
        <p>No data available</p>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Revenue</TableHead>
            <TableHead>Change</TableHead>
            <TableHead>Stock</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product, index) => (
            <TableRow
              key={product.id}
              className={cn(
                "border-b hover:bg-gray-50",
                index === 0 ? "bg-green-50" : ""
              )}
            >
              <TableCell
                className={cn(
                  "font-medium",
                  index === 0 ? "text-gray-700" : ""
                )}
              >
                {product.name}
              </TableCell>
              <TableCell className="text-gray-500">{product.sku}</TableCell>
              <TableCell>
                <Badge variant="outline">{product.category}</Badge>
              </TableCell>
              <TableCell className="font-medium">
                KSH {product.currentRevenue.toLocaleString()}
              </TableCell>
              <TableCell>
                <div
                  className={cn(
                    "flex items-center gap-1",
                    product.revenueChange >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  )}
                >
                  {product.revenueChange >= 0 ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                  <span>
                    KSH {Math.abs(product.revenueChange).toLocaleString()}
                  </span>
                  <span className="text-xs">
                    ({product.changePercentage >= 0 ? "+" : ""}
                    {product.changePercentage.toFixed(1)}%)
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div
                  className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium inline-block",
                    product.currentStock <= product.minStockLevel
                      ? "bg-red-100 text-red-800"
                      : product.currentStock <= product.minStockLevel * 2
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  )}
                >
                  {product.currentStock}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductPerformanceTable;
