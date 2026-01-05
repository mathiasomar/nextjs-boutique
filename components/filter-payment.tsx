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

const PaymentFilters = () => {
  const [paymentMethod, setPaymentMethod] = React.useState<string>("");
  const [paymentStatus, setPaymentStatus] = React.useState<string>("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const handlePaymentMethodFilter = (filter: string) => {
    if (filter === "all") {
      const params = new URLSearchParams(searchParams);
      params.delete("paymentMethod");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
      return;
    }
    const params = new URLSearchParams(searchParams);
    params.set("paymentMethod", filter || "all");
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
        <span className="text-sm font-bold">Method: </span>
        <Select
          onValueChange={(value) => {
            setPaymentMethod(value);
            handlePaymentMethodFilter(value);
          }}
          defaultValue={paymentMethod}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Payment Method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="CASH">Cash</SelectItem>
            <SelectItem value="MPESA">Mpesa</SelectItem>
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
            <SelectValue placeholder="Payment Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
            <SelectItem value="REFUNDED">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default PaymentFilters;
