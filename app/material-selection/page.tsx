"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import Heading1 from "../components/Heading1";
import MaterialSelection from "../components/materials-selection";
import Button from "../components/button";
import Heading2 from "../components/Heading2";
import { calculatePriceDetails } from "./logic";

export interface Material {
  name: string;
  code: string;
  price: number;
  leadTimeDays: number;
  properties: string[];
}

export default function MaterialSelectionPage() {
  const materials: Material[] = [
    {
      name: "PLA",
      code: "pla",
      price: 0.08,
      leadTimeDays: 3,
      properties: ["Standard prototyping", "Biodegradable"],
    },
    {
      name: "ABS",
      code: "abs",
      price: 0.12,
      leadTimeDays: 3,
      properties: ["Heat resistant", "Good mechanical strength"],
    },
    {
      name: "Nylon PA12",
      code: "pa12",
      price: 0.28,
      leadTimeDays: 3,
      properties: ["Industrial grade", "High wear resistance"],
    },
    {
      name: "Polypropylene",
      code: "pp",
      price: 0.18,
      leadTimeDays: 7,
      properties: ["Chemical resistant", "Living hinges"],
    },
    {
      name: "TPU 95A",
      code: "tpu",
      price: 0.22,
      leadTimeDays: 5,
      properties: ["Flexible", "Impact resistant"],
    },
  ];

  const sampleResponse = {
    success: true,
    properties: {
      boundingBox: { x: 250, y: 250, z: 45 },
      volume: 2812500,
      volumeCm3: 324,
      surfaceArea: 486000,
    },
    processingTimeMs: 8047,
  };

  const [quantity, setQuantity] = useState(1);
  const quantityInputRef = useRef<HTMLInputElement>(null);
  const [selectedMaterialIndex, setSelectedMaterial] = useState(0);
  const [priceDetails, setPriceDetails] = useState({});

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
        geometryResult: sampleResponse,
        materialPrice: materials[selectedMaterialIndex].price,
        quantity,
      })
    );
  }, [quantity, selectedMaterialIndex]);

  return (
    <main className="px-12 mx-auto max-w-300 mt-12">
      <Heading1>Material Selection</Heading1>
      <div className="flex gap-8 mt-8">
        <div className="">
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
                  <td className="pl-2">
                    {sampleResponse.properties.volumeCm3}cm³
                  </td>
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
                  <td className="pl-2">
                    {priceDetails.unitPrice?.toFixed(2)}€
                  </td>
                </tr>
                <tr>
                  <td>Quantity</td>
                  <td className="pl-2">
                    {!Number.isNaN(quantity) && quantity}
                  </td>
                </tr>
                <tr>
                  <td>Subtotal</td>
                  <td className="pl-2">{priceDetails.subtotal?.toFixed(2)}€</td>
                </tr>
                <tr>
                  <td>Discount ({priceDetails.discountPercentage * 100}%)</td>
                  <td className="pl-2">{priceDetails.discount?.toFixed(2)}€</td>
                </tr>
                <tr>
                  <td>Total</td>
                  <td className="pl-2">{priceDetails.total?.toFixed(2)}€</td>
                </tr>
              </tbody>
            </table>
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
    </main>
  );
}
