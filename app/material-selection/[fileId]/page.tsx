import { Suspense } from "react";
import { apiClient, disabledMemoizatioApiClient } from "@/shared/client";
import Quote from "../../components/quote";
import {
  FileDataFetchError,
  FileDataTimeoutError,
  GeometryExtractionFailedError,
  QuoteCreationError,
} from "./errors";

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
    throw new QuoteCreationError();
  }

  const quoteId = quoteCreationResult.body.id;

  const materialsRequest = apiClient.getMaterials();

  async function waitUntilGeometryDataIsAvailable() {
    const startTime = Date.now();
    const timeOut = 10_000;

    while (Date.now() < startTime + timeOut) {
      const geometryResponse =
        await disabledMemoizatioApiClient.getGeometryResult({
          params: {
            id: fileId,
          },
        });

      if (geometryResponse.status === 404 || geometryResponse.status === 500) {
        throw new FileDataFetchError();
      }

      if (geometryResponse.body.status === "failed") {
        throw new GeometryExtractionFailedError();
      }

      if (geometryResponse.body.status === "done") {
        return geometryResponse.body;
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    throw new FileDataTimeoutError();
  }

  return (
    <Suspense fallback={<div>Analyzing geometry...</div>}>
      <Quote
        quoteId={quoteId}
        geometryRequest={waitUntilGeometryDataIsAvailable()}
        materialsRequest={materialsRequest}
      ></Quote>
    </Suspense>
  );
}
