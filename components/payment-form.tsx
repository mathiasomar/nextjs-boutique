"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { useState } from "react";
import z from "zod";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Resolver } from "react-hook-form";
import toast from "react-hot-toast";
import { Button } from "./ui/button";
import { AlertCircleIcon, Wallet } from "lucide-react";
import { Alert, AlertTitle } from "./ui/alert";
import { Field, FieldError, FieldGroup, FieldLabel } from "./ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ScrollArea } from "./ui/scroll-area";
// import { useOrder } from "@/hooks/use-order";
import { Input } from "./ui/input";
import { useMakePayment, useOrder } from "@/hooks/use-order";

const formSchema = z.object({
  method: z.enum(["CASH", "MPESA"]),
  //   phone: z
  //     .string()
  //     .regex(/^[0-9]{10}$/, { message: "Invalid phone number!" })
  //     .optional(),
  amount: z.coerce.number().min(0, "Amount must be greater than 0"),
  paid: z.coerce
    .number()
    .min(0, "Paid amount must be greater than 0")
    .optional(),
});

const PaymentForm = ({ orderId }: { orderId: string }) => {
  const [open, setOpen] = useState(false);
  const paymentMutation = useMakePayment();

  const { data, isLoading } = useOrder(orderId);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as Resolver<z.infer<typeof formSchema>>,
    defaultValues: {
      method: "CASH",
      //   phone: "",
      amount: 0,
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = async (data) => {
    paymentMutation.mutate(
      {
        orderId,
        method: data.method,
        amount: data.amount,
      },
      {
        onSuccess: () => {
          setOpen(false);
          form.reset();
          toast.success("Payment added successfully!");
        },
        onError: (error: Error) => {
          toast.error(`Payment failed: ${error.message}`);
        },
      }
    );
  };
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size={"icon"} variant={"outline"}>
          <Wallet />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <ScrollArea className="h-screen">
          {paymentMutation.isError && (
            <div className="my-2">
              <Alert variant={"destructive"}>
                <AlertCircleIcon />
                <AlertTitle>{paymentMutation.error.message}</AlertTitle>
              </Alert>
            </div>
          )}
          <SheetHeader>
            <SheetTitle className="mb-4">Make Payment</SheetTitle>
            <SheetDescription>
              Payment can be made through CASH or MPESA
            </SheetDescription>
          </SheetHeader>
          <div className="p-4 flex flex-col gap-2">
            <span>
              Total Amount: Ksh{" "}
              {isLoading ? 0 : data?.order?.total.toFixed(2) || 0}
            </span>
            <span>
              Paid Amount: Ksh{" "}
              {isLoading ? 0 : data?.order?.paid.toFixed(2) || 0}
            </span>
            <span>
              Balance: Ksh{" "}
              {isLoading ? 0 : data?.order?.balance.toFixed(2) || 0}
            </span>
          </div>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-4">
            <FieldGroup>
              <Controller
                name="method"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Payment Method</FieldLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder="Select Payment Method" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="CASH">Cash</SelectItem>
                        <SelectItem value="MPESA">Mpesa</SelectItem>
                      </SelectContent>
                    </Select>

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              {/* <Controller
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
              /> */}
              <Controller
                name="amount"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="amount">Amount</FieldLabel>
                    <Input
                      {...field}
                      id="amount"
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
              disabled={paymentMutation.isPending}
              type="submit"
              className="mt-6 w-full"
            >
              {paymentMutation.isPending ? "Adding..." : "Add Payment"}
            </Button>
          </form>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default PaymentForm;
