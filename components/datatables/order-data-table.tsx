"use client";

import { DataTableSkeleton } from "../loaders/data-table-skeleton";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertCircleIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Order, OrderStatus, PaymentStatus } from "@/generated/prisma/client";
import { useOrders } from "@/hooks/use-order";
import { DataTable } from "@/app/dashboard/orders/data-table";
import { columns } from "@/app/dashboard/orders/columns";

const OrderDataTable = () => {
  const searchParams = useSearchParams();
  const filterParams = {
    search: searchParams.get("search") || undefined,
    status: (searchParams.get("status") as OrderStatus) || undefined,
    payStatus: (searchParams.get("payStatus") as PaymentStatus) || undefined,
  };

  const { data, isLoading, error } = useOrders(filterParams);

  return (
    <>
      {isLoading ? (
        <DataTableSkeleton />
      ) : error ? (
        <Alert>
          <AlertCircleIcon />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error as string}</AlertDescription>
        </Alert>
      ) : (
        <DataTable columns={columns} data={data?.orders as Order[]} />
      )}
    </>
  );
};

export default OrderDataTable;
