import type React from "react";
import DefaultLayout from "@/app/components/default-layout";

export default function OrderCompletionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DefaultLayout title="Order Completion">{children}</DefaultLayout>;
}
