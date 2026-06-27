"use client";

import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { DISTRICTS, COMMUNITY_COUNCILS, VILLAGES } from "@/constants/lesotho";
import { useCreateCitizen, useChiefs } from "@/features/citizens/hooks/useCitizens";
import { chiefService } from "@/lib/services/chief.service";
import { useAuth } from "@/providers/auth-provider";
import { toast } from "sonner";

const citizenSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  nationalId: z.string().min(5, "National ID is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female", "other"]),
  phone: z.string().min(8, "Phone number is required"),
  email: z.string().email().optional().or(z.literal("")),
  village: z.string().min(1, "Village is required"),
  communityCouncil: z.string().optional(),
  district: z.string().min(1, "District is required"),
  poBox: z.string().optional(),
});

type CitizenFormValues = z.infer<typeof citizenSchema>;

export function CitizenRegistrationForm() {
  const router = useRouter();
  const { user } = useAuth();
  const createCitizen = useCreateCitizen();
  const { data: chiefs } = useChiefs();
  const form = useForm<CitizenFormValues>({
    resolver: zodResolver(citizenSchema),
    defaultValues: {
      gender: "male",
      district: "Maseru",
      communityCouncil: "Maseru Central",
      village: "Masianokeng",
    },
  });

  const selectedDistrict = form.watch("district") as keyof typeof COMMUNITY_COUNCILS;
  const selectedCouncil = form.watch("communityCouncil");
  const villages = selectedCouncil ? VILLAGES[selectedCouncil] ?? [] : [];

  const onSubmit = (values: CitizenFormValues) => {
    if (!user) {
      toast.error("You must be signed in to register a citizen");
      return;
    }

    const chief = chiefService.resolveChiefForLocation(
      chiefs ?? [],
      values.village,
      values.district,
    );
    if (!chief) {
      toast.error("No village chief is available to assign this citizen to");
      return;
    }

    createCitizen.mutate(
      {
        data: {
          nationalId: values.nationalId,
          firstName: values.firstName,
          lastName: values.lastName,
          dateOfBirth: values.dateOfBirth,
          gender: values.gender,
          phone: values.phone,
          email: values.email || undefined,
          address: {
            village: values.village,
            communityCouncil: values.communityCouncil || undefined,
            district: values.district,
            poBox: values.poBox || undefined,
          },
          chiefId: chief.id,
          verificationStatus: "pending",
          status: "pending",
        },
        actor: { userId: user.id, userName: user.fullName },
      },
      {
        onSuccess: () => router.push("/citizens"),
      },
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/citizens">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <PageHeader
          title="Register Citizen"
          description="Village-based address registration for Lesotho citizens"
        />
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Citizen Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name</label>
                <Input {...form.register("firstName")} />
                {form.formState.errors.firstName && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.firstName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                <Input {...form.register("lastName")} />
                {form.formState.errors.lastName && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">National ID</label>
                <Input {...form.register("nationalId")} placeholder="LS-YYYY-XXXXXX" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date of Birth</label>
                <Input type="date" {...form.register("dateOfBirth")} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Gender</label>
                <Select
                  value={form.watch("gender")}
                  onValueChange={(v) =>
                    form.setValue("gender", v as CitizenFormValues["gender"])
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input {...form.register("phone")} placeholder="+266 5XXX XXXX" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email (optional)</label>
              <Input type="email" {...form.register("email")} />
            </div>

            <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
              <p className="text-sm font-medium">Village Address</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">District</label>
                  <Select
                    value={form.watch("district")}
                    onValueChange={(v) => {
                      form.setValue("district", v);
                      const councils = COMMUNITY_COUNCILS[v as keyof typeof COMMUNITY_COUNCILS];
                      if (councils?.[0]) form.setValue("communityCouncil", councils[0]);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DISTRICTS.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Community Council</label>
                  <Select
                    value={form.watch("communityCouncil")}
                    onValueChange={(v) => form.setValue("communityCouncil", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(COMMUNITY_COUNCILS[selectedDistrict] ?? []).map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Village</label>
                  <Select
                    value={form.watch("village")}
                    onValueChange={(v) => form.setValue("village", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {villages.map((v) => (
                        <SelectItem key={v} value={v}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">P.O. Box (optional)</label>
                  <Input {...form.register("poBox")} placeholder="P.O. Box 1234" />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={createCitizen.isPending}>
                {createCitizen.isPending && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}
                Register Citizen
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/citizens">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
