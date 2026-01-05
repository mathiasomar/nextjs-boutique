"use client";

import { DataTableSkeleton } from "../loaders/data-table-skeleton";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertCircleIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import {
  Payment,
  PaymentMethod,
  PaymentStatus,
} from "@/generated/prisma/client";
import { columns } from "@/app/dashboard/payments/columns";
import { DataTable } from "@/app/dashboard/payments/data-table";
import { usePayments } from "@/hooks/use-payment";

const PaymentDataTable = () => {
  const searchParams = useSearchParams();
  const filterParams = {
    search: searchParams.get("search") || undefined,
    startDate: searchParams.get("startDate") || undefined,
    endDate: searchParams.get("endDate") || undefined,
    paymentStatus: searchParams.get("paymentStatus") as PaymentStatus,
    paymentMethod: searchParams.get("paymentMethod") as PaymentMethod,
  };

  const { data, isLoading, error } = usePayments(filterParams);

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
        <DataTable columns={columns} data={data?.payments as Payment[]} />
      )}
    </>
  );
};

export default PaymentDataTable;
