"use client";

import AppLineChart from "@/components/app-line-chart";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { format, formatDistance, subDays } from "date-fns";
import ProductImages from "./product-images";
import EditInventory from "@/components/edit-inventory";
import EditProduct from "@/components/edit-product";
import { ScrollableTable } from "@/components/scrollable-table";
import { useParams } from "next/navigation";
import { useProduct } from "@/hooks/use-product";
import { Spinner } from "@/components/ui/spinner";
import { DataGridSkeleton } from "@/components/loaders/data-grid-skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const tableColumn = [
  { header: "Type", accessorKey: "type" as const, className: "w-[100px]" },
  { header: "New Stock", accessorKey: "newStock" as const },
  { header: "Previous Stock", accessorKey: "previousStock" as const },
  { header: "Quantity", accessorKey: "quantity" as const },
  { header: "Reason", accessorKey: "reason" as const },
  { header: "Created/Updated By", accessorKey: "user" as const },
  {
    header: "Created At",
    accessorKey: "createdAt" as const,
    className: "text-right",
  },
];

const ProductPage = () => {
  const { id } = useParams();
  const { data, isLoading, error } = useProduct(id as string);
  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dasboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/products">Products</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              {isLoading ? (
                <Spinner />
              ) : (
                (data?.product && (data.product.name as string)) || "Product"
              )}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      {/* CONTAINER */}
      {isLoading ? (
        <DataGridSkeleton items={2} />
      ) : error ? (
        <Alert variant={"destructive"}>
          <AlertCircle />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error as string}</AlertDescription>
        </Alert>
      ) : (
        <div className="mt-4 flex flex-col xl:flex-row gap-8">
          {/* LEFT */}
          <div className="w-full xl:w-1/3 space-y-6">
            {/* PRODUCT IMAGES */}
            <ProductImages
              product={{
                images:
                  (data?.product &&
                    (data.product.images as Record<string, string>)) ||
                  {},
                colors:
                  (data?.product && (data.product.color as string[])) || [],
                name: (data?.product && (data.product.name as string)) || "",
              }}
            />
            {/* USER CARD CONTAINER */}
            <div className="bg-primary-foreground p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                {/* <div className="relative h-9 w-9">
                <Image
                  src={
                    (product as { images: Record<string, string> }).images?.[
                      (product as { color: string[] }).color[0]
                    ] || "/products/1g.p1"
                  }
                  alt={(product as { name: string }).name || "Test Product"}
                  fill
                  className="rounded object-cover"
                />
              </div> */}

                <h1 className="text-xl font-semibold">
                  {(data?.product && (data.product.name as string)) ||
                    "Product"}
                </h1>
              </div>

              <p className="text-sm text-muted-foreground">
                {(data?.product && (data.product.description as string)) ||
                  "No Description"}
              </p>

              <p className="text-sm text-muted-foreground mt-4">
                Created{" "}
                {formatDistance(
                  subDays(
                    (data?.product && (data.product.createdAt as Date)) ||
                      new Date(),
                    3
                  ),
                  new Date(),
                  {
                    addSuffix: true,
                  }
                )}
              </p>
            </div>
            {/* INFORMATION CONTAINER */}
            <div className="bg-primary-foreground p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">Product Information</h1>
                <EditProduct productId={id as string} />
              </div>
              <div className="space-y-4 mt-4">
                <div className="flex items-center gap-2">
                  <span className="font-bold">Product Name:</span>
                  <span>
                    {(data?.product && (data.product.name as string)) ||
                      "Product"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">Category:</span>
                  <span>
                    {(data?.product &&
                      (data!.product as { category: { name: string } }).category
                        ?.name) ||
                      "No Category"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">Brand:</span>
                  <span>
                    {(data?.product && (data.product.brand as string)) ||
                      "No Brand"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">Current Stock:</span>
                  <span>
                    {(data?.product &&
                      (data!.product as { currentStock: number })
                        .currentStock) ||
                      0}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">Price:</span>
                  <span>
                    {data?.product &&
                      new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "Ksh",
                      }).format(data.product.price.toNumber() || 0)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">Cost Price:</span>
                  <span>
                    {data?.product &&
                      new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "Ksh",
                      }).format(data.product.costPrice.toNumber() || 0)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">Sizes:</span>
                  <span>
                    {(data?.product &&
                      (data!.product as { size: string[] }).size
                        ?.join(", ")
                        .toUpperCase()) ||
                      "No Sizes"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* RIGHT */}
          <div className="w-full xl:w-2/3 space-y-6">
            {/* THE CHART CONTAINER */}
            <div className="bg-primary-foreground p-4 rounded-lg">
              <h1 className="text-xl font-semibold">Product Sales Tracking</h1>
              <AppLineChart />
            </div>
            {/* INVENTORY */}
            <div className="bg-primary-foreground p-4 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-semibold">Product Inventory</h1>
                {/* Edit Inventory */}
                <EditInventory productId={id as string} />
              </div>
              {data?.product ? (
                <ScrollableTable
                  columns={tableColumn}
                  data={data!.product.inventoryLogs!.map((log) => ({
                    ...log,
                    user: log.user?.name || "Unknown User",
                    createdAt: format(log.createdAt, "dd MMM yyyy") as string,
                  }))}
                  maxHeight="400px"
                  description="A list of your recent inventory logs."
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Fetching Product Inventory Logs... <Spinner />
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;
