import type React from "react";
import DefaultLayout from "@/app/components/default-layout";

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DefaultLayout title="Checkout">{children}</DefaultLayout>;
}
