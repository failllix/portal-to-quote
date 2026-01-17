"use client";

import { useState, type FormEvent } from "react";
import Button from "./button";
import Input from "./input";
import RadioGroup from "./radio-group";
import CheckboxGroup from "./checkbox-group";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import type { ClientInferResponseBody } from "@ts-rest/core";
import type { geometryContract } from "@/shared/contract";
import { createOrder } from "../actions";
import * as z from "zod";

type Quote = ClientInferResponseBody<typeof geometryContract.getQuote, 200>;

export default function OrderForm({ quote }: { quote: Quote }) {
  if (quote.status !== "ready") {
    throw new Error("Can show order form for quotes in 'ready' state.");
  }

  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);

  async function order(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    if (quote.status !== "ready") {
      throw new Error(
        "Can not complete order for quote, which is not in 'ready' state."
      );
    }

    const formData = new FormData(event.currentTarget);

    const OrderFormData = z.object({
      customerCompany: z.string().optional(),
      customerEmail: z.string(),
      customerName: z.string(),
      paymentMethod: z.enum(["card", "purchase_order"]),
    });

    const formDataObject = {
      customerCompany: formData.get("company"),
      customerEmail: formData.get("email"),
      customerName: formData.get("name"),
      paymentMethod: formData.get("payment_method"),
    };

    const parsedFormData = OrderFormData.safeParse(formDataObject);

    if (parsedFormData.error) {
      throw new Error("Parsing of form data failed.", {
        cause: parsedFormData.error,
      });
    }

    const validatedFormData = parsedFormData.data;

    if (formDataObject.customerCompany) setIsLoading(true);

    await createOrder({
      body: {
        customerCompany: validatedFormData.customerCompany,
        customerEmail: validatedFormData.customerEmail,
        customerName: validatedFormData.customerName,
        paymentMethod: validatedFormData.paymentMethod,
        quoteId: quote.id,
        totalAmount: quote.totalPrice,
      },
    });

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${process.env.NEXT_PUBLIC_URL}/orderCompletion`,
      },
    });

    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message ?? null);
    } else {
      setMessage("An unexpected error occurred.");
    }

    setIsLoading(false);
  }

  function handleFormChange(event: FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    if (formData.get("payment_method") === null) {
      return;
    }
    setPaymentMethod(formData.get("payment_method") as string);
  }

  return (
    <form
      onSubmit={order}
      className="flex flex-col gap-4 mt-8"
      onChange={handleFormChange}
    >
      <Input id="name" name="name" label="Name" required={true}></Input>
      <Input id="email" name="email" label="Email" required={true}></Input>
      <Input id="company" name="company" label="Company (Optional)"></Input>
      <RadioGroup
        name="payment_method"
        label="Payment Method"
        options={[
          { id: "card", label: "Card", value: "card" },
          {
            id: "purchase_order",
            label: "Purchase Order",
            value: "purchase_order",
            disabled: true,
          },
        ]}
        required={true}
      ></RadioGroup>
      <PaymentElement
        options={{ layout: "accordion" }}
        className={`${paymentMethod !== "card" && "hidden"}`}
      />
      <CheckboxGroup
        label="Terms and Conditions"
        name="terms_and_conditions"
        options={[
          {
            id: "accept_terms_and_conditions",
            label: "Accept Terms and Conditions",
            value: "accepted",
            required: true,
          },
        ]}
      ></CheckboxGroup>
      {message && <p className="text-red-500">{message}</p>}
      <Button type="submit" disabled={isLoading || !stripe || !elements}>
        Buy Now ({quote.totalPrice}€)
      </Button>
    </form>
  );
}
