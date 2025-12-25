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
import { Field, FieldError, FieldGroup, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
// import { Select, SelectContent, SelectItem, SelectTrigger } from "./ui/select";
// import { SelectValue } from "@radix-ui/react-select";
import { useState } from "react";
import { Alert, AlertTitle } from "./ui/alert";
import { AlertCircleIcon, Edit } from "lucide-react";
import toast from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useUpdateUser, useUser } from "@/hooks/use-user";

const formSchema = z.object({
  name: z
    .string()
    .min(2, "Full name must be at least 2 characters!")
    .max(50, "Full name must be atmost 50 characters"),
  role: z.enum(["STAFF", "ADMIN"]),
});

interface EditUserSheetProps {
  userId: string;
}

const EditUser = ({ userId }: EditUserSheetProps) => {
  const [open, setOpen] = useState(false);
  const updateUserMutation = useUpdateUser();

  const { data: user, isLoading } = useUser(userId as string);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: isLoading ? "" : (user as { name: string }).name,
      role: isLoading ? "STAFF" : (user as { role: "STAFF" | "ADMIN" }).role,
    },
  });

  const onSubmit = async (formData: z.infer<typeof formSchema>) => {
    // Do something with the form values.
    // try {
    //   setupdateLoading(true);
    //   await updateUser(userId, formData);
    //   toast.success("User updated successfully!");
    //   setOpen(false);
    // } catch (error) {
    //   setUpdateError(error as string);
    //   setupdateLoading(false);
    // } finally {
    //   setupdateLoading(false);
    // }
    try {
      updateUserMutation.mutateAsync(
        { id: userId, ...formData },
        {
          onSuccess: () => {
            toast.success("User updated successfully!");
            setOpen(false);
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
        <Button>
          <Edit /> Edit User
        </Button>
      </SheetTrigger>
      <SheetContent>
        {(updateUserMutation.error as string) && (
          <div className="my-2">
            <Alert variant={"destructive"}>
              <AlertCircleIcon />
              <AlertTitle>{String(updateUserMutation.error)}</AlertTitle>
            </Alert>
          </div>
        )}
        <SheetHeader>
          <SheetTitle className="mb-4">Add User</SheetTitle>
          <SheetDescription asChild>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FieldGroup>
                <Controller
                  name="name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="name">Full Name</FieldLabel>
                      <Input
                        {...field}
                        id="name"
                        aria-invalid={fieldState.invalid}
                        placeholder="Enter Full Name"
                        autoComplete="off"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="role"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Role</FieldLabel>

                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger aria-invalid={fieldState.invalid}>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                          <SelectItem value="STAFF">Staff</SelectItem>
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
                disabled={updateUserMutation.isPending}
                type="submit"
                className="mt-6 w-full"
              >
                {updateUserMutation.isPending ? "Updating..." : "Update User"}
              </Button>
            </form>
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};

export default EditUser;
