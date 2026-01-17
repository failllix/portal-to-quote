"use client";

import { Elements } from "@stripe/react-stripe-js";
import OrderForm from "./order-form";

import { Appearance, loadStripe } from "@stripe/stripe-js";
import { ClientInferResponseBody } from "@ts-rest/core";
import { geometryContract } from "@/shared/contract";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

type Quote = ClientInferResponseBody<typeof geometryContract.getQuote, 200>;

export default function Checkout({
  quote,
  clientSecret,
}: {
  quote: Quote;
  clientSecret: string;
}) {
  const appearance: Appearance = {
    theme: "night",
    variables: {
      colorPrimary: "#ffffff",
      colorBackground: "#171717",
    },
  };
  return (
    <Elements stripe={stripePromise} options={{ appearance, clientSecret }}>
      <OrderForm quote={quote}></OrderForm>
    </Elements>
  );
}
