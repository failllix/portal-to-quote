"use client";

import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import type { ClientInferResponseBody } from "@ts-rest/core";
import { type FormEvent, useState } from "react";
import * as z from "zod";
import type { portalToQuoteContract } from "@/shared/contract";
import { createOrder } from "../actions";
import { useSnackbar } from "../context/snackbar-context";
import Button from "./button";
import CheckboxGroup from "./checkbox-group";
import Input from "./input";
import LoadingSpinner from "./loading-spinner";
import RadioGroup from "./radio-group";

type Quote = ClientInferResponseBody<
  typeof portalToQuoteContract.getQuote,
  200
>;

export default function OrderForm({ quote }: { quote: Quote }) {
  const snackBar = useSnackbar();
  const stripe = useStripe();
  const elements = useElements();

  if (quote.status !== "ready") {
    throw new Error("Cannot show order form for quotes not in 'ready' state.");
  }
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);

  async function order(event: FormEvent<HTMLFormElement>) {
    setIsLoading(true);
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    try {
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
        throw new Error("Form data is invalid.", {
          cause: parsedFormData.error,
        });
      }

      const validatedFormData = parsedFormData.data;

      const orderCreationResult = await createOrder({
        body: {
          customerCompany: validatedFormData.customerCompany,
          customerEmail: validatedFormData.customerEmail,
          customerName: validatedFormData.customerName,
          paymentMethod: validatedFormData.paymentMethod,
          quoteId: quote.id,
        },
      });

      if (orderCreationResult.status !== 200) {
        throw new Error("Creating order entity failed");
      }

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${process.env.NEXT_PUBLIC_URL}/orderCompletion/${orderCreationResult.body.id}`,
        },
      });

      if (error) {
        if (error.type === "card_error" || error.type === "validation_error") {
          setMessage(error.message ?? null);
        }

        setMessage("An unexpected error occurred.");
        return;
      }
    } catch (error) {
      if (error instanceof Error) {
        snackBar(error.message, "error");
      } else {
        snackBar("Placing order faild.");
      }
    } finally {
      setIsLoading(false);
    }
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
      <div className="flex w-full gap-4 items-center">
        <Button
          type="submit"
          disabled={isLoading || !stripe || !elements}
          className="grow"
        >
          Buy Now ({quote.totalPrice}€)
        </Button>
        {isLoading && <LoadingSpinner></LoadingSpinner>}
      </div>
    </form>
  );
}
