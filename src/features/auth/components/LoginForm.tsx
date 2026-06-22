"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/providers/auth-provider";
import { USER_ROLES } from "@/constants/roles";
import type { UserRole } from "@/types/common.types";
import { MOCK_USERS } from "@/lib/mock-data";
import { appConfig } from "@/config/app.config";
import { toast } from "sonner";

export function LoginForm() {
  const [email, setEmail] = useState("chief.masianokeng@vdarvs.gov.ls");
  const [role, setRole] = useState<UserRole>("village_chief");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, role);
      toast.success(`Signed in as ${USER_ROLES[role].label}`);
      router.push("/dashboard");
    } catch {
      toast.error("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (userEmail: string) => {
    setEmail(userEmail);
    const user = MOCK_USERS.find((u) => u.email === userEmail);
    if (user) setRole(user.role);
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-primary p-12 text-primary-foreground lg:flex">
        <div className="flex items-center gap-3">
          <Shield className="size-8" />
          <span className="text-xl font-semibold">{appConfig.name}</span>
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold leading-tight">
            Village Digital Administration for Lesotho
          </h1>
          <p className="text-lg text-primary-foreground/80">
            Digitize citizen registration, residency verification, land records,
            and dispute resolution through Village Chiefs.
          </p>
        </div>
        <p className="text-sm text-primary-foreground/60">
          Kingdom of Lesotho Local Government
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center p-8">
        <Card className="w-full max-w-md border-0 shadow-none lg:border lg:shadow-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Sign in</CardTitle>
            <CardDescription>
              Prototype demo: select a role to explore the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role (demo)</Label>
                <Select
                  value={role}
                  onValueChange={(v) => setRole(v as UserRole)}
                >
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(USER_ROLES) as UserRole[]).map((r) => (
                      <SelectItem key={r} value={r}>
                        {USER_ROLES[r].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                Sign in
              </Button>
            </form>

            <div className="mt-6 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Quick demo accounts
              </p>
              <div className="flex flex-wrap gap-2">
                {MOCK_USERS.map((user) => (
                  <Button
                    key={user.id}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => quickLogin(user.email)}
                  >
                    {USER_ROLES[user.role].label}
                  </Button>
                ))}
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              <Link href="/" className="underline hover:text-foreground">
                Back to home
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
