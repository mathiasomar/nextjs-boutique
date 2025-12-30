"use client";

import { useState } from "react";
import { Input } from "./ui/input";
import { useProducts } from "@/hooks/use-product";
import { TableMinimalSkeleton } from "./loaders/table-minimal-skeleton";
import { ScrollArea } from "./ui/scroll-area";
import ProductItem from "./product-item";

const ProductSelectItems = () => {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useProducts({ search });

  return (
    <div className="flex flex-col gap-4">
      <Input
        placeholder="search for product here...."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <ScrollArea className="h-[400px]">
        {isLoading ? (
          <TableMinimalSkeleton />
        ) : (
          <div className="flex flex-col gap-4 scroll-auto">
            {data?.error ? (
              <div>{data.error}</div>
            ) : data?.success ? (
              data.products?.map((product) => (
                <ProductItem key={product.id} product={product} />
              ))
            ) : (
              ""
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default ProductSelectItems;
