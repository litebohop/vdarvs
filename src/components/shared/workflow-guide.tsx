"use client";

import type { UserRole } from "@/types/common.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const WORKFLOWS: Record<UserRole, { title: string; steps: string[] }> = {
  citizen: {
    title: "Your steps as a citizen",
    steps: [
      "Complete onboarding to register as a citizen in your village.",
      "Your village chief verifies residency on Residency Verification. You get a notification when approved.",
      "Request documents on Documents. Your village chief approves or rejects each request.",
      "File disputes on Disputes. Your village chief mediates and resolves the case.",
    ],
  },
  village_chief: {
    title: "Your steps as village chief",
    steps: [
      "Verify or reject new citizens on Residency Verification.",
      "Approve or reject document requests on Documents.",
      "Resolve disputes on Disputes (resolve or dismiss).",
      "Approve animal and land registrations submitted by village staff.",
    ],
  },
  village_staff: {
    title: "Your steps as village staff",
    steps: [
      "Register new citizens on Citizens. Each registration goes to the chief for residency verification.",
      "Register animals and land parcels. The chief approves each registration.",
      "You cannot approve documents, residency, or disputes. Those are chief actions.",
    ],
  },
  district_officer: {
    title: "Your steps as district officer",
    steps: [
      "Monitor village activity via Reports and Audit Logs.",
      "You may verify residency if the chief is unavailable (Residency Verification).",
      "You cannot approve documents or resolve disputes. Those stay with the village chief.",
    ],
  },
  administrator: {
    title: "Your steps as administrator",
    steps: [
      "Approve or reject staff access on Role Requests only.",
      "View staff accounts on Users (read-only).",
      "You do not verify citizenship or approve documents. Citizens go to the chief; documents are approved by the chief.",
    ],
  },
};

export function WorkflowGuide({ role }: { role: UserRole }) {
  const workflow = WORKFLOWS[role];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{workflow.title}</CardTitle>
        <CardDescription>Who does what in VDARVS</CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
          {workflow.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
