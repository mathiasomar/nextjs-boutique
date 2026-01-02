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
import { AlertCircleIcon, Edit } from "lucide-react";
import { Alert, AlertTitle } from "./ui/alert";
import { Field, FieldError, FieldGroup, FieldLabel } from "./ui/field";
import { ScrollArea } from "./ui/scroll-area";
import { useExpense, useUpdateExpense } from "@/hooks/use-expense";
import { Input } from "./ui/input";

const formSchema = z.object({
  name: z.string().min(1, "Name must be at least 2 characters!"),
  amount: z.coerce.number().min(0, "Amount must be greater than 0"),
});

const EditExpense = ({ expenseId }: { expenseId: string }) => {
  const [open, setOpen] = useState(false);
  const updateExpenseMutation = useUpdateExpense();

  const { data, isLoading } = useExpense(expenseId);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as Resolver<z.infer<typeof formSchema>>,
    defaultValues: {
      name: isLoading ? "" : (data?.expense && data.expense.expense) || "",
      amount: isLoading ? 0 : (data?.expense && data.expense.amount) || 0,
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = async (data) => {
    try {
      updateExpenseMutation.mutateAsync(
        { id: expenseId, expense: data.name, amount: data.amount },
        {
          onSuccess: () => {
            setOpen(false);
            toast.success("Expense updated successfully!");
          },
          onError: (error) => {
            toast.error(
              error instanceof Error
                ? error.message
                : "Failed to update expense"
            );
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
        <Button variant={"outline"}>
          <Edit />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <ScrollArea className="h-screen">
          {updateExpenseMutation.isError && (
            <div className="my-2">
              <Alert variant={"destructive"}>
                <AlertCircleIcon />
                <AlertTitle>{updateExpenseMutation.error.message}</AlertTitle>
              </Alert>
            </div>
          )}
          <SheetHeader>
            <SheetTitle className="mb-4">Edit Order Status</SheetTitle>
            <SheetDescription>Edit customer details</SheetDescription>
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
              disabled={updateExpenseMutation.isPending}
              type="submit"
              className="mt-6 w-full"
            >
              {updateExpenseMutation.isPending
                ? "Updating..."
                : "Update Expense"}
            </Button>
          </form>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default EditExpense;
