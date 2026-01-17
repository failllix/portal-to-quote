"use client";

import { redirect } from "next/navigation";
import Button from "./button";

export default function StartNewQuoteButton({
  children,
  fileId,
  className,
}: {
  children: React.ReactNode;
  fileId: string;
  className?: string;
}) {
  return (
    <Button
      type="button"
      onClick={() => redirect(`/material-selection/${fileId}`)}
      className={className}
    >
      {children}
    </Button>
  );
}
