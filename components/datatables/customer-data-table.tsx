"use client";

import { DataTableSkeleton } from "../loaders/data-table-skeleton";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertCircleIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { columns } from "@/app/dashboard/customers/columns";
import { DataTable } from "@/app/dashboard/customers/data-table";
import { useCustomers } from "@/hooks/use-customer";
import { Customer } from "@/generated/prisma/client";

const CustomerDataTable = () => {
  const searchParams = useSearchParams();
  const filterParams = {
    search: searchParams.get("search") || undefined,
    type:
      (searchParams.get("type") as "REGULAR" | "VIP" | "WHOLESALE") ||
      undefined,
  };

  const { data: customers, isLoading, error } = useCustomers(filterParams);

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
        <DataTable columns={columns} data={customers as Customer[]} />
      )}
    </>
  );
};

export default CustomerDataTable;
