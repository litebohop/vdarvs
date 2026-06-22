import { ProtectedLayout } from "@/components/layout/protected-layout";

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}
