import DefaultLayout from "@/app/components/default-layout";
import type React from "react";

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DefaultLayout title="Checkout">{children}</DefaultLayout>;
}
