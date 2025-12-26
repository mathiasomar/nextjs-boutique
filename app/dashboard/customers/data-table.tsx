"use client";

import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DataTablePagination } from "@/components/data-table-pagination";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useDeleteCustomer } from "@/hooks/use-customer";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const deleteCustomerMutation = useDeleteCustomer();
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      rowSelection,
    },
  });
  const selectedIds = table
    .getSelectedRowModel()
    .rows.map((row) => (row.original as { id: string }).id);

  const handleDelete = async () => {
    // try {
    //   setLoading(true);
    //   const result = await deleteManyCustomers(selectedIds);
    //   if (result && "error" in result && result.error) {
    //     toast.error(result.error);
    //     setLoading(false);
    //     return;
    //   }
    //   setRowSelection({});
    //   toast.success(`${selectedIds.length} Customer(s) deleted successfully!`);
    // } catch (error) {
    //   toast.error(
    //     error instanceof Error ? error.message : "Failed to delete customer(s)"
    //   );
    //   setLoading(false);
    // } finally {
    //   setLoading(false);
    // }
    try {
      deleteCustomerMutation.mutateAsync(selectedIds, {
        onSuccess: () => {
          setRowSelection({});
          toast.success(
            `${selectedIds.length} Customer(s) deleted successfully!`
          );
        },
      });
    } catch (error) {
      toast.error(error as string);
    }
  };
  return (
    <div className="overflow-hidden rounded-md border">
      {Object.keys(rowSelection).length > 0 && (
        <div className="flex justify-end my-2">
          <Button
            className="text-sm"
            variant={"destructive"}
            onClick={handleDelete}
            disabled={deleteCustomerMutation.isPending}
          >
            <Trash2 className="w-4 h-4" />
            Delete selected ({selectedIds.length}) Customer(s)
          </Button>
        </div>
      )}
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {/* <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div> */}
      <DataTablePagination table={table} />
    </div>
  );
}
