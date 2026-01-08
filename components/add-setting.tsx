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
import { SettingCategory } from "@/generated/prisma/enums";

const formSchema = z.object({
  key: z.string().min(1, "Key must be at least 2 characters!"),
  value: z.string().min(1, "Value must be at least 2 characters!"),
  type: z.string().min(1, "Type must be at least 2 characters!"),
  category: z.enum(["general", "payment", "file", "database", "other"]),
});

const AddSetting = ({ category }: { category: SettingCategory }) => {
  const [open, setOpen] = useState(false);
  const addSettingMutation = useCreateExpense();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as Resolver<z.infer<typeof formSchema>>,
    defaultValues: {
      name: "",
      amount: 0,
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = async (data) => {
    addSettingMutation.mutate(
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
          Add {category} Setting
        </Button>
      </SheetTrigger>
      <SheetContent>
        <ScrollArea className="h-screen">
          {addSettingMutation.isError && (
            <div className="my-2">
              <Alert variant={"destructive"}>
                <AlertCircleIcon />
                <AlertTitle>{addSettingMutation.error.message}</AlertTitle>
              </Alert>
            </div>
          )}
          <SheetHeader>
            <SheetTitle className="mb-4">Add {category} Setting</SheetTitle>
            <SheetDescription>Add a new setting to the system</SheetDescription>
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
              disabled={addSettingMutation.isPending}
              type="submit"
              className="mt-6 w-full"
            >
              {addSettingMutation.isPending ? "Adding..." : "Add Expense"}
            </Button>
          </form>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default AddSetting;
