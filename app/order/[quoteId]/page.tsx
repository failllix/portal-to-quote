import OrderForm from "@/app/components/order-form";
import Heading1 from "../../components/heading1";
import { apiClient } from "@/shared/client";
import Heading2 from "@/app/components/heading2";
import QuoteSummary from "@/app/components/quote-summary";
import { Suspense } from "react";
import { stripe } from "@/app/utils/stripe";
import Checkout from "@/app/components/checkout";

export interface Material {
  name: string;
  code: string;
  price: number;
  leadTimeDays: number;
  properties: string[];
}

export type GetGeometryResult = ReturnType<typeof apiClient.getGeometryResult>;

export default async function MaterialSelectionPage({
  params,
}: {
  params: { quoteId: string };
}) {
  const { quoteId } = await params;

  const quoteResponse = await apiClient.getQuote({ params: { id: quoteId } });

  if (quoteResponse.status !== 200) {
    throw new Error(quoteResponse.body.message);
  }

  const quote = quoteResponse.body;

  if (quote.status !== "ready") {
    throw new Error(
      "Cannot create order for quote, which is not in 'ready' state",
    );
  }

  const { client_secret: clientSecret } = await stripe.paymentIntents.create({
    amount: quote.totalPrice * 100,
    currency: "eur",
  });

  if (clientSecret === null) {
    throw new Error("Could not begin payment transaction.");
  }

  return (
    <main className="px-12 mx-auto max-w-300 pb-12">
      <Heading1>Checkout</Heading1>
      <QuoteSummary quote={quote}></QuoteSummary>
      <Checkout quote={quote} clientSecret={clientSecret}></Checkout>
    </main>
  );
}
