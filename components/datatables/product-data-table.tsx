"use client";

import { columns } from "@/app/dashboard/products/columns";
import { useProducts } from "@/hooks/use-product";
import { DataTableSkeleton } from "../loaders/data-table-skeleton";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertCircleIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Product } from "@/generated/prisma/client";
import { DataTable } from "@/app/dashboard/products/data-table";

const ProductDataTable = () => {
  const searchParams = useSearchParams();
  const filterParams = {
    search: searchParams.get("search") || undefined,
    stock: searchParams.get("stock") || undefined,
    isActive: searchParams.get("isActive") === "true" || undefined,
  };

  const { data, isLoading, error } = useProducts(filterParams);

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
        <DataTable columns={columns} data={data?.products as Product[]} />
      )}
    </>
  );
};

export default ProductDataTable;
