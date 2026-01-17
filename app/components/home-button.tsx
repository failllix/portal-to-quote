"use client";

import { redirect } from "next/navigation";
import Button from "./button";

export default function HomeButton({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Button type="button" onClick={() => redirect("/")} className={className}>
      {children}
    </Button>
  );
}
