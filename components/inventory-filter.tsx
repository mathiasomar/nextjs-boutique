"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { useProducts } from "@/hooks/use-product";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const InventoryFilter = () => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [type, setType] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleFilterByProduct = (filter: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("productId", filter || "");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleDeleteFilterByProduct = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("productId");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleFilterByType = (filter: string) => {
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

  const { data, isLoading } = useProducts();
  return (
    <div className="flex items-center justify-end">
      <div className="flex items-center gap-4">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[200px] justify-between"
            >
              {value
                ? isLoading
                  ? "Loading..."
                  : data?.products?.find((product) => product.name === value)
                      ?.name
                : "Select product..."}
              <ChevronsUpDown className="opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search framework..." className="h-9" />
              <CommandList>
                <CommandEmpty>No product found.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    onSelect={(currentValue) => {
                      setValue("All");
                      setOpen(false);
                      handleDeleteFilterByProduct();
                    }}
                  >
                    All
                    <Check
                      className={cn(
                        "ml-auto",
                        value === "All" ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                  {isLoading
                    ? "Loading..."
                    : data?.products?.map((product) => (
                        <CommandItem
                          key={product.id}
                          value={product.name}
                          onSelect={(currentValue) => {
                            setValue(
                              currentValue === value ? "All" : currentValue
                            );
                            setOpen(false);
                            handleFilterByProduct(product.id);
                          }}
                        >
                          {product.name}
                          <Check
                            className={cn(
                              "ml-auto",
                              value === product.name
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <Select
          onValueChange={(value) => {
            setType(value);
            handleFilterByType(value);
          }}
          defaultValue={type}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter By Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="PURCHASE">Purchase</SelectItem>
            <SelectItem value="SALE">Sale</SelectItem>
            <SelectItem value="RETURN">Return</SelectItem>
            <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
            <SelectItem value="DAMAGE">Damage</SelectItem>
            <SelectItem value="TRANSFER">Transfer</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default InventoryFilter;
