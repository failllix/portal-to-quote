import { use } from "react";
import { stripe } from "../../utils/stripe";
import { redirect } from "next/navigation";
import { processPayment } from "../../actions";
import Heading1 from "@/app/components/heading1";
import { apiClient } from "@/shared/client";
import QuoteSummary from "@/app/components/quote-summary";
import Heading2 from "@/app/components/heading2";

export default async function OrderCompletionPage({
  params,
  searchParams,
}: {
  params: { orderId: string };
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { orderId } = await params;
  const { payment_intent: paymentIntentId } = await searchParams;

  if (!paymentIntentId || Array.isArray(paymentIntentId)) {
    redirect("/");
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (!paymentIntent) redirect("/");

  const { status } = paymentIntent;

  await processPayment({
    params: { id: orderId },
    body: {
      paymentStatus: status === "succeeded" ? "paid" : "failed",
    },
  });

  const orderResponse = await apiClient.getOrder({ params: { id: orderId } });

  if (orderResponse.status !== 200) {
    throw new Error(`Fetching details for order with id '${orderId}' failed.`);
  }

  const order = orderResponse.body;

  const quoteResponse = await apiClient.getQuote({
    params: { id: order.quoteId },
  });

  if (quoteResponse.status !== 200) {
    throw new Error(
      `Fetching details for quote with id '${order.quoteId}' failed.`,
    );
  }

  const quote = quoteResponse.body;

  return (
    <main className="px-12 mx-auto max-w-300 pb-12">
      <Heading1>
        {status === "succeeded" ? "Order Confirmation" : "Payment Failed"}
      </Heading1>
      <p className="mt-8">
        {status === "succeeded"
          ? "Your order was successful! Thanks for shopping at SAEKI."
          : "Your payment has failed."}
      </p>
      {status === "succeeded" && (
        <>
          <Heading2 className="mt-8">Summary</Heading2>
          <QuoteSummary quote={quote}></QuoteSummary>
        </>
      )}
    </main>
  );
}
