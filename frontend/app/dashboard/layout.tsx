import type { ReactNode } from "react";
import DashboardLayoutClient from "./DashboardLayoutClient";

export default function DashboardLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
