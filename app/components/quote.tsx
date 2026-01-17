"use client";

import type {
  ClientInferResponseBody,
  ClientInferResponses,
} from "@ts-rest/core";
import { useRouter } from "next/navigation";
import { use, useEffect, useRef, useState } from "react";
import type { geometryContract } from "@/shared/contract";
import { completeQuote } from "../actions";
import {
  calculatePriceDetails,
  type PriceDetails,
} from "../material-selection/logic";
import Button from "./button";
import Heading2 from "./heading2";
import LoadingSpinner from "./loading-spinner";
import MaterialSelection from "./materials-selection";

type GeometryPromise = ClientInferResponseBody<
  typeof geometryContract.getGeometryResult,
  200
>;
type MaterialsPromise = ClientInferResponses<
  typeof geometryContract.getMaterials
>;

export default function Quote({
  geometryRequest,
  materialsRequest,
  quoteId,
}: {
  geometryRequest: Promise<GeometryPromise>;
  materialsRequest: Promise<MaterialsPromise>;
  quoteId: string;
}) {
  const router = useRouter();
  const geometryResult = use(geometryRequest);

  if (geometryResult.status === "failed") {
    throw new Error("Geometry data extraction has failed.");
  }

  if (geometryResult.status === "in_process") {
    throw new Error("Geometry data extraction is still in process.");
  }

  if (geometryResult.status !== "done") {
    throw new Error(
      "Geometry data extraction is expected to be in 'done' state.",
    );
  }

  const geometryProperties = geometryResult.properties;

  const materialsResponse = use(materialsRequest);

  const materials = materialsResponse.body;

  const quantityInputRef = useRef<HTMLInputElement>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedMaterialIndex, setSelectedMaterial] = useState(0);
  const [priceDetails, setPriceDetails] = useState<PriceDetails | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  async function finishQuote() {
    if (!priceDetails) {
      throw new Error("Price calculation failed.");
    }

    setIsLoading(true);

    const material = materials[selectedMaterialIndex];

    await completeQuote({
      material,
      quoteId,
      priceDetails,
      quantity,
      volumeCm3: geometryProperties.volumeCm3,
    });

    router.push(`/order/${quoteId}`);
    setIsLoading(false);
  }

  function increaseQuantity() {
    setQuantity(quantity + 1);
  }

  function decreaseQuantity() {
    if (quantity === 1) {
      return;
    }
    setQuantity(quantity - 1);
  }

  function handleQuantityChange() {
    if (quantityInputRef.current === null) {
      return;
    }

    const newQuantity = parseInt(quantityInputRef.current.value, 10);

    if (newQuantity < 1) {
      setQuantity(1);
      return;
    }

    if (Number.isNaN(newQuantity)) {
      setQuantity(0);
      return;
    }

    setQuantity(newQuantity);
  }

  useEffect(() => {
    setPriceDetails(
      calculatePriceDetails({
        volumeCm3: geometryProperties.volumeCm3,
        materialPrice: materials[selectedMaterialIndex].price,
        quantity,
      }),
    );
  }, [quantity, selectedMaterialIndex, geometryProperties, materials]);

  return (
    <div className="flex gap-8 mt-8">
      <div>
        <div>
          <Heading2>Quantity</Heading2>
          <div className="mt-2 flex gap-4 items-center">
            <Button type="button" onClick={decreaseQuantity}>
              -
            </Button>
            <input
              type="number"
              value={quantity !== 0 ? quantity : ""}
              className="w-12"
              ref={quantityInputRef}
              onChange={handleQuantityChange}
            ></input>
            <Button type="button" onClick={increaseQuantity}>
              +
            </Button>
          </div>
        </div>
        <div className="mt-8 min-w-60">
          <Heading2>Quote</Heading2>
          <table>
            <tbody>
              <tr>
                <td>Volume</td>
                <td className="pl-2">{geometryProperties.volumeCm3}cm³</td>
              </tr>
              <tr>
                <td>Material</td>
                <td className="pl-2">
                  {materials[selectedMaterialIndex].name}
                </td>
              </tr>
              <tr>
                <td>Price / cm³</td>
                <td className="pl-2">
                  {materials[selectedMaterialIndex].price}€
                </td>
              </tr>
              <tr>
                <td>Unit Price</td>
                <td className="pl-2">{priceDetails?.unitPrice?.toFixed(2)}€</td>
              </tr>
              <tr>
                <td>Quantity</td>
                <td className="pl-2">{!Number.isNaN(quantity) && quantity}</td>
              </tr>
              <tr>
                <td>Subtotal</td>
                <td className="pl-2">{priceDetails?.subtotal?.toFixed(2)}€</td>
              </tr>
              <tr>
                <td>
                  Discount ({(priceDetails?.discountPercentage ?? 0) * 100}%)
                </td>
                <td className="pl-2">{priceDetails?.discount?.toFixed(2)}€</td>
              </tr>
              <tr>
                <td>Total</td>
                <td className="pl-2">{priceDetails?.total?.toFixed(2)}€</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="flex gap-4 items-center mt-8">
          <Button
            type="button"
            disabled={isLoading || quantity < 1}
            onClick={finishQuote}
          >
            Order now
          </Button>
          {isLoading && <LoadingSpinner></LoadingSpinner>}
        </div>
      </div>
      <div className="grow">
        <MaterialSelection
          materials={materials}
          handleMaterialSelection={setSelectedMaterial}
          selectedMaterialIndex={selectedMaterialIndex}
        ></MaterialSelection>
      </div>
    </div>
  );
}
