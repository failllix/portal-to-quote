import Heading1 from "../../components/heading1";
import Quote from "../../components/quote";
import { Suspense } from "react";
import { apiClient } from "@/shared/client";
import { waitUntilGeometryDataIsAvailable } from "@/app/actions";

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
  params: { id: string };
}) {
  const { id } = await params;

  const materialsRequest = apiClient.getMaterials();

  async function waitUntilGeometryDataIsAvailable() {
    const startTime = Date.now();
    const timeOut = 10_000;

    while (Date.now() < startTime + timeOut) {
      const geometryResponse = await apiClient.getGeometryResult({
        params: {
          id,
        },
      });

      if (geometryResponse.status === 404 || geometryResponse.status === 500) {
        throw new Error(geometryResponse.body.message);
      }

      if (geometryResponse.body.status === "FAILED") {
        throw new Error("Geometry data processing failed.");
      }

      if (geometryResponse.body.status === "DONE") {
        return geometryResponse.body;
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    throw new Error("Waiting for geometry data timed out.");
  }

  return (
    <main className="px-12 mx-auto max-w-300 mt-12">
      <Heading1>Material Selection</Heading1>
      <Suspense fallback={<div>Analyzing geometry...</div>}>
        <Quote
          geometryRequest={waitUntilGeometryDataIsAvailable()}
          materialsRequest={materialsRequest}
        ></Quote>
      </Suspense>
    </main>
  );
}
