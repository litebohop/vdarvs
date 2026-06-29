"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DOCUMENT_TYPES } from "@/constants/documents";
import { useRequestDocument } from "@/features/documents/hooks/useDocuments";
import {
  useCitizens,
  useLinkedCitizen,
} from "@/features/citizens/hooks/useCitizens";
import { useAuth } from "@/providers/auth-provider";
import { toast } from "sonner";

const schema = z.object({
  type: z.enum([
    "residency_certificate",
    "birth_record",
    "land_title",
    "animal_permit",
    "chief_endorsement",
    "dispute_ruling",
  ]),
  title: z.string().min(3, "Title is required"),
  citizenId: z.string().min(1, "Citizen is required"),
});

type FormValues = z.infer<typeof schema>;

export function DocumentRequestDialog() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const { user } = useAuth();
  const { data: linkedCitizen } = useLinkedCitizen();
  const { data: citizensPage } = useCitizens({ pageSize: 100 });
  const requestDocument = useRequestDocument();
  const isCitizen = user?.role === "citizen";

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "residency_certificate",
      title: "",
      citizenId: "",
    },
  });

  useEffect(() => {
    if (isCitizen && linkedCitizen) {
      form.setValue("citizenId", linkedCitizen.id);
    }
  }, [isCitizen, linkedCitizen, form]);

  const citizens = citizensPage?.data ?? [];
  const selectedCitizenId = form.watch("citizenId");
  const selectedCitizen =
    citizens.find((c) => c.id === selectedCitizenId) ?? linkedCitizen ?? null;

  const onSubmit = (values: FormValues) => {
    if (!user || !selectedCitizen) {
      toast.error("Select a valid citizen record");
      return;
    }

    requestDocument.mutate(
      {
        input: {
          type: values.type,
          title: values.title,
          citizenId: selectedCitizen.id,
          village: selectedCitizen.address.village,
          district: selectedCitizen.address.district,
          chiefId: selectedCitizen.chiefId,
          file: file ?? undefined,
        },
        actor: { userId: user.id, userName: user.fullName },
      },
      {
        onSuccess: () => {
          setOpen(false);
          form.reset();
          setFile(null);
        },
      },
    );
  };

  if (isCitizen && !linkedCitizen) {
    return (
      <Button asChild>
        <Link href="/onboarding">Complete registration to request documents</Link>
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 size-4" />
          Request document
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Request official document</DialogTitle>
          <DialogDescription>
            Submit a certificate, permit, or endorsement request. You can attach
            supporting files (PDF or images).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Document type</label>
            <Select
              value={form.watch("type")}
              onValueChange={(v) =>
                form.setValue("type", v as FormValues["type"])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              placeholder="e.g. Residency Certificate for Masianokeng"
              {...form.register("title")}
            />
          </div>

          {!isCitizen && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Citizen</label>
              <Select
                value={form.watch("citizenId")}
                onValueChange={(v) => form.setValue("citizenId", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select citizen" />
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
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Supporting file (optional)</label>
            <Input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={requestDocument.isPending}
          >
            {requestDocument.isPending && (
              <Loader2 className="mr-2 size-4 animate-spin" />
            )}
            Submit request
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
