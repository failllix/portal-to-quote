"use client";

import type { OrderError } from "./errors";

export default function OrderErrorDisplay({ error }: { error: OrderError }) {
  if (error.name === "MaterialDiscontinuedError") {
    return (
      <p>
        Ooops... Looks like your selected material was discontinued. Please
        create a new quote and place another order.
      </p>
    );
  }

  if (error.name === "QuoteNotReadyError") {
    return <p>Looks like your quote is not ready yet.</p>;
  }

  if (error.name === "QuoteFetchError") {
    return <p>We are having trouble to fetch your quote data</p>;
  }

  if (error.name === "StripeError") {
    return (
      <p>
        There is an issue with our Stripe integration. We cannot begin new
        transactions at the moment.
      </p>
    );
  }

  return <p>There was an unexpected issue. Please try again later.</p>;
}
