"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useState } from "react";

const FilterProduct = () => {
  const [stock, setStock] = useState<string>("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleFilter = (filter: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("stock", filter || "all");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };
  return (
    <div className="flex items-center gap-4">
      <Select
        onValueChange={(value) => {
          setStock(value);
          handleFilter(value);
        }}
        defaultValue={stock}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter Products" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="inStock">In Stock</SelectItem>
          <SelectItem value="lowStock">Low Stock</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default FilterProduct;
