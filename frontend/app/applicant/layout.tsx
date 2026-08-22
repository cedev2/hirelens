import type { ReactNode } from "react";
import ApplicantLayoutClient from "./ApplicantLayoutClient";

export default function ApplicantLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <ApplicantLayoutClient>{children}</ApplicantLayoutClient>;
}
