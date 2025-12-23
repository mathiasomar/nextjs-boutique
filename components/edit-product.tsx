"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { Resolver } from "react-hook-form";
import * as z from "zod";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "./ui/field";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ScrollArea } from "./ui/scroll-area";
import { useState } from "react";
import { AlertCircleIcon, Edit } from "lucide-react";
import { Category, Prisma } from "@/generated/prisma/client";
import toast from "react-hot-toast";
import { Alert, AlertTitle } from "./ui/alert";
import { updateProduct } from "@/app/actions/product";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters!" }),
  description: z.string().optional(),
  categoryId: z.string().min(1),

  price: z.coerce.number().positive(),
  costPrice: z.coerce.number().positive(),

  brand: z.string().optional(),
  material: z.string().optional(),
});

const EditProduct = ({
  categories,
  product,
}: {
  categories: Category[];
  product: Prisma.ProductUncheckedUpdateInput;
}) => {
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const id = (product as { id: string }).id || "";
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as Resolver<z.infer<typeof formSchema>>,
    defaultValues: {
      name: (product as { name: string }).name || "",
      description: (product as { description: string }).description || "",
      categoryId: (product as { categoryId: string }).categoryId || "",
      price: (product as { price: number }).price || 0,
      costPrice: (product as { costPrice: number }).costPrice || 0,
      brand: (product as { brand: string }).brand || "",
      material: (product as { material: string }).material || "",
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = async (data) => {
    try {
      setLoading(true);
      await updateProduct(id, data);
      setOpen(false);
      form.reset();
      toast.success("Product updated successfully!");
    } catch (error) {
      setError(error as string);
      toast.error("Failed to add product. Please try again.");
      setLoading(false);
    } finally {
      setLoading(false);
    }
    // console.log("SUBMITTED", data);
  };
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <Edit />
          Edit Product
        </Button>
      </SheetTrigger>
      <SheetContent>
        <ScrollArea className="h-screen">
          {error && (
            <div className="my-2">
              <Alert variant={"destructive"}>
                <AlertCircleIcon />
                <AlertTitle>{error}</AlertTitle>
              </Alert>
            </div>
          )}
          <SheetHeader>
            <SheetTitle className="mb-4">Edit Product</SheetTitle>
            <SheetDescription>
              Edit an existing product in your inventory
            </SheetDescription>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FieldGroup>
                <Controller
                  name="name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="name">Product Name</FieldLabel>
                      <Input
                        {...field}
                        id="name"
                        aria-invalid={fieldState.invalid}
                        autoComplete="off"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                      <FieldDescription>
                        Enter the name of the product
                      </FieldDescription>
                    </Field>
                  )}
                />
                <Controller
                  name="description"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="description">Description</FieldLabel>
                      <Textarea
                        {...field}
                        id="description"
                        aria-invalid={fieldState.invalid}
                        placeholder="Enter Description"
                        autoComplete="off"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                      <FieldDescription>
                        Enter the description of the product
                      </FieldDescription>
                    </Field>
                  )}
                />
                <Controller
                  name="price"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="price">Price</FieldLabel>
                      <Input
                        {...field}
                        type="number"
                        id="price"
                        aria-invalid={fieldState.invalid}
                        autoComplete="off"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                      <FieldDescription>
                        Enter the price of the product
                      </FieldDescription>
                    </Field>
                  )}
                />
                <Controller
                  name="costPrice"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="costPrice">Cost Price</FieldLabel>
                      <Input
                        {...field}
                        type="number"
                        id="costPrice"
                        aria-invalid={fieldState.invalid}
                        autoComplete="off"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                      <FieldDescription>
                        This is the cost price of the product from supplier
                      </FieldDescription>
                    </Field>
                  )}
                />
                <Controller
                  name="brand"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="brand">Brand</FieldLabel>
                      <Input
                        {...field}
                        id="brand"
                        aria-invalid={fieldState.invalid}
                        autoComplete="off"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="material"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="material">Material</FieldLabel>
                      <Input
                        {...field}
                        id="material"
                        aria-invalid={fieldState.invalid}
                        autoComplete="off"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="categoryId"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Category</FieldLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger aria-invalid={fieldState.invalid}>
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>

                        <SelectContent>
                          {categories.map(
                            (category: { id: string; name: string }) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>

                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>

              <Button disabled={loading} type="submit" className="mt-6 w-full">
                {loading ? "Submitting..." : "Update Product"}
              </Button>
            </form>
          </SheetHeader>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default EditProduct;
