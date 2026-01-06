import ActivityLogsDataTable from "@/components/datatables/activity-data-table";
import InventoryLogsDataTable from "@/components/datatables/inventory-data-table";
import InventoryFilter from "@/components/inventory-filter";
import Search from "@/components/search";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const LogsPage = () => {
  return (
    <div>
      <Breadcrumb className="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Logs</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="mt-4">
        <Tabs defaultValue="inventories" className="w-full">
          <TabsList>
            <TabsTrigger value="inventories">Inventory Logs</TabsTrigger>
            <TabsTrigger value="activities">Activities Logs</TabsTrigger>
          </TabsList>
          <TabsContent value="inventories">
            <div className="my-4">
              <InventoryFilter />
            </div>
            <InventoryLogsDataTable />
          </TabsContent>
          <TabsContent value="activities">
            <div className="my-4">
              <Search />
            </div>
            <ActivityLogsDataTable />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LogsPage;
