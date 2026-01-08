"use client";

import {
  Breadcrumb,
  BreadcrumbSeparator,
  BreadcrumbLink,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { columns, User } from "./columns";
import { DataTable } from "./data-table";
import AddUser from "@/components/add-user";
import { useUsers } from "@/hooks/use-user";
import { DataTableSkeleton } from "@/components/loaders/data-table-skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";

const UsersPage = () => {
  const { data: users, isLoading, error } = useUsers();
  return (
    <div>
      <Breadcrumb className="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Users</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex items-center justify-between mb-8 px-4 py-2 bg-secondary rounded-md">
        <h1 className="font-semiboldnn">All Users</h1>
        <AddUser />
      </div>
      {isLoading ? (
        <DataTableSkeleton />
      ) : error ? (
        <Alert>
          <AlertCircleIcon />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error as string}</AlertDescription>
        </Alert>
      ) : (
        <DataTable columns={columns} data={users as User[]} />
      )}
    </div>
  );
};

export default UsersPage;
