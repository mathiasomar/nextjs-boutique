import {
  Breadcrumb,
  BreadcrumbSeparator,
  BreadcrumbLink,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import Search from "@/components/search";
import ExpenseDataTable from "@/components/datatables/expense-data-table";
import AddExpense from "@/components/add-expense";
import FilterByDate from "@/components/filter-by-date";

const ExpensesPage = async () => {
  return (
    <div>
      <Breadcrumb className="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Expenses</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex items-center justify-between mb-8 px-4 py-2 bg-secondary roundedn-md">
        <h1 className="font-semiboldnn">All Expenses</h1>
        <div className="flex items-center gap-4">
          <AddExpense />
        </div>
      </div>
      <div className="flex items-center justify-between flex-col lg:flex-row gap-4 mb-8 px-4 py-2 bg-secondary roundedn-md">
        {/* Search Bar */}
        <Search />
        <div className="flex items-center gap-4">
          {/* Filters */}
          <FilterByDate />
        </div>
      </div>
      <ExpenseDataTable />
    </div>
  );
};

export default ExpensesPage;
