"use client";

import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { useRegisterLand } from "@/features/land/hooks/useLand";
import { useCitizens, useChiefs } from "@/features/citizens/hooks/useCitizens";
import { chiefService } from "@/lib/services/chief.service";
import { useAuth } from "@/providers/auth-provider";
import { toast } from "sonner";

const schema = z.object({
  ownerId: z.string().min(1, "Owner is required"),
  village: z.string().min(1),
  communityCouncil: z.string().min(1),
  district: z.string().min(1),
  landType: z.enum(["residential", "agricultural", "communal", "grazing"]),
  sizeHectares: z.number().positive(),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function LandRegisterForm() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: citizensPage } = useCitizens({ pageSize: 100 });
  const { data: chiefs } = useChiefs();
  const registerLand = useRegisterLand();
  const citizens = citizensPage?.data ?? [];

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      district: "Maseru",
      communityCouncil: "Maseru Central",
      village: "Masianokeng",
      landType: "agricultural",
      sizeHectares: 1,
    },
  });

  const selectedCouncil = form.watch("communityCouncil");
  const villages = selectedCouncil ? VILLAGES[selectedCouncil] ?? [] : [];
  const ownerId = form.watch("ownerId");
  const owner = citizens.find((c) => c.id === ownerId);

  const onSubmit = (values: FormValues) => {
    if (!user || !owner) {
      toast.error("Select a valid owner");
      return;
    }

    const chief = chiefService.resolveChiefForLocation(
      chiefs ?? [],
      values.village,
      values.district,
    );
    if (!chief) {
      toast.error("No village chief is available for this location");
      return;
    }

    registerLand.mutate(
      {
        data: {
          parcelNumber: "",
          ownerId: owner.id,
          ownerName: `${owner.firstName} ${owner.lastName}`,
          village: values.village,
          communityCouncil: values.communityCouncil,
          district: values.district,
          landType: values.landType,
          sizeHectares: values.sizeHectares,
          chiefId: chief.id,
          status: "pending",
          description: values.description,
        },
        actor: { userId: user.id, userName: user.fullName },
      },
      { onSuccess: () => router.push("/land") },
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Register land parcel" description="Add a land record to the registry">
        <Button variant="outline" asChild>
          <Link href="/land">
            <ArrowLeft className="mr-2 size-4" />
            Back
          </Link>
        </Button>
      </PageHeader>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Land details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Owner</label>
              <Select value={ownerId} onValueChange={(v) => form.setValue("ownerId", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select citizen owner" />
                </SelectTrigger>
                <SelectContent>
                  {citizens.map((citizen) => (
                    <SelectItem key={citizen.id} value={citizen.id}>
                      {citizen.firstName} {citizen.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">District</label>
                <Select
                  value={form.watch("district")}
                  onValueChange={(v) => form.setValue("district", v)}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DISTRICTS.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Community council</label>
                <Select
                  value={selectedCouncil}
                  onValueChange={(v) => form.setValue("communityCouncil", v)}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(COMMUNITY_COUNCILS[form.watch("district") as keyof typeof COMMUNITY_COUNCILS] ?? []).map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Village</label>
              <Select value={form.watch("village")} onValueChange={(v) => form.setValue("village", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {villages.map((v) => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Land type</label>
                <Select
                  value={form.watch("landType")}
                  onValueChange={(v) => form.setValue("landType", v as FormValues["landType"])}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residential">Residential</SelectItem>
                    <SelectItem value="agricultural">Agricultural</SelectItem>
                    <SelectItem value="communal">Communal</SelectItem>
                    <SelectItem value="grazing">Grazing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Size (hectares)</label>
                <Input
                  type="number"
                  step="0.1"
                  {...form.register("sizeHectares", { valueAsNumber: true })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea rows={3} {...form.register("description")} />
            </div>
            <Button type="submit" disabled={registerLand.isPending}>
              {registerLand.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Register land
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
