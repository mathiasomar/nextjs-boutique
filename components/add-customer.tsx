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
import { Field, FieldError, FieldGroup, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ScrollArea } from "./ui/scroll-area";
import { AlertCircleIcon, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { Alert, AlertTitle } from "./ui/alert";
import { useState } from "react";
import { useCreateCustomer } from "@/hooks/use-customer";
import { CustomError } from "@/lib/error-class";

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
  customerType: z.enum(["REGULAR", "VIP", "WHOLESALE"]),
});

const AddCustomer = () => {
  const [open, setOpen] = useState(false);
  const addCustomerMutation = useCreateCustomer();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as Resolver<z.infer<typeof formSchema>>,
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      address: "",
      customerType: "REGULAR",
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = async (data) => {
    // try {
    //   setLoading(true);
    //   await addCustomer(data);
    //   setOpen(false);
    //   form.reset();
    //   toast.success("Customer added successfully!");
    // } catch (error) {
    //   setError(error as string);
    //   toast.error("Failed to add customer. Please try again.");
    //   setLoading(false);
    // } finally {
    //   setLoading(false);
    // }
    // console.log("SUBMITTED", data);
    try {
      addCustomerMutation.mutateAsync(data, {
        onSuccess: () => {
          setOpen(false);
          form.reset();
          toast.success("Customer added successfully!");
        },
        onError: (error) => {
          // Error is already handled by react-hot-toast in onError,
          // but we can add additional UI feedback here
          console.error("Customer submission error:", error);

          // Show specific UI feedback based on error type
          const orderError = error as CustomError;

          if (orderError.code === "UNAUTHORIZED") {
            toast.error("Please log in to complete your order", {
              duration: 5000,
            });
          }
          // Other errors are handled by the default toast in onError
        },
      });
    } catch (error) {
      toast.error(error as string);
    }
  };
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <Plus />
          Add Customer
        </Button>
      </SheetTrigger>
      <SheetContent>
        <ScrollArea className="h-[85vh] md:h-screen">
          {addCustomerMutation.isError && (
            <div className="my-2">
              <Alert variant={"destructive"}>
                <AlertCircleIcon />
                <AlertTitle>{addCustomerMutation.error.message}</AlertTitle>
              </Alert>
            </div>
          )}
          <SheetHeader>
            <SheetTitle className="mb-4">Add Customer</SheetTitle>
            <SheetDescription>Add a new customer</SheetDescription>
            <form onSubmit={form.handleSubmit(onSubmit)}>
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
                        <SelectTrigger aria-invalid={fieldState.invalid}>
                          <SelectValue placeholder="Select Customer Type" />
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
                disabled={addCustomerMutation.isPending}
                type="submit"
                className="mt-6 w-full"
              >
                {addCustomerMutation.isPending
                  ? "Submitting..."
                  : "Add Customer"}
              </Button>
            </form>
          </SheetHeader>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default AddCustomer;
