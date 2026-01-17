import { redirect } from "next/navigation";
import Heading2 from "@/app/components/heading2";
import HomeButton from "@/app/components/home-button";
import QuoteSummary from "@/app/components/quote-summary";
import { apiClient } from "@/shared/client";
import { processPayment } from "../../actions";
import { stripe } from "../../utils/stripe";
import { OrderFetchError, QuoteFetchError } from "./errors";

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
    throw new OrderFetchError();
  }

  const order = orderResponse.body;

  console.log(new Date(order.expectedDeliveryAt));

  const quoteResponse = await apiClient.getQuote({
    params: { id: order.quoteId },
  });

  if (quoteResponse.status !== 200) {
    throw new QuoteFetchError();
  }

  const quote = quoteResponse.body;

  return (
    <div>
      <p className="mt-8">
        {status === "succeeded"
          ? `Your order was successful! Thanks for shopping at SAEKI.`
          : "Your payment has failed."}
      </p>
      {status === "succeeded" && (
        <div className="mt-4">
          <p>Your reference number: {order.id}</p>
          <Heading2 className="mt-8">Summary</Heading2>
          <QuoteSummary
            quote={quote}
            expectedDeliveryDate={new Date(order.expectedDeliveryAt)}
          ></QuoteSummary>
        </div>
      )}
      <HomeButton className="mt-8">Start New Order</HomeButton>
    </div>
  );
}
