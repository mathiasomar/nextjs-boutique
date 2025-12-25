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

const FilterCustomer = () => {
  const [type, setType] = useState<string>("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleFilter = (filter: string) => {
    if (filter === "all") {
      const params = new URLSearchParams(searchParams);
      params.delete("type");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
      return;
    }
    const params = new URLSearchParams(searchParams);
    params.set("type", filter || "all");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };
  return (
    <div className="flex items-center gap-4">
      <Select
        onValueChange={(value) => {
          setType(value);
          handleFilter(value);
        }}
        defaultValue={type}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter Customers" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="REGULAR">Regular</SelectItem>
          <SelectItem value="VIP">VIP</SelectItem>
          <SelectItem value="WHOLESALE">Wholesale</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default FilterCustomer;
