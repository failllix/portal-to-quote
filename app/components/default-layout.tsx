import type React from "react";
import Heading1 from "./heading1";

export default function DefaultLayout({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <main className="px-12 mx-auto max-w-300 pb-8">
      <Heading1 className="mb-8">{title}</Heading1>
      {children}
    </main>
  );
}
