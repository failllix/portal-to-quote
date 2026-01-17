import DefaultLayout from "@/app/components/default-layout";
import type React from "react";

export default function MaterialSelectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DefaultLayout title="Material Selection">{children}</DefaultLayout>;
}
