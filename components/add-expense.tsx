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
import { AlertCircleIcon, Plus } from "lucide-react";
import { Alert, AlertTitle } from "./ui/alert";
import { Field, FieldError, FieldGroup, FieldLabel } from "./ui/field";
import { ScrollArea } from "./ui/scroll-area";
// import { useOrder } from "@/hooks/use-order";
import { Input } from "./ui/input";
import { useCreateExpense } from "@/hooks/use-expense";

const formSchema = z.object({
  name: z.string().min(1, "Name must be at least 2 characters!"),
  amount: z.coerce.number().min(0, "Amount must be greater than 0"),
});

const AddExpense = () => {
  const [open, setOpen] = useState(false);
  const addExpenseMutation = useCreateExpense();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as Resolver<z.infer<typeof formSchema>>,
    defaultValues: {
      name: "",
      amount: 0,
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = async (data) => {
    addExpenseMutation.mutate(
      {
        expense: data.name,
        amount: data.amount,
      },
      {
        onSuccess: () => {
          setOpen(false);
          form.reset();
          toast.success("Expense added successfully!");
        },
        onError: (error) => {
          toast.error(
            `Expense failed: ${error instanceof Error ? error.message : ""}`
          );
        },
      }
    );
  };
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <Plus />
          Add Expense
        </Button>
      </SheetTrigger>
      <SheetContent>
        <ScrollArea className="h-screen">
          {addExpenseMutation.isError && (
            <div className="my-2">
              <Alert variant={"destructive"}>
                <AlertCircleIcon />
                <AlertTitle>{addExpenseMutation.error.message}</AlertTitle>
              </Alert>
            </div>
          )}
          <SheetHeader>
            <SheetTitle className="mb-4">Add Expense</SheetTitle>
            <SheetDescription>
              Add a new expense to track your revenue
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-4">
            <FieldGroup>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="name">Expense</FieldLabel>
                    <Input
                      {...field}
                      id="name"
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
              disabled={addExpenseMutation.isPending}
              type="submit"
              className="mt-6 w-full"
            >
              {addExpenseMutation.isPending ? "Adding..." : "Add Expense"}
            </Button>
          </form>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default AddExpense;
