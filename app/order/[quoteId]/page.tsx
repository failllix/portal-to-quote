import Checkout from "@/app/components/checkout";
import QuoteSummary from "@/app/components/quote-summary";
import { stripe } from "@/app/utils/stripe";
import { apiClient } from "@/shared/client";
import {
  MaterialDiscontinuedError,
  QuoteFetchError,
  QuoteNotReadyError,
  StripeError,
} from "./errors";

export interface Material {
  name: string;
  code: string;
  price: number;
  leadTimeDays: number;
  properties: string[];
}

export type GetGeometryResult = ReturnType<typeof apiClient.getGeometryResult>;

export default async function CheckoutPage({
  params,
}: {
  params: { quoteId: string };
}) {
  const { quoteId } = await params;

  const quoteResponse = await apiClient.getQuote({ params: { id: quoteId } });

  if (quoteResponse.status !== 200) {
    throw new QuoteFetchError();
  }

  const quote = quoteResponse.body;

  if (quote.status !== "ready") {
    throw new QuoteNotReadyError();
  }

  const materialsResponse = await apiClient.getMaterials();

  const materials = materialsResponse.body;
  const filteredMaterial = materials.filter(
    (material) => material.code === quote.materialId,
  );

  const material = filteredMaterial[0];

  if (!material) {
    throw new MaterialDiscontinuedError();
  }

  const { client_secret: clientSecret } = await stripe.paymentIntents.create({
    amount: quote.totalPrice * 100,
    currency: "eur",
  });

  if (clientSecret === null) {
    throw new StripeError();
  }

  return (
    <>
      <QuoteSummary
        quote={quote}
        expectedDeliveryDate={
          new Date(Date.now() + material.leadTimeDays * 24 * 60 * 60 * 1000)
        }
      ></QuoteSummary>
      <Checkout quote={quote} clientSecret={clientSecret}></Checkout>
    </>
  );
}
