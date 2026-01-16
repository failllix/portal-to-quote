"use client";
import Button from "./components/button";
import Heading1 from "./components/heading1";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="h-full flex flex-col gap-8 items-center justify-center">
      <Heading1>Something went wrong!</Heading1>
      <p>{error.message}</p>
      {error.digest && <p>{error.digest}</p>}
      <Button type="reset" onClick={() => reset()}>
        Try again
      </Button>
    </div>
  );
}
