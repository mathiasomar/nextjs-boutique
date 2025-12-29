"use client";

import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";

import { Checkbox } from "@/components/ui/checkbox";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import Link from "next/link";
import { Order } from "@/generated/prisma/client";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export const columns: ColumnDef<Order>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "orderNumber",
    header: "Order Number",
  },
  {
    accessorKey: "customer.email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Product Name" />
    ),
  },
  {
    accessorKey: "status",
    header: "Order Status",
    cell: ({ row }) => {
      const order = row.original;
      return (
        <span
          className={cn(
            "py-1 px-2 rounded-full text-white",
            order.status === "DRAFT"
              ? "bg-green-300"
              : order.status === "PENDING"
              ? "bg-gray-500"
              : order.status === "PROCESSING" || order.status === "SHIPPED"
              ? "bg-orange-400"
              : order.status === "DELIVERED" || order.status === "CONFIRMED"
              ? "bg-green-500"
              : "bg-red-500"
          )}
        >
          {order.status}
        </span>
      );
    },
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment Status",
    cell: ({ row }) => {
      const order = row.original;
      return (
        <span
          className={cn(
            "py-1 px-2 rounded-full text-white",
            order.paymentStatus === "PENDING"
              ? "bg-gray-500"
              : order.paymentStatus === "PARTIAL"
              ? "bg-orange-400"
              : order.paymentStatus === "COMPLETED"
              ? "bg-green-500"
              : "bg-red-500"
          )}
        >
          {order.paymentStatus}
        </span>
      );
    },
  },
  {
    accessorKey: "total",
    header: "Total Amount",
    cell: ({ row }) => {
      const order = row.original;
      return <>Ksh.{order.total.toFixed(2)}</>;
    },
  },
  {
    accessorKey: "orderDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Order Date" />
    ),
    cell: ({ row }) => {
      const order = row.original;
      return <>Ksh.{format(order.orderDate, "dd/MM/yyyy HH:mm")}</>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const order = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(order.id.toString())}
            >
              Copy order ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href={`/dashboard/orders/${order.id}`}>View Order</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
