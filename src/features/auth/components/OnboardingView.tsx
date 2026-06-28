"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { DISTRICTS, COMMUNITY_COUNCILS, VILLAGES } from "@/constants/lesotho";
import { USER_ROLES } from "@/constants/roles";
import { useChiefs } from "@/features/citizens/hooks/useCitizens";
import {
  useApplyAsCitizen,
  useLatestRoleRequest,
  useSubmitRoleRequest,
} from "@/features/auth/hooks/useOnboarding";
import { chiefService } from "@/lib/services/chief.service";
import { useAuth } from "@/providers/auth-provider";
import type { UserRole } from "@/types/common.types";
import { toast } from "sonner";

const citizenSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  nationalId: z.string().min(5, "National ID is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female", "other"]),
  phone: z.string().min(8, "Phone number is required"),
  village: z.string().min(1, "Village is required"),
  communityCouncil: z.string().optional(),
  district: z.string().min(1, "District is required"),
});

const roleRequestSchema = z.object({
  requestedRole: z.enum(["village_staff", "village_chief", "district_officer"]),
  reason: z.string().min(20, "Please explain why you need this access"),
  village: z.string().optional(),
  district: z.string().optional(),
});

type CitizenFormValues = z.infer<typeof citizenSchema>;
type RoleRequestFormValues = z.infer<typeof roleRequestSchema>;

const REQUESTABLE_ROLES: UserRole[] = [
  "village_staff",
  "village_chief",
  "district_officer",
];

export function OnboardingView() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { data: chiefs } = useChiefs();
  const { data: latestRoleRequest } = useLatestRoleRequest(user?.id);
  const applyAsCitizen = useApplyAsCitizen();
  const submitRoleRequest = useSubmitRoleRequest();

  const citizenForm = useForm<CitizenFormValues>({
    resolver: zodResolver(citizenSchema),
    defaultValues: {
      gender: "male",
      district: "Maseru",
      communityCouncil: "Maseru Central",
      village: "Masianokeng",
    },
  });

  const roleForm = useForm<RoleRequestFormValues>({
    resolver: zodResolver(roleRequestSchema),
    defaultValues: {
      requestedRole: "village_staff",
      district: "Maseru",
      village: "Masianokeng",
    },
  });

  const selectedCouncil = citizenForm.watch("communityCouncil");
  const villages = selectedCouncil ? VILLAGES[selectedCouncil] ?? [] : [];

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const actor = { userId: user.id, userName: user.fullName };

  const onCitizenSubmit = (values: CitizenFormValues) => {
    const chief = chiefService.resolveChiefForLocation(
      chiefs ?? [],
      values.village,
      values.district,
    );
    if (!chief) {
      toast.error("No village chief is available to assign this citizen to");
      return;
    }

    applyAsCitizen.mutate(
      {
        data: {
          nationalId: values.nationalId,
          firstName: values.firstName,
          lastName: values.lastName,
          dateOfBirth: values.dateOfBirth,
          gender: values.gender,
          phone: values.phone,
          email: user.email,
          address: {
            village: values.village,
            communityCouncil: values.communityCouncil || undefined,
            district: values.district,
          },
          chiefId: chief.id,
          verificationStatus: "pending",
          status: "pending",
        },
        actor,
      },
      { onSuccess: () => router.push("/dashboard") },
    );
  };

  const onRoleSubmit = (values: RoleRequestFormValues) => {
    submitRoleRequest.mutate(
      {
        requestedRole: values.requestedRole,
        reason: values.reason,
        village: values.village || undefined,
        district: values.district || undefined,
        actor,
      },
      { onSuccess: () => router.push("/dashboard") },
    );
  };

  return (
    <div className="relative min-h-screen bg-background">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>
      <div className="mx-auto max-w-3xl px-6 py-12">
        <PageHeader
          title="Complete your setup"
          description="Apply as a citizen or request elevated access for village administration"
        >
          <Button variant="outline" asChild>
            <Link href="/dashboard">Skip for now</Link>
          </Button>
        </PageHeader>

        {latestRoleRequest && (
          <Card className="mt-6 border-dashed">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Latest access request</CardTitle>
              <CardDescription>
                {USER_ROLES[latestRoleRequest.requestedRole].label} · submitted{" "}
                {new Date(latestRoleRequest.requestedAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StatusBadge status={latestRoleRequest.status} />
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="citizen" className="mt-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="citizen">Apply as citizen</TabsTrigger>
            <TabsTrigger value="access">Request access</TabsTrigger>
          </TabsList>

          <TabsContent value="citizen">
            <Card>
              <CardHeader>
                <CardTitle>Citizen application</CardTitle>
                <CardDescription>
                  Register your village residency for chief verification
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={citizenForm.handleSubmit(onCitizenSubmit)}
                  className="space-y-4"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>First name</Label>
                      <Input {...citizenForm.register("firstName")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Last name</Label>
                      <Input {...citizenForm.register("lastName")} />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>National ID</Label>
                      <Input {...citizenForm.register("nationalId")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Date of birth</Label>
                      <Input type="date" {...citizenForm.register("dateOfBirth")} />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <Select
                        value={citizenForm.watch("gender")}
                        onValueChange={(v) =>
                          citizenForm.setValue("gender", v as CitizenFormValues["gender"])
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
                      <Label>Phone</Label>
                      <Input {...citizenForm.register("phone")} />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>District</Label>
                      <Select
                        value={citizenForm.watch("district")}
                        onValueChange={(v) => {
                          citizenForm.setValue("district", v);
                          const councils =
                            COMMUNITY_COUNCILS[v as keyof typeof COMMUNITY_COUNCILS];
                          if (councils?.[0]) {
                            citizenForm.setValue("communityCouncil", councils[0]);
                          }
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
                      <Label>Village</Label>
                      <Select
                        value={citizenForm.watch("village")}
                        onValueChange={(v) => citizenForm.setValue("village", v)}
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
                  </div>
                  <Button type="submit" disabled={applyAsCitizen.isPending}>
                    {applyAsCitizen.isPending && (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    )}
                    Submit citizen application
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="access">
            <Card>
              <CardHeader>
                <CardTitle>Request staff access</CardTitle>
                <CardDescription>
                  Ask an administrator to grant village staff, chief, or district
                  officer permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={roleForm.handleSubmit(onRoleSubmit)}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label>Requested role</Label>
                    <Select
                      value={roleForm.watch("requestedRole")}
                      onValueChange={(v) =>
                        roleForm.setValue(
                          "requestedRole",
                          v as RoleRequestFormValues["requestedRole"],
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {REQUESTABLE_ROLES.map((role) => (
                          <SelectItem key={role} value={role}>
                            {USER_ROLES[role].label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>District (optional)</Label>
                      <Select
                        value={roleForm.watch("district")}
                        onValueChange={(v) => roleForm.setValue("district", v)}
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
                      <Label>Village (optional)</Label>
                      <Input {...roleForm.register("village")} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Reason for request</Label>
                    <Textarea
                      rows={4}
                      placeholder="Explain your role and why you need this access..."
                      {...roleForm.register("reason")}
                    />
                    {roleForm.formState.errors.reason && (
                      <p className="text-xs text-destructive">
                        {roleForm.formState.errors.reason.message}
                      </p>
                    )}
                  </div>
                  <Button type="submit" disabled={submitRoleRequest.isPending}>
                    {submitRoleRequest.isPending && (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    )}
                    Submit access request
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
