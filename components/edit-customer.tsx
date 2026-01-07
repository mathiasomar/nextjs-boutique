"use client";

import { Customer } from "@/generated/prisma/client";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { useEffect, useState } from "react";
import z from "zod";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Resolver } from "react-hook-form";
import toast from "react-hot-toast";
import { Button } from "./ui/button";
import { AlertCircleIcon, Edit } from "lucide-react";
import { Alert, AlertTitle } from "./ui/alert";
import { Field, FieldError, FieldGroup, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ScrollArea } from "./ui/scroll-area";
import { useCustomer, useUpdateCustomer } from "@/hooks/use-customer";
import { Skeleton } from "./ui/skeleton";

const formSchema = z.object({
  firstName: z.string().min(1, "First Name must be at least 2 characters!"),
  lastName: z.string().min(1, "Last Name must be at least 2 characters!"),
  phone: z.string().optional(),
  email: z
    .string()
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
      message: "Invalid email address!",
    })
    .optional(),
  address: z.string().optional(),
  loyaltyPoints: z
    .number()
    .min(0, "Loyalty Points cannot be negative")
    .optional(),
  customerType: z.enum(["REGULAR", "VIP", "WHOLESALE"]),
});

const EditCustomer = ({ customer }: { customer: Customer }) => {
  const [open, setOpen] = useState(false);
  const updateCustomerMutation = useUpdateCustomer();

  const { isLoading, refetch } = useCustomer(customer.id, {
    enabled: false,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as Resolver<z.infer<typeof formSchema>>,
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      address: "",
      loyaltyPoints: 0,
      customerType: "REGULAR",
    },
  });

  // Reset form with fetched data when sheet opens
  useEffect(() => {
    if (open) {
      // Fetch data when sheet opens
      refetch()
        .then((result) => {
          if (result.data?.customer) {
            // Reset form with fetched data
            form.reset({
              firstName: result.data.customer.firstName,
              lastName: result.data.customer.lastName,
              phone: result.data.customer.phone || "",
              email: result.data.customer.email || "",
              address: result.data.customer.address || "",
              loyaltyPoints: Number(result.data.customer.loyaltyPoints),
              customerType: result.data.customer.customerType,
            });
          }
        })
        .catch((error) => {
          toast.error("Failed to load expense data");
          console.error("Error fetching expense:", error);
        });
    } else {
      // Reset form when sheet closes
      form.reset({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        address: "",
        loyaltyPoints: 0,
        customerType: "REGULAR",
      });
    }
  }, [open, form, refetch]);

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = async (data) => {
    try {
      updateCustomerMutation.mutateAsync(
        { id: customer.id, ...data },
        {
          onSuccess: () => {
            setOpen(false);
            toast.success("Customer updated successfully!");
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
        <Button variant={"outline"} size={"icon"}>
          <Edit />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <ScrollArea className="h-screen">
          {updateCustomerMutation.isError && (
            <div className="my-2">
              <Alert variant={"destructive"}>
                <AlertCircleIcon />
                <AlertTitle>
                  {updateCustomerMutation.error.message as string}
                </AlertTitle>
              </Alert>
            </div>
          )}
          <SheetHeader>
            <SheetTitle className="mb-4">Edit Customer</SheetTitle>
            <SheetDescription>Edit customer details</SheetDescription>
          </SheetHeader>

          {isLoading ? (
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-10 w-full mt-6" />
            </div>
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-4">
              <FieldGroup>
                <Controller
                  name="firstName"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                      <Input
                        {...field}
                        id="firstName"
                        aria-invalid={fieldState.invalid}
                        autoComplete="off"
                        disabled={updateCustomerMutation.isPending || isLoading}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="lastName"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                      <Input
                        {...field}
                        id="lastName"
                        aria-invalid={fieldState.invalid}
                        autoComplete="off"
                        disabled={updateCustomerMutation.isPending || isLoading}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="email">Email</FieldLabel>
                      <Input
                        {...field}
                        id="email"
                        aria-invalid={fieldState.invalid}
                        autoComplete="off"
                        disabled={updateCustomerMutation.isPending || isLoading}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="phone"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="phone">Phone</FieldLabel>
                      <Input
                        {...field}
                        id="phone"
                        aria-invalid={fieldState.invalid}
                        autoComplete="off"
                        disabled={updateCustomerMutation.isPending || isLoading}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="address"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="address">Address</FieldLabel>
                      <Input
                        {...field}
                        id="address"
                        aria-invalid={fieldState.invalid}
                        autoComplete="off"
                        disabled={updateCustomerMutation.isPending || isLoading}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="loyaltyPoints"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="loyaltyPoints">
                        Loyalty Points
                      </FieldLabel>
                      <Input
                        {...field}
                        id="loyaltyPoints"
                        type="number"
                        aria-invalid={fieldState.invalid}
                        autoComplete="off"
                        disabled={updateCustomerMutation.isPending || isLoading}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="customerType"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Customer Type</FieldLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger
                          aria-invalid={fieldState.invalid}
                          disabled={
                            updateCustomerMutation.isPending || isLoading
                          }
                        >
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="REGULAR">Regular</SelectItem>
                          <SelectItem value="VIP">VIP</SelectItem>
                          <SelectItem value="WHOLESALE">Wholesale</SelectItem>
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
                disabled={updateCustomerMutation.isPending || isLoading}
                type="submit"
                className="mt-6 w-full"
              >
                {updateCustomerMutation.isPending || isLoading
                  ? "Submitting..."
                  : "Update Customer"}
              </Button>
            </form>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default EditCustomer;
