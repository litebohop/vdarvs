import Link from "next/link";
import { Shield, Users, Map, FileText, Scale, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { appConfig } from "@/config/app.config";

const features = [
  {
    icon: Users,
    title: "Citizen Registration",
    description:
      "Register citizens with village-based addresses. No street names or house numbers.",
  },
  {
    icon: Map,
    title: "Land Records",
    description:
      "Track land parcels by village, community council, and district.",
  },
  {
    icon: FileText,
    title: "Official Documents",
    description:
      "Issue residency certificates, permits, and chief endorsements.",
  },
  {
    icon: Scale,
    title: "Dispute Resolution",
    description:
      "Mediate village disputes through Chief-led workflows.",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Shield className="size-6" />
            <span className="font-semibold">{appConfig.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">
                Get started
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-6 py-24 text-center">
          <p className="mb-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Kingdom of Lesotho
          </p>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Village Digital Administrative Records & Verification
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            A modern government administration system for Lesotho local
            government. Digitize records, verify residency, and empower Village
            Chiefs.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/signup">Get started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </section>

        <section className="border-t bg-muted/30 py-24">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="mb-12 text-center text-2xl font-semibold">
              Built for Lesotho&apos;s administrative hierarchy
            </h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-xl border bg-card p-6 shadow-sm"
                >
                  <feature.icon className="mb-4 size-8 text-primary" />
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-6xl px-6 text-center">
            <p className="text-sm text-muted-foreground">
              Country → District → Community Council → Village → Village Chief → Citizen
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-muted-foreground">
          {appConfig.fullName} · Prototype for Final Year Project
        </div>
      </footer>
    </div>
  );
}
