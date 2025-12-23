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
import { Checkbox } from "./ui/checkbox";
import { ScrollArea } from "./ui/scroll-area";
import { useEffect, useState } from "react";
import { AlertCircleIcon, Plus } from "lucide-react";
import { Category } from "@/generated/prisma/client";
import { colors, sizes } from "@/constants/product";
import toast from "react-hot-toast";
import { Alert, AlertTitle } from "./ui/alert";
import { createProduct } from "@/app/actions/product";

const formSchema = z
  .object({
    sku: z.string().min(3, { message: "SKU must be at least 3 characters!" }),
    name: z.string().min(2, { message: "Name must be at least 2 characters!" }),
    description: z.string().optional(),
    categoryId: z.string().min(1),

    price: z.coerce.number().positive(),
    costPrice: z.coerce.number().positive(),
    currentStock: z.coerce.number().int().min(0),

    size: z.array(z.enum(sizes)).min(1, "Select at least one size"),
    color: z.array(z.enum(colors)).min(1, "Select at least one color"),
    images: z.record(z.string(), z.string()),
  })
  .refine(
    (data) => {
      const missingImages = data.color.filter((color) => !data.images[color]);
      return missingImages.length === 0;
    },
    {
      message: "Please upload images for all selected colors.",
      path: ["images"],
    }
  );

const AddProduct = ({ categories }: { categories: Category[] }) => {
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as Resolver<z.infer<typeof formSchema>>,
    defaultValues: {
      sku: "",
      name: "",
      description: "",
      categoryId: "",
      price: 0,
      costPrice: 0,
      currentStock: 0,
      size: [],
      color: [],
      images: {},
    },
  });

  const generateSku = () => {
    const prefix = "PRD";
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}${randomNumber}`;
  };

  useEffect(() => {
    // Generate SKU when the sheet is opened
    if (open) {
      const sku = generateSku();
      form.setValue("sku", sku);
    }
  }, [open, form]);

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = async (data) => {
    try {
      setLoading(true);
      await createProduct(data);
      setOpen(false);
      form.reset();
      toast.success("Product added successfully!");
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
          <Plus />
          Add Product
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
            <SheetTitle className="mb-4">Add Product</SheetTitle>
            <SheetDescription>
              Add a new product to your inventory
            </SheetDescription>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FieldGroup>
                <Controller
                  name="sku"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="sku">SKU</FieldLabel>
                      <Input
                        {...field}
                        id="sku"
                        aria-invalid={fieldState.invalid}
                        autoComplete="off"
                        disabled
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
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
                      <Select onValueChange={field.onChange}>
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
                <Controller
                  name="size"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="sizes">Sizes</FieldLabel>
                      <div className="grid grid-cols-3 gap-4 my-2">
                        {sizes.map((size) => (
                          <div className="flex items-center gap-2" key={size}>
                            <Checkbox
                              id={size}
                              checked={field.value?.includes(size)}
                              onCheckedChange={(checked) => {
                                const currentValues = field.value || [];
                                if (checked) {
                                  field.onChange([...currentValues, size]);
                                } else {
                                  field.onChange(
                                    currentValues.filter((v) => v !== size)
                                  );
                                }
                              }}
                            />
                            <label htmlFor={size} className="text-xs">
                              {size}
                            </label>
                          </div>
                        ))}
                      </div>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                      <FieldDescription>
                        Enter the available sizes for the product
                      </FieldDescription>
                    </Field>
                  )}
                />
                <Controller
                  name="color"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="colors">Colors</FieldLabel>
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4 my-2">
                          {colors.map((color) => (
                            <div
                              className="flex items-center gap-2"
                              key={color}
                            >
                              <Checkbox
                                id={color}
                                checked={field.value?.includes(color)}
                                onCheckedChange={(checked) => {
                                  const currentValues = field.value || [];
                                  if (checked) {
                                    field.onChange([...currentValues, color]);
                                  } else {
                                    field.onChange(
                                      currentValues.filter((v) => v !== color)
                                    );
                                  }
                                }}
                              />
                              <label
                                htmlFor={color}
                                className="text-xs flex items-center gap-2"
                              >
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: color }}
                                />
                                {color}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                      <FieldDescription>
                        Enter the available sizes for the product
                      </FieldDescription>
                    </Field>
                  )}
                />
                <Controller
                  name="images"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="images">Images</FieldLabel>
                      <div>
                        {form.watch("color")?.map((col) => (
                          <div
                            className="mb-4 flex items-center gap-4"
                            key={col}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: col }}
                              />
                              <span className="text-sm font-medium min-w-20">
                                {col}:
                              </span>
                            </div>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  try {
                                    setUploading(true);
                                    const formData = new FormData();
                                    formData.append("file", file);
                                    formData.append(
                                      "upload_preset",
                                      "boutique"
                                    );

                                    const res = await fetch(
                                      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
                                      {
                                        method: "POST",
                                        body: formData,
                                      }
                                    );

                                    const data = await res.json();
                                    if (data.secure_url) {
                                      const currentImage =
                                        form.getValues("images") || {};
                                      form.setValue("images", {
                                        ...currentImage,
                                        [col]: data.secure_url,
                                      });
                                    }
                                  } catch (error) {
                                    console.log(error);
                                    toast.error(
                                      "Upload failed. Please try again."
                                    );
                                    setUploading(false);
                                  } finally {
                                    setUploading(false);
                                  }
                                }
                              }}
                            />
                            {field.value?.[col] ? (
                              <span className="text-green-600 text-sm">
                                Image Selected
                              </span>
                            ) : uploading ? (
                              <span className="text-orange-600 text-sm">
                                Uploading...
                              </span>
                            ) : (
                              <span className="text-red-600 text-sm">
                                Image Required
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </Field>
                  )}
                />
              </FieldGroup>

              <Button
                disabled={loading || uploading}
                type="submit"
                className="mt-6 w-full"
              >
                {loading ? "Submitting..." : "Add Product"}
              </Button>
            </form>
          </SheetHeader>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default AddProduct;
