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
import { getProductById } from "@/app/actions/product";
import ProductImages from "../product-images";
import EditInventory from "@/components/edit-inventory";
import EditProduct from "@/components/edit-product";
import { getCategories } from "@/app/actions/category";
import { Prisma } from "@/generated/prisma/client";
import { ScrollableTable } from "@/components/scrollable-table";

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

const ProductPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const product = await getProductById(id);
  const categories = await getCategories();
  if (!product || "error" in product) return null;
  if (!categories || "error" in categories) return null;
  const serializedProduct = JSON.parse(JSON.stringify(product));
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
              {(product as { name: string }).name || "Test User"}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      {/* CONTAINER */}
      <div className="mt-4 flex flex-col xl:flex-row gap-8">
        {/* LEFT */}
        <div className="w-full xl:w-1/3 space-y-6">
          {/* PRODUCT IMAGES */}
          <ProductImages
            product={{
              images: product.images as Record<string, string>,
              colors: product.color || [],
              name: product.name,
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
                {(product as { name: string }).name || "Test Product"}
              </h1>
            </div>

            <p className="text-sm text-muted-foreground">
              {(product as { description: string }).description ||
                "No description available."}
            </p>

            <p className="text-sm text-muted-foreground mt-4">
              Created{" "}
              {formatDistance(
                subDays((product as { createdAt: Date }).createdAt, 3),
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
              <EditProduct
                categories={categories}
                product={
                  serializedProduct as Prisma.ProductUncheckedUpdateInput
                }
              />
            </div>
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-2">
                <span className="font-bold">Product Name:</span>
                <span>
                  {(product as { name: string }).name || "Test Product"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">Category:</span>
                <span>
                  {(product as { category: { name: string } }).category?.name ||
                    "No Category"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">Brand:</span>
                <span>
                  {(product as { brand: string }).brand || "No Brand"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">Current Stock:</span>
                <span>
                  {(product as { currentStock: number }).currentStock || 0}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">Sizes:</span>
                <span>
                  {(product as { size: string[] }).size
                    ?.join(", ")
                    .toUpperCase() || "No Sizes"}
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
              <EditInventory productId={product.id} />
            </div>
            <ScrollableTable
              columns={tableColumn}
              data={product.inventoryLogs.map((log) => ({
                ...log,
                user: log.user?.name || "Unknown User",
                createdAt: format(log.createdAt, "dd MMM yyyy") as string,
              }))}
              maxHeight="400px"
              description="A list of your recent inventory logs."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
