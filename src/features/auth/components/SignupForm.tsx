"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Loader2 } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useAuth } from "@/providers/auth-provider";
import { appConfig } from "@/config/app.config";
import { toast } from "sonner";

const signupSchema = z
  .object({
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

export function SignupForm() {
  const { signup } = useAuth();
  const router = useRouter();
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: SignupFormValues) => {
    try {
      const result = await signup(values.email, values.password, values.fullName);
      if (result.needsEmailConfirmation) {
        toast.success("Check your email to confirm your account");
        router.push("/login");
        return;
      }
      toast.success("Account created");
      router.push("/onboarding");
    } catch {
      toast.error("Could not create account. Try a different email.");
    }
  };

  return (
    <div className="relative flex min-h-screen bg-background">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>
      <div className="hidden w-1/2 flex-col justify-between bg-primary p-12 text-primary-foreground lg:flex">
        <div className="flex items-center gap-3">
          <Shield className="size-8" />
          <span className="text-xl font-semibold">{appConfig.name}</span>
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold leading-tight">
            Join VDARVS
          </h1>
          <p className="text-lg text-primary-foreground/80">
            Create an account, then apply as a citizen or request staff access
            for your village.
          </p>
        </div>
        <p className="text-sm text-primary-foreground/60">
          Kingdom of Lesotho Local Government
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-background p-8">
        <Card className="w-full max-w-md border shadow-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Create account</CardTitle>
            <CardDescription>
              Sign up to access the Village Digital Administrative Records system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input id="fullName" {...form.register("fullName")} />
                {form.formState.errors.fullName && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.fullName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  {...form.register("password")}
                />
                {form.formState.errors.password && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  {...form.register("confirmPassword")}
                />
                {form.formState.errors.confirmPassword && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}
                Create account
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="underline hover:text-foreground">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
