"use client";

import { DataTableSkeleton } from "../loaders/data-table-skeleton";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertCircleIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { ActivityLog } from "@/generated/prisma/client";
import { DataTable } from "./activity/data-table";
import { columns } from "./activity/columns";
import { useActivityLogs } from "@/hooks/use-log";

const ActivityLogsDataTable = () => {
  const searchParams = useSearchParams();
  const filterParams = {
    search: searchParams.get("search") || undefined,
  };

  const {
    data: activityLogs,
    isLoading,
    error,
  } = useActivityLogs(filterParams);

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
        <DataTable columns={columns} data={activityLogs as ActivityLog[]} />
      )}
    </>
  );
};

export default ActivityLogsDataTable;
