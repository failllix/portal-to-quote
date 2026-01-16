import Heading1 from "../../components/heading1";
import Quote from "../../components/quote";
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

export default async function MaterialSelectionPage({
  params,
}: {
  params: { fileId: string };
}) {
  const { fileId } = await params;

  const quoteCreationResult = await apiClient.createQuote({
    body: {
      fileId,
    },
  });

  if (quoteCreationResult.status !== 200) {
    throw new Error(quoteCreationResult.body.message);
  }

  const quoteId = quoteCreationResult.body.id;

  const materialsRequest = apiClient.getMaterials();

  async function waitUntilGeometryDataIsAvailable() {
    const startTime = Date.now();
    const timeOut = 10_000;

    while (Date.now() < startTime + timeOut) {
      const geometryResponse = await apiClient.getGeometryResult({
        params: {
          id: fileId,
        },
      });

      if (geometryResponse.status === 404 || geometryResponse.status === 500) {
        throw new Error(geometryResponse.body.message);
      }

      if (geometryResponse.body.status === "failed") {
        throw new Error("Geometry data processing failed.");
      }

      if (geometryResponse.body.status === "done") {
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
          quoteId={quoteId}
          geometryRequest={waitUntilGeometryDataIsAvailable()}
          materialsRequest={materialsRequest}
        ></Quote>
      </Suspense>
    </main>
  );
}
