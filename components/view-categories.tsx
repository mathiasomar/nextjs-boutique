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
import { deleteCategory, getCategories } from "@/app/actions/category";
import { ScrollArea } from "./ui/scroll-area";
import { Item, ItemActions, ItemContent, ItemDescription } from "./ui/item";
import { useEffect, useState } from "react";

const ViewCategories = () => {
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const loadAndSetCategories = async () => {
    setLoading(true);
    setError(null);
    const result = await getCategories();

    if (Array.isArray(result)) {
      setCategories(result);
    } else if (result?.error) {
      setError(result.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    const loadCategories = async () => {
      await loadAndSetCategories();
    };

    if (open) {
      loadCategories();
    }
  }, [open]);

  const handleDelete = async (id: string) => {
    const result = await deleteCategory(id);

    if (result?.error) {
      alert(result.error);
    } else {
      // Remove from local state
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
      // Refresh data
      await loadAndSetCategories();
    }
  };
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant={"outline"}>
          <Eye />
          View Category
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <ScrollArea>
            <SheetTitle className="mb-4">View Category</SheetTitle>
            {loading && <p>Loading...</p>}
            {categories.map((category) => (
              <Item key={category.id}>
                <ItemContent>
                  <ItemDescription>{category.name}</ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(category.id)}
                  >
                    <Trash2 />
                  </Button>
                </ItemActions>
              </Item>
            ))}
          </ScrollArea>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};

export default ViewCategories;
