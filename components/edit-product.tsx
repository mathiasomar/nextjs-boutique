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
import toast from "react-hot-toast";
import { Alert, AlertTitle } from "./ui/alert";
import {
  useCategories,
  useProduct,
  useUpdateProduct,
} from "@/hooks/use-product";
import { Spinner } from "./ui/spinner";

const formSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters!" }),
    description: z.string().optional(),
    categoryId: z.string().min(1),

    price: z.coerce.number().positive(),
    costPrice: z.coerce.number().positive(),
    currentStock: z.coerce.number().int().min(0),
    minStockLevel: z.coerce.number().int().min(0),

    brand: z.string().optional(),
    material: z.string().optional(),
  })
  .refine(
    (data) => {
      const price = parseFloat(data.price.toString());
      const costPrice = parseFloat(data.costPrice.toString());
      return price >= costPrice;
    },
    {
      message: "Price must be greater than or equal to cost price",
      path: ["price"], // Show error on price field
    }
  );

const EditProduct = ({ productId }: { productId: string }) => {
  const [open, setOpen] = useState(false);
  const fetchProduct = useProduct(productId);
  const fetchCategories = useCategories();
  const updateProductMutation = useUpdateProduct();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as Resolver<z.infer<typeof formSchema>>,
    defaultValues: {
      name: fetchProduct.isLoading
        ? ""
        : (fetchProduct.data?.product &&
            (fetchProduct.data.product.name as string)) ||
          "",
      description: fetchProduct.isLoading
        ? ""
        : (fetchProduct.data?.product &&
            (fetchProduct.data.product.description as string)) ||
          "",
      categoryId: fetchProduct.isLoading
        ? ""
        : (fetchProduct.data?.product &&
            (fetchProduct.data.product.categoryId as string)) ||
          "",
      price: fetchProduct.isLoading
        ? 0
        : (fetchProduct.data?.product &&
            parseInt(String(fetchProduct.data?.product.price))) ||
          0,
      costPrice: fetchProduct.isLoading
        ? 0
        : (fetchProduct.data?.product &&
            parseInt(String(fetchProduct.data?.product.costPrice))) ||
          0,
      currentStock: fetchProduct.isLoading
        ? 0
        : (fetchProduct.data?.product &&
            parseInt(String(fetchProduct.data?.product.currentStock))) ||
          0,
      minStockLevel: fetchProduct.isLoading
        ? 0
        : (fetchProduct.data?.product &&
            parseInt(String(fetchProduct.data?.product.minStockLevel))) ||
          0,
      brand: fetchProduct.isLoading
        ? ""
        : (fetchProduct.data?.product && fetchProduct.data.product.brand) || "",
      material: fetchProduct.isLoading
        ? ""
        : (fetchProduct.data?.product && fetchProduct.data.product.material) ||
          "",
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = async (data) => {
    // try {
    //   setLoading(true);
    //   await updateProduct(id, data);
    //   setOpen(false);
    //   form.reset();
    //   toast.success("Product updated successfully!");
    // } catch (error) {
    //   setError(error as string);
    //   toast.error("Failed to update product. Please try again.");
    //   setLoading(false);
    // } finally {
    //   setLoading(false);
    // }
    // console.log("SUBMITTED", data);
    try {
      updateProductMutation.mutateAsync(
        { id: productId, ...data },
        {
          onSuccess: () => {
            setOpen(false);
            toast.success("Product updated successfully!");
            fetchProduct.refetch();
          },
        }
      );
    } catch (error) {
      toast.error(error as string);
    }
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
        <ScrollArea className="h-[85vh] md:h-screen">
          {updateProductMutation.isError && (
            <div className="my-2">
              <Alert variant={"destructive"}>
                <AlertCircleIcon />
                <AlertTitle>{updateProductMutation.error as string}</AlertTitle>
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
                        disabled={updateProductMutation.isPending}
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
                        disabled={updateProductMutation.isPending}
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
                        disabled={updateProductMutation.isPending}
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
                        disabled={updateProductMutation.isPending}
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
                  name="currentStock"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="currentStock">
                        Current Stock
                      </FieldLabel>
                      <Input
                        {...field}
                        type="number"
                        id="currentStock"
                        aria-invalid={fieldState.invalid}
                        autoComplete="off"
                        disabled={updateProductMutation.isPending}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="minStockLevel"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="minStockLevel">
                        Min Stock Level
                      </FieldLabel>
                      <Input
                        {...field}
                        type="number"
                        id="minStockLevel"
                        aria-invalid={fieldState.invalid}
                        autoComplete="off"
                        disabled={updateProductMutation.isPending}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
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
                        disabled={updateProductMutation.isPending}
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
                        disabled={updateProductMutation.isPending}
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
                        disabled={updateProductMutation.isPending}
                      >
                        <SelectTrigger aria-invalid={fieldState.invalid}>
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>

                        <SelectContent>
                          {fetchCategories.isLoading ? (
                            <Spinner />
                          ) : fetchCategories.error ? (
                            <p>{fetchCategories.error as string}</p>
                          ) : Array.isArray(fetchCategories.data) ? (
                            fetchCategories.data.map(
                              (category: { id: string; name: string }) => (
                                <SelectItem
                                  key={category.id}
                                  value={category.id}
                                >
                                  {category.name}
                                </SelectItem>
                              )
                            )
                          ) : (
                            <p>No categories found</p>
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

              <Button
                disabled={updateProductMutation.isPending}
                type="submit"
                className="mt-6 w-full"
              >
                {updateProductMutation.isPending
                  ? "Submitting..."
                  : "Update Product"}
              </Button>
            </form>
          </SheetHeader>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default EditProduct;
