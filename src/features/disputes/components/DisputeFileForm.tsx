"use client";

import { useEffect } from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Controller, useForm, type FieldErrors } from "react-hook-form";
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
import { CitizenSearchSelect } from "@/components/shared/citizen-search-select";
import { PageHeader } from "@/components/shared/page-header";
import { useFileDispute } from "@/features/disputes/hooks/useDisputes";
import {
  useCitizens,
  useLinkedCitizen,
} from "@/features/citizens/hooks/useCitizens";
import { useAuth } from "@/providers/auth-provider";
import { toast } from "sonner";

const schema = z.object({
  complainantId: z.string().min(1, "Complainant is required"),
  title: z.string().min(5, "Title is required"),
  description: z.string().min(20, "Please describe the dispute"),
  respondentId: z.string().min(1, "Select a respondent"),
  category: z.enum(["land", "livestock", "boundary", "family", "other"]),
});

type FormValues = z.infer<typeof schema>;

export function DisputeFileForm() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: linkedCitizen } = useLinkedCitizen();
  const { data: citizensPage } = useCitizens({ pageSize: 100 });
  const fileDispute = useFileDispute();
  const isCitizen = user?.role === "citizen";
  const citizens = citizensPage?.data ?? [];

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      category: "boundary",
      complainantId: "",
      respondentId: "",
      title: "",
      description: "",
    },
  });

  const complainantId = form.watch("complainantId");
  const complainant =
    citizens.find((c) => c.id === complainantId) ?? linkedCitizen ?? null;

  const respondentOptions = citizens.filter((c) => c.id !== complainant?.id);

  useEffect(() => {
    if (linkedCitizen?.id) {
      form.setValue("complainantId", linkedCitizen.id, { shouldValidate: true });
    }
  }, [linkedCitizen?.id, form]);

  useEffect(() => {
    const current = form.getValues("respondentId");
    if (current && current === complainant?.id) {
      form.setValue("respondentId", "", { shouldValidate: true });
    }
  }, [complainant?.id, form]);

  const onInvalid = (errors: FieldErrors<FormValues>) => {
    const message =
      errors.complainantId?.message ??
      errors.respondentId?.message ??
      errors.title?.message ??
      errors.description?.message ??
      "Please fix the form errors";
    toast.error(String(message));
  };

  const onSubmit = (values: FormValues) => {
    const resolvedComplainant = isCitizen
      ? linkedCitizen
      : citizens.find((c) => c.id === values.complainantId);

    if (!user || !resolvedComplainant) {
      toast.error("Select a valid complainant");
      return;
    }

    const respondent = respondentOptions.find((c) => c.id === values.respondentId);
    if (!respondent) {
      toast.error("Select a valid respondent");
      return;
    }

    fileDispute.mutate(
      {
        data: {
          title: values.title,
          description: values.description,
          complainantId: resolvedComplainant.id,
          complainantName: `${resolvedComplainant.firstName} ${resolvedComplainant.lastName}`,
          respondentName: `${respondent.firstName} ${respondent.lastName}`,
          village: resolvedComplainant.address.village,
          district: resolvedComplainant.address.district,
          chiefId: resolvedComplainant.chiefId,
          category: values.category,
          status: "pending",
        },
        actor: { userId: user.id, userName: user.fullName },
      },
      { onSuccess: () => router.push("/disputes") },
    );
  };

  if (isCitizen && !linkedCitizen) {
    return (
      <div className="space-y-6">
        <PageHeader title="File a dispute" description="Village dispute mediation" />
        <Card>
          <CardHeader>
            <CardTitle>Citizen profile required</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/onboarding">Complete registration</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="File a dispute" description="Submit a case for chief mediation">
        <Button variant="outline" asChild>
          <Link href="/disputes">
            <ArrowLeft className="mr-2 size-4" />
            Back
          </Link>
        </Button>
      </PageHeader>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Dispute details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-4">
            {!isCitizen && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Complainant</label>
                <Select
                  value={complainantId}
                  onValueChange={(v) =>
                    form.setValue("complainantId", v, { shouldValidate: true })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select citizen" />
                  </SelectTrigger>
                  <SelectContent>
                    {citizens.map((citizen) => (
                      <SelectItem key={citizen.id} value={citizen.id}>
                        {citizen.firstName} {citizen.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.complainantId && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.complainantId.message}
                  </p>
                )}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input {...form.register("title")} />
              {form.formState.errors.title && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select
                value={form.watch("category")}
                onValueChange={(v) =>
                  form.setValue("category", v as FormValues["category"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="boundary">Boundary</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                  <SelectItem value="livestock">Livestock</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Respondent</label>
              {respondentOptions.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No other citizens are registered in the system yet.
                </p>
              ) : (
                <Controller
                  name="respondentId"
                  control={form.control}
                  render={({ field }) => (
                    <CitizenSearchSelect
                      citizens={respondentOptions}
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                      placeholder="Select citizen in the system"
                      searchPlaceholder="Search citizens..."
                    />
                  )}
                />
              )}
              {form.formState.errors.respondentId && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.respondentId.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea rows={5} {...form.register("description")} />
              {form.formState.errors.description && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              disabled={fileDispute.isPending || respondentOptions.length === 0}
            >
              {fileDispute.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Submit dispute
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
