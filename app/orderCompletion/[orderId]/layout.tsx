import DefaultLayout from "@/app/components/default-layout";
import type React from "react";

export default function OrderCompletionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DefaultLayout title="Order Completion">{children}</DefaultLayout>;
}
