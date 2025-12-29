"use client";

import { DataTableSkeleton } from "../loaders/data-table-skeleton";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertCircleIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { InventoryLog, InventoryType } from "@/generated/prisma/client";
import { useInventoryLogs } from "@/hooks/use-log";
import { DataTable } from "./inventory/data-table";
import { columns } from "./inventory/columns";

const InventoryLogsDataTable = () => {
  const searchParams = useSearchParams();
  const filterParams = {
    productId: searchParams.get("productId") || undefined,
    type: (searchParams.get("type") as InventoryType) || undefined,
  };

  const {
    data: inventoryLogs,
    isLoading,
    error,
  } = useInventoryLogs(filterParams);

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
        <DataTable columns={columns} data={inventoryLogs as InventoryLog[]} />
      )}
    </>
  );
};

export default InventoryLogsDataTable;
