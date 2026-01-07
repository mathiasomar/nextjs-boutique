"use client";

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
import { ScrollArea } from "./ui/scroll-area";
import { useExpense, useUpdateExpense } from "@/hooks/use-expense";
import { Input } from "./ui/input";
import { Skeleton } from "./ui/skeleton";

const formSchema = z.object({
  name: z.string().min(1, "Name must be at least 2 characters!"),
  amount: z.coerce.number().min(0, "Amount must be greater than 0"),
});

const EditExpense = ({ expenseId }: { expenseId: string }) => {
  const [open, setOpen] = useState(false);
  const updateExpenseMutation = useUpdateExpense();

  const { isLoading, refetch } = useExpense(expenseId, { enabled: false });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as Resolver<z.infer<typeof formSchema>>,
    defaultValues: {
      name: "",
      amount: 0,
    },
  });

  // Reset form with fetched data when sheet opens
  useEffect(() => {
    if (open) {
      // Fetch data when sheet opens
      refetch()
        .then((result) => {
          if (result.data?.expense) {
            // Reset form with fetched data
            form.reset({
              name: result.data.expense.expense,
              amount: Number(result.data.expense.amount),
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
        name: "",
        amount: 0,
      });
    }
  }, [open, form, refetch]);

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = async (data) => {
    try {
      updateExpenseMutation.mutateAsync(
        { id: expenseId, expense: data.name, amount: data.amount },
        {
          onSuccess: () => {
            setOpen(false);
            toast.success("Expense updated successfully!");
            refetch();
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
            <SheetTitle className="mb-4">Edit Expense</SheetTitle>
            <SheetDescription>Edit expense details</SheetDescription>
          </SheetHeader>
          {isLoading ? (
            // Loading skeleton
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
                        disabled={isLoading || updateExpenseMutation.isPending}
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
                        placeholder="0.00"
                        disabled={isLoading || updateExpenseMutation.isPending}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
              <Button
                disabled={isLoading || updateExpenseMutation.isPending}
                type="submit"
                className="mt-6 w-full"
              >
                {updateExpenseMutation.isPending
                  ? "Updating..."
                  : "Update Expense"}
              </Button>
            </form>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default EditExpense;
