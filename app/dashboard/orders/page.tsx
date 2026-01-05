import {
  Breadcrumb,
  BreadcrumbSeparator,
  BreadcrumbLink,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import Search from "@/components/search";
import OrderDataTable from "@/components/datatables/order-data-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import FilterByDate from "@/components/filter-by-date";
import OrderFilters from "@/components/order-filters";

const OrdersPage = async () => {
  return (
    <div>
      <Breadcrumb className="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Orders</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex items-center justify-between mb-8 px-4 py-2 bg-secondary roundedn-md">
        <h1 className="font-semiboldnn">All Orders</h1>
        <div className="flex items-center gap-4">
          <Button asChild>
            <Link href="/dashboard/orders/new">
              <Plus /> Add Order
            </Link>
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-between flex-col md:flex-row gap-4 mb-8 px-4 py-2 bg-secondary roundedn-md">
        {/* Search Bar */}
        <Search />
        <div className="flex items-center gap-4">
          {/* Filters */}
          <FilterByDate />
        </div>
      </div>
      <div className="flex items-center justify-end">
        <OrderFilters />
      </div>
      <OrderDataTable />
    </div>
  );
};

export default OrdersPage;
