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
import { Controller, useForm } from "react-hook-form";
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
import { AlertCircleIcon, Plus } from "lucide-react";
import { useState } from "react";
import { addCategory } from "@/app/actions/category";
import toast from "react-hot-toast";
import { Alert, AlertTitle } from "./ui/alert";

const formSchema = z.object({
  name: z.string().min(1, "Name must be at least 2 characters!"),
});

const AddCategory = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>();
  const [open, setOpen] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    // Do something with the form values.
    try {
      setLoading(true);
      await addCategory(data);
      setOpen(false);
      form.reset();
      toast.success("Category added successfully!");
    } catch (error) {
      setError(error as string);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <Plus />
          Add Category
        </Button>
      </SheetTrigger>
      <SheetContent>
        {error && (
          <div className="my-2">
            <Alert variant={"destructive"}>
              <AlertCircleIcon />
              <AlertTitle>{error}</AlertTitle>
            </Alert>
          </div>
        )}
        <SheetHeader>
          <SheetTitle className="mb-4">Add Category</SheetTitle>
          <SheetDescription asChild>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FieldGroup>
                <Controller
                  name="name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="name">Category Name</FieldLabel>
                      <Input
                        {...field}
                        id="name"
                        aria-invalid={fieldState.invalid}
                        autoComplete="off"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                      <FieldDescription>Enter category name</FieldDescription>
                    </Field>
                  )}
                />
              </FieldGroup>

              <Button disabled={loading} type="submit" className="mt-6 w-full">
                {loading ? "Adding..." : "Add Category"}
              </Button>
            </form>
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};

export default AddCategory;
