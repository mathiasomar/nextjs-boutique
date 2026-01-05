"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const OrderFilters = () => {
  const [orderStatus, setOrderStatus] = React.useState<string>("");
  const [paymentStatus, setPaymentStatus] = React.useState<string>("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const handleStatusFilter = (filter: string) => {
    if (filter === "all") {
      const params = new URLSearchParams(searchParams);
      params.delete("status");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
      return;
    }
    const params = new URLSearchParams(searchParams);
    params.set("status", filter || "all");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handlePaymentStatusFilter = (filter: string) => {
    if (filter === "all") {
      const params = new URLSearchParams(searchParams);
      params.delete("paymentStatus");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
      return;
    }
    const params = new URLSearchParams(searchParams);
    params.set("paymentStatus", filter || "all");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };
  return (
    <div className="flex items-center gap-4 mb-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold">Status: </span>
        <Select
          onValueChange={(value) => {
            setOrderStatus(value);
            handleStatusFilter(value);
          }}
          defaultValue={orderStatus}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter Orders" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="PROCESSING">Processing</SelectItem>
            <SelectItem value="SHIPPED">Shipped</SelectItem>
            <SelectItem value="DELIVERED">Delivered</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
            <SelectItem value="RETURNED">Returned</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold">Payment: </span>
        <Select
          onValueChange={(value) => {
            setPaymentStatus(value);
            handlePaymentStatusFilter(value);
          }}
          defaultValue={paymentStatus}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter Products" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="PARTIAL">Patial</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
            <SelectItem value="REFUNDED">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default OrderFilters;
