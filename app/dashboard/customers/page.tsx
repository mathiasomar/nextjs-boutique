import {
  Breadcrumb,
  BreadcrumbSeparator,
  BreadcrumbLink,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import Search from "@/components/search";
import AddCustomer from "@/components/add-customer";
import FilterCustomer from "@/components/filter-customer";
import CustomerDataTable from "@/components/datatables/customer-data-table";

const CustomersPage = async () => {
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
      <CustomerDataTable />
    </div>
  );
};

export default CustomersPage;
