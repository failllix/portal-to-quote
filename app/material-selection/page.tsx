import Heading1 from "../components/heading1";
import Quote from "../components/quote";
import { Suspense } from "react";
import { apiClient } from "@/shared/client";

export interface Material {
  name: string;
  code: string;
  price: number;
  leadTimeDays: number;
  properties: string[];
}

export type GetGeometryResult = ReturnType<typeof apiClient.getGeometryResult>;

export default async function MaterialSelectionPage() {
  const geometryResponse = apiClient.getGeometryResult({
    params: {
      id: "fooBar",
    },
  });

  const materialsResponse = apiClient.getMaterials();

  return (
    <main className="px-12 mx-auto max-w-300 mt-12">
      <Heading1>Material Selection</Heading1>
      <Suspense fallback={<div>Loading...</div>}>
        <Quote
          geometryRequest={geometryResponse}
          materialsRequest={materialsResponse}
        ></Quote>
      </Suspense>
    </main>
  );
}
