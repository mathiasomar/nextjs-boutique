"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "./ui/input-group";
import { useState } from "react";
import { Button } from "./ui/button";

const SearchProduct = () => {
  const [searchValue, setSearchValue] = useState<string>("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleSearch = (value: string | null) => {
    const params = new URLSearchParams(searchParams);
    params.set("search", value || "");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleClearSearch = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("search");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    setSearchValue("");
  };
  return (
    <div className="flex items-center gap-4">
      <div className="min-w-[400px]">
        <InputGroup>
          <InputGroupInput
            placeholder="Type to search..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              variant="secondary"
              onClick={() => handleSearch(searchValue)}
            >
              Search
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>
      <Button variant={"outline"} onClick={handleClearSearch}>
        All
      </Button>
    </div>
  );
};

export default SearchProduct;
