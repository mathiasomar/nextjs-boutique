"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Button } from "./ui/button";
import { Eye, Trash2 } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { Item, ItemActions, ItemContent, ItemDescription } from "./ui/item";
import { useState } from "react";
import { useCategories, useDeleteCategory } from "@/hooks/use-product";
import { Spinner } from "./ui/spinner";
import toast from "react-hot-toast";

const ViewCategories = () => {
  const [open, setOpen] = useState(false);
  const deleteCategoryMutation = useDeleteCategory();
  const { data: categories, isLoading, error } = useCategories();

  const handleDelete = async (id: string) => {
    deleteCategoryMutation.mutateAsync(id, {
      onSuccess: () => {
        toast.success("Category deleted successfully!");
      },
    });
  };
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant={"outline"} size="sm" className="text-xs md:text-sm">
          <Eye />
          View Category
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <ScrollArea>
            <SheetTitle className="mb-4">View Category</SheetTitle>
            {isLoading ? (
              <span>
                Loading... <Spinner />
              </span>
            ) : error ? (
              <span>{error as string}</span>
            ) : Array.isArray(categories) ? (
              categories.map((category) => (
                <Item key={category.id}>
                  <ItemContent>
                    <ItemDescription>{category.name}</ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <Button
                      variant="destructive"
                      disabled={deleteCategoryMutation.isPending}
                      size="sm"
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash2 />
                    </Button>
                  </ItemActions>
                </Item>
              ))
            ) : (
              <span>No categories found</span>
            )}
          </ScrollArea>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};

export default ViewCategories;
