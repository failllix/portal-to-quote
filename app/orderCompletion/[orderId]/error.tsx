"use client";

import HomeButton from "@/app/components/home-button";
import type { OrderCompletionError } from "./errors";

export default function MaterialSelectionErrorDispaly({
  error,
}: {
  error: OrderCompletionError;
}) {
  if (error.name === "OrderFetchError") {
    return (
      <>
        <p>
          There is an issue fetching your order data. Please try again later.
        </p>
        <HomeButton className="mt-4">Start new Order</HomeButton>
      </>
    );
  }

  if (error.name === "QuoteFetchError") {
    return (
      <>
        <p>
          There is an issue fetching your quote data. Please try again later.
        </p>
        <HomeButton className="mt-4">Start new Order</HomeButton>
      </>
    );
  }

  return <p>There was an unexpected issue. Please try again later.</p>;
}
