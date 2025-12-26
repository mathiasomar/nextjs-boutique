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
import toast from "react-hot-toast";
import { Alert, AlertTitle } from "./ui/alert";
import { useCreatecategory } from "@/hooks/use-product";

const formSchema = z.object({
  name: z.string().min(1, "Name must be at least 2 characters!"),
});

const AddCategory = () => {
  const addCategoryMutation = useCreatecategory();
  const [open, setOpen] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    // Do something with the form values.
    // try {
    //   setLoading(true);
    //   await addCategory(data);
    //   setOpen(false);
    //   form.reset();
    //   toast.success("Category added successfully!");
    // } catch (error) {
    //   setError(error as string);
    //   setLoading(false);
    // } finally {
    //   setLoading(false);
    // }
    addCategoryMutation.mutateAsync(data, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
        toast.success("Category added successfully!");
      },
    });
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
        {addCategoryMutation.isError && (
          <div className="my-2">
            <Alert variant={"destructive"}>
              <AlertCircleIcon />
              <AlertTitle>{addCategoryMutation.error as string}</AlertTitle>
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

              <Button
                disabled={addCategoryMutation.isPending}
                type="submit"
                className="mt-6 w-full"
              >
                {addCategoryMutation.isPending ? "Adding..." : "Add Category"}
              </Button>
            </form>
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};

export default AddCategory;
