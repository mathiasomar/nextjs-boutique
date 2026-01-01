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
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ScrollArea } from "./ui/scroll-area";
import { AlertCircleIcon, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import { Alert, AlertTitle } from "./ui/alert";
import { useState } from "react";
import { useCustomers } from "@/hooks/use-customer";
import useCartStore from "@/store/cart-store";
import { Spinner } from "./ui/spinner";
import { OrderError, useCreateOrder } from "@/hooks/use-order";
import { Input } from "./ui/input";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  customerId: z.string(),
  status: z.enum([
    "DRAFT",
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "RETURNED",
  ]),
  paymentStatus: z.enum([
    "PENDING",
    "PARTIAL",
    "COMPLETED",
    "FAILED",
    "REFUNDED",
  ]),
  discount: z.coerce.number().min(0).max(100).default(0),
});

const OrderCheckout = () => {
  const [open, setOpen] = useState(false);
  const { cart, clearCart } = useCartStore();
  const { data, isLoading } = useCustomers();
  const router = useRouter();
  const addOrderMutation = useCreateOrder();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as Resolver<z.infer<typeof formSchema>>,
    defaultValues: {
      customerId: "",
      status: "PENDING",
      paymentStatus: "PENDING",
      discount: 0,
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = async (data) => {
    try {
      if (cart.length === 0) {
        toast.error("Your cart is empty");
        return;
      }

      const items = cart.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        totalPrice: item.totalPrice,
        unitPrice: item.price,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
      }));

      addOrderMutation.mutateAsync(
        {
          ...data,
          items,
        },
        {
          onSuccess: () => {
            setOpen(false);
            form.reset();
            clearCart();
            toast.success("Order created successfully! Redirecting...");
            setTimeout(() => {
              router.push("/dashboard/orders");
            }, 500);
          },
          onError: (error) => {
            // Error is already handled by react-hot-toast in onError,
            // but we can add additional UI feedback here
            console.error("Order submission error:", error);

            // Show specific UI feedback based on error type
            const orderError = error as OrderError;

            if (orderError.code === "INSUFFICIENT_STOCK") {
              // You could highlight out-of-stock items in the cart
              toast.error(
                "Some items have insufficient stock. Please update your cart.",
                {
                  duration: 6000,
                }
              );
            } else if (orderError.code === "UNAUTHORIZED") {
              toast.error("Please log in to complete your order", {
                duration: 5000,
              });
            }
            // Other errors are handled by the default toast in onError
          },
        }
      );
    } catch (error) {
      console.log("Order submission error:", error);
    }
  };

  const error = addOrderMutation.error as OrderError;
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <ShoppingBag />
          Checkout
        </Button>
      </SheetTrigger>
      <SheetContent>
        <ScrollArea className="h-screen">
          {addOrderMutation.isError && error && (
            <div className="my-2">
              <Alert variant={"destructive"}>
                <AlertCircleIcon />
                <AlertTitle>{error.message}</AlertTitle>
              </Alert>
            </div>
          )}
          <SheetHeader>
            <SheetTitle className="mb-4">Add Customer</SheetTitle>
            <SheetDescription>Add a new customer</SheetDescription>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FieldGroup>
                <Controller
                  name="customerId"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Customer</FieldLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger aria-invalid={fieldState.invalid}>
                          <SelectValue placeholder="Select Customer" />
                        </SelectTrigger>

                        <SelectContent>
                          {isLoading ? (
                            <Spinner />
                          ) : (
                            Array.isArray(data) &&
                            data.map((customer) => (
                              <SelectItem key={customer.id} value={customer.id}>
                                {customer.firstName} {customer.lastName}
                              </SelectItem>
                            ))
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
                  name="status"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Order Status</FieldLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger aria-invalid={fieldState.invalid}>
                          <SelectValue placeholder="Select Order Status" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                          <SelectItem value="PROCESSING">Processing</SelectItem>
                          <SelectItem value="SHIPPED">Shipped</SelectItem>
                          <SelectItem value="DELIVERED">Delivered</SelectItem>
                          <SelectItem value="CANCELLED">Cancelled</SelectItem>
                          <SelectItem value="DRAFT">Draft</SelectItem>
                          <SelectItem value="RETURNED">Returned</SelectItem>
                        </SelectContent>
                      </Select>

                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="paymentStatus"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Order Status</FieldLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger aria-invalid={fieldState.invalid}>
                          <SelectValue placeholder="Select Order Status" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="PARTIAL">Patial</SelectItem>
                          <SelectItem value="COMPLETED">Completed</SelectItem>
                          <SelectItem value="FAILED">Failed</SelectItem>
                          <SelectItem value="REFUNDED">Refunded</SelectItem>
                        </SelectContent>
                      </Select>

                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="discount"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="discount">Discount</FieldLabel>
                      <Input
                        {...field}
                        id="discount"
                        type="number"
                        aria-invalid={fieldState.invalid}
                        autoComplete="off"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>

              <Button
                disabled={addOrderMutation.isPending}
                type="submit"
                className="mt-6 w-full"
              >
                {addOrderMutation.isPending ? "Submitting..." : "Checkout"}
              </Button>
            </form>
          </SheetHeader>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default OrderCheckout;
