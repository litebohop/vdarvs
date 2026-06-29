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
import { useRegisterAnimal } from "@/features/animals/hooks/useAnimals";
import { useCitizens } from "@/features/citizens/hooks/useCitizens";
import { useAuth } from "@/providers/auth-provider";
import { toast } from "sonner";

const schema = z.object({
  ownerId: z.string().min(1, "Owner is required"),
  species: z.enum(["cattle", "sheep", "goat", "horse", "donkey", "poultry"]),
  breed: z.string().min(2, "Breed is required"),
  tagNumber: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function AnimalRegisterForm() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: citizensPage } = useCitizens({ pageSize: 100 });
  const registerAnimal = useRegisterAnimal();
  const citizens = citizensPage?.data ?? [];

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { species: "cattle" },
  });

  const ownerId = form.watch("ownerId");
  const owner = citizens.find((c) => c.id === ownerId);

  const onSubmit = (values: FormValues) => {
    if (!user || !owner) {
      toast.error("Select a valid owner");
      return;
    }

    registerAnimal.mutate(
      {
        data: {
          tagNumber: values.tagNumber ?? "",
          species: values.species,
          breed: values.breed,
          ownerId: owner.id,
          ownerName: `${owner.firstName} ${owner.lastName}`,
          village: owner.address.village,
          district: owner.address.district,
          status: "pending",
          notes: values.notes,
        },
        actor: { userId: user.id, userName: user.fullName },
      },
      { onSuccess: () => router.push("/animals") },
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Register animal" description="Add livestock to the village registry">
        <Button variant="outline" asChild>
          <Link href="/animals">
            <ArrowLeft className="mr-2 size-4" />
            Back
          </Link>
        </Button>
      </PageHeader>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Animal details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Owner</label>
              <Select
                value={ownerId}
                onValueChange={(v) => form.setValue("ownerId", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select citizen owner" />
                </SelectTrigger>
                <SelectContent>
                  {citizens.map((citizen) => (
                    <SelectItem key={citizen.id} value={citizen.id}>
                      {citizen.firstName} {citizen.lastName} · {citizen.address.village}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Species</label>
                <Select
                  value={form.watch("species")}
                  onValueChange={(v) =>
                    form.setValue("species", v as FormValues["species"])
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cattle">Cattle</SelectItem>
                    <SelectItem value="sheep">Sheep</SelectItem>
                    <SelectItem value="goat">Goat</SelectItem>
                    <SelectItem value="horse">Horse</SelectItem>
                    <SelectItem value="donkey">Donkey</SelectItem>
                    <SelectItem value="poultry">Poultry</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Breed</label>
                <Input {...form.register("breed")} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tag number (optional)</label>
              <Input placeholder="Auto-generated if left blank" {...form.register("tagNumber")} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea rows={3} {...form.register("notes")} />
            </div>
            <Button type="submit" disabled={registerAnimal.isPending}>
              {registerAnimal.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Register animal
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
