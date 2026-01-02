"use client";

import { DataTableSkeleton } from "../loaders/data-table-skeleton";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertCircleIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { columns } from "@/app/dashboard/expenses/columns";
import { DataTable } from "@/app/dashboard/expenses/data-table";
import { useExpenses } from "@/hooks/use-expense";
import { Expense } from "@/generated/prisma/client";

const ExpenseDataTable = () => {
  const searchParams = useSearchParams();
  const filterParams = {
    search: searchParams.get("search") || undefined,
    startDate: searchParams.get("startDate") || undefined,
    endDate: searchParams.get("endDate") || undefined,
  };

  const { data, isLoading, error } = useExpenses(filterParams);

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
        <DataTable columns={columns} data={data?.expenses as Expense[]} />
      )}
    </>
  );
};

export default ExpenseDataTable;
