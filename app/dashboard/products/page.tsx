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
import AddCategory from "@/components/add-category";
import ViewCategories from "@/components/view-categories";
import AddProduct from "@/components/add-product";
import { getCategories } from "@/app/actions/category";
import { getProducts } from "@/app/actions/product";
import { Product } from "@/generated/prisma/client";
import SearchProduct from "@/components/search-product";
import FilterProduct from "@/components/filter-product";

type FilterProps = {
  search?: string;
  stock?: string;
  isActive?: boolean;
};

const ProductsPage = async ({
  searchParams,
}: {
  searchParams: Promise<FilterProps>;
}) => {
  const { search, stock, isActive } = await searchParams;
  const productsResult = await getProducts({
    search,
    stock,
    isActive,
  });
  const categoryResult = await getCategories();
  const categories = "error" in categoryResult ? [] : categoryResult;

  if ("error" in productsResult) {
    return <div>Error loading products: {productsResult.error}</div>;
  }

  const products = productsResult.map((product) => ({
    ...product,
    price: product.price as number,
    costPrice: product.costPrice as number,
  })) as unknown as Product[];

  return (
    <div>
      <Breadcrumb className="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Products</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex items-center justify-between mb-8 px-4 py-2 bg-secondary roundedn-md">
        <h1 className="font-semiboldnn">All Products</h1>
        <div className="flex items-center gap-4">
          <AddCategory />
          <ViewCategories />
          <AddProduct categories={categories} />
        </div>
      </div>
      <div className="flex items-center justify-between flex-col md:flex-row gap-4 mb-8 px-4 py-2 bg-secondary roundedn-md">
        {/* Search Bar */}
        <SearchProduct />
        <div className="flex items-center gap-4">
          {/* Filters */}
          <FilterProduct />
        </div>
      </div>
      <DataTable columns={columns} data={products} />
    </div>
  );
};

export default ProductsPage;
