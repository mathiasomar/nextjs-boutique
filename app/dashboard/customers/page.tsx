import {
  Breadcrumb,
  BreadcrumbSeparator,
  BreadcrumbLink,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Customer } from "@/generated/prisma/client";
import { getCustomers } from "@/app/actions/customer";
import Search from "@/components/search";
import AddCustomer from "@/components/add-customer";
import { CustomerFilters } from "@/app/types";
import FilterCustomer from "@/components/filter-customer";

const CustomersPage = async ({
  searchParams,
}: {
  searchParams: Promise<CustomerFilters>;
}) => {
  const { search, type } = await searchParams;
  const customersResult = await getCustomers({ search, type });

  if ("error" in customersResult) {
    return <div>Error loading customers: {customersResult.error}</div>;
  }

  const customers: Customer[] = customersResult;

  return (
    <div>
      <Breadcrumb className="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Customers</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex items-center justify-between mb-8 px-4 py-2 bg-secondary roundedn-md">
        <h1 className="font-semiboldnn">All Customers</h1>
        <div className="flex items-center gap-4">
          <AddCustomer />
        </div>
      </div>
      <div className="flex items-center justify-between flex-col md:flex-row gap-4 mb-8 px-4 py-2 bg-secondary roundedn-md">
        {/* Search Bar */}
        <Search />
        <div className="flex items-center gap-4">
          {/* Filters */}
          <FilterCustomer />
        </div>
      </div>
      <DataTable columns={columns} data={customers} />
    </div>
  );
};

export default CustomersPage;
