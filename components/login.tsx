"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { authClient } from "@/lib/auth-client";
import { Alert, AlertTitle } from "./ui/alert";
import { AlertCircleIcon } from "lucide-react";
import { useState } from "react";
import { redirect } from "next/navigation";

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required!" })
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
      message: "Invalid email address!",
    }),
  password: z.string().min(1, { message: "Password is required!" }),
});

const LoginPage = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (formData: z.infer<typeof formSchema>) => {
    // Do something with the form values.
    const { data, error } = await authClient.signIn.email(
      {
        email: formData.email,
        password: formData.password,
        callbackURL: "/dashboard",
      },
      {
        onRequest: (ctx) => {
          setLoading(true);
        },
        onSuccess: (ctx) => {
          redirect("/dashboard");
        },
        onError: (ctx) => {
          setError(ctx.error.message);
          setLoading(false);
        },
      }
    );
  };
  return (
    <div className="w-1/3">
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col items-center justify-between gap-2">
            <h1 className="text-3xl font-bold">WELCOME BACK!</h1>
            <p>Login to your account</p>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="my-2">
              <Alert variant={"destructive"}>
                <AlertCircleIcon />
                <AlertTitle>{error}</AlertTitle>
              </Alert>
            </div>
          )}
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
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
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input
                      {...field}
                      id="password"
                      type="password"
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
            <Button type="submit" className="mt-4 w-full" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
