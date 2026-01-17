"use client";

import type { ClientInferResponseBody } from "@ts-rest/core";
import type { geometryContract } from "@/shared/contract";

type Quote = ClientInferResponseBody<typeof geometryContract.getQuote, 200>;

export default function QuoteSummary({
  quote,
  expectedDeliveryDate,
}: {
  quote: Quote;
  expectedDeliveryDate: Date;
}) {
  if (!(quote.status === "ready" || quote.status === "ordered")) {
    throw new Error(
      "Can only show summary for quote in 'ready' or 'ordered' status",
    );
  }

  return (
    <div className="mt-4">
      <div className="grid grid-cols-3 gap-2">
        <p className="text-xl font-bold">Material</p>
        <p className="text-xl font-bold">Quantity</p>
        <p className="text-xl font-bold">Unit Price</p>
        <p className="">
          {quote.materialName} ({quote.volumeCm3}cm³)
        </p>
        <p className="">{quote.quantity}</p>
        <p className="">{quote.unitPrice}€</p>
        <div className="col-span-3 border-t-4 border-double "></div>
        <p className="col-start-2 col-end-2 text-right font-bold">Total:</p>
        <p className="col-start-3 col-end-3 font-bold">{quote.totalPrice}€</p>
      </div>
      <p>
        Expected Delivery:{" "}
        {expectedDeliveryDate.toLocaleString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          weekday: "long",
        })}
      </p>
    </div>
  );
}
