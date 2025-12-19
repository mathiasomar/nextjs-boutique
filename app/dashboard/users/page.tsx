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
import { getUsers } from "@/app/actions/user";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AddUser from "@/components/add-user";

const UsersPage = async () => {
  // const data = await getData();
  const users = await getUsers();
  return (
    <div>
      <Breadcrumb className="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
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
      <DataTable columns={columns} data={users as User[]} />
    </div>
  );
};

export default UsersPage;
