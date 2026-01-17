import type React from "react";
import DefaultLayout from "@/app/components/default-layout";

export default function MaterialSelectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DefaultLayout title="Material Selection">{children}</DefaultLayout>;
}
