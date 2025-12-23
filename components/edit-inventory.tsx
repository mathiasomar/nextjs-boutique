"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Button } from "./ui/button";
import { AlertCircleIcon, Edit } from "lucide-react";
import z, { string } from "zod";
import { Controller, Resolver, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateStock } from "@/app/actions/product";
import { toast } from "react-hot-toast";
import { Field, FieldError, FieldGroup, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "./ui/input-group";
import { ScrollArea } from "./ui/scroll-area";
import { Alert, AlertTitle } from "./ui/alert";

const formSchema = z.object({
  quantity: z.coerce.number().min(1),
  type: z.enum([
    "PURCHASE",
    "SALE",
    "RETURN",
    "ADJUSTMENT",
    "DAMAGE",
    "TRANSFER",
  ]),
  reason: string()
    .max(50, { message: "Reason must be at most 50 characters" })
    .optional(),
});

const EditInventory = ({ productId }: { productId: string }) => {
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as Resolver<z.infer<typeof formSchema>>,
    defaultValues: {
      quantity: 1,
      type: "PURCHASE",
      reason: "",
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = async (data) => {
    try {
      setLoading(true);
      await updateStock(productId, data.quantity, data.type, data.reason);
      setOpen(false);
      form.reset();
      toast.success("Inventory updated successfully!");
    } catch (error) {
      setError(error as string);
      toast.error("Failed to update inventory. Please try again.");
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
          Edit Product Inventory
        </Button>
      </SheetTrigger>
      <SheetContent>
        <ScrollArea className="max-h-screen">
          {error && (
            <div className="my-2">
              <Alert variant={"destructive"}>
                <AlertCircleIcon />
                <AlertTitle>{error}</AlertTitle>
              </Alert>
            </div>
          )}
          <SheetHeader>
            <SheetTitle className="mb-4">Edit Product Inventory</SheetTitle>
            <SheetDescription>
              Edit an existing product inventory
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-4">
            <FieldGroup>
              <Controller
                name="quantity"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="quantity">Quantity</FieldLabel>
                    <Input
                      {...field}
                      type="number"
                      id="quantity"
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
                name="type"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Category</FieldLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="PURCHASE">Purchase</SelectItem>
                        <SelectItem value="SALE">Sale</SelectItem>
                        <SelectItem value="RETURN">Return</SelectItem>
                        <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                        <SelectItem value="DAMAGE">Damage</SelectItem>
                        <SelectItem value="TRANSFER">Transfer</SelectItem>
                      </SelectContent>
                    </Select>

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="reason"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="reason">Reason</FieldLabel>
                    <InputGroup>
                      <InputGroupTextarea
                        {...field}
                        id="reason"
                        placeholder="Provide a reason for the inventory change..."
                        rows={6}
                        className="min-h-24 resize-none"
                        aria-invalid={fieldState.invalid}
                      />
                      <InputGroupAddon align="block-end">
                        <InputGroupText className="tabular-nums">
                          {field.value?.length}/50 characters
                        </InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
            <Button disabled={loading} type="submit" className="mt-6 w-full">
              {loading ? "Updating..." : "Update Product Inventory"}
            </Button>
          </form>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default EditInventory;
