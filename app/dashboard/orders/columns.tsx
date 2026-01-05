"use client";

import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";

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
import { format } from "date-fns";
import PaymentForm from "@/components/payment-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Order } from "@/generated/prisma/client";

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
      <DataTableColumnHeader column={column} title="Customer Email" />
    ),
  },
  {
    accessorKey: "createdByUser.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created By" />
    ),
  },
  {
    accessorKey: "_count.items",
    header: "Items",
  },
  {
    accessorKey: "status",
    header: "Order Status",
    cell: ({ row }) => {
      const order = row.original;
      return (
        <span
          className={cn(
            "p-1 rounded-md w-max text-xs",
            order.status === "DRAFT"
              ? "bg-green-500/40"
              : order.status === "PENDING"
              ? "bg-yellow-500/40"
              : order.status === "PROCESSING" || order.status === "SHIPPED"
              ? "bg-orange-500/70"
              : order.status === "DELIVERED" || order.status === "CONFIRMED"
              ? "bg-green-500/70"
              : "bg-red-500/40"
          )}
        >
          {order.status
            .toLowerCase()
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")}
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
            "p-1 rounded-md w-max text-xs",
            order.paymentStatus === "PENDING"
              ? "bg-yellow-500/40"
              : order.paymentStatus === "PARTIAL"
              ? "bg-orange-500/70"
              : order.paymentStatus === "COMPLETED"
              ? "bg-green-500/70"
              : "bg-red-500/40"
          )}
        >
          {order.paymentStatus
            .toLowerCase()
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")}
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
    accessorKey: "paid",
    header: "Paid Amount",
    cell: ({ row }) => {
      const order = row.original;
      return <>Ksh.{order.paid.toFixed(2)}</>;
    },
  },
  {
    accessorKey: "balance",
    header: "Balance",
    cell: ({ row }) => {
      const order = row.original;
      return <>Ksh.{order.balance.toFixed(2)}</>;
    },
  },
  {
    accessorKey: "orderDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Order Date" />
    ),
    cell: ({ row }) => {
      const order = row.original;
      return <>{format(order.orderDate, "dd/MM/yyyy HH:mm")}</>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const order = row.original;

      return (
        <div className="flex items-center gap-2">
          <PaymentForm orderId={order.id} />
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
                onClick={() =>
                  navigator.clipboard.writeText(order.id.toString())
                }
              >
                Copy order ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href={`/dashboard/orders/${order.id}`}>View Order</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
