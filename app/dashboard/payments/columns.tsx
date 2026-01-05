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
import { Payment } from "@/generated/prisma/client";

export const columns: ColumnDef<Payment>[] = [
  // {
  //   id: "select",
  //   header: ({ table }) => (
  //     <Checkbox
  //       checked={
  //         table.getIsAllPageRowsSelected() ||
  //         (table.getIsSomePageRowsSelected() && "indeterminate")
  //       }
  //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //       aria-label="Select all"
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       aria-label="Select row"
  //     />
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  {
    accessorKey: "transactionId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Transaction ID" />
    ),
  },
  {
    accessorKey: "order.orderNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Order Number" />
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status");

      return (
        <span
          className={cn(
            "p-1 rounded-md w-max text-xs",
            status === "PENDING"
              ? "bg-yellow-500/40"
              : status === "COMPLETED"
              ? "bg-green-500/70"
              : "bg-red-500/40"
          )}
        >
          {String(status)
            .toLowerCase()
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")}
        </span>
      );
    },
  },
  {
    accessorKey: "method",
    header: "Payment Method",
    cell: ({ row }) => {
      const method = row.getValue("method");

      return (
        <span
          className={cn(
            "p-1 rounded-md w-max text-xs",
            method === "CASH" ? "bg-yellow-500/40" : "bg-green-500/70"
          )}
        >
          {String(method)
            .toLowerCase()
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")}
        </span>
      );
    },
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "Ksh",
      }).format(amount);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "processedAt",
    header: () => <div className="text-right">Processed At</div>,
    cell: ({ row }) => {
      const processedAt = new Date(row.getValue("processedAt"));
      const formatted = new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(processedAt);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const payment = row.original;

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
              onClick={() => navigator.clipboard.writeText(payment.id)}
            >
              Copy payment ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href={`/users/${payment.id}`}>View customer</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>View payment details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
