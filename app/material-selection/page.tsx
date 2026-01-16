import Heading1 from "../components/heading1";
import { ApiFetcherArgs, initClient, tsRestFetchApi } from "@ts-rest/core";
import { geometryContract } from "@/shared/contract";
import Quote from "../components/quote";
import { Suspense } from "react";

export interface Material {
  name: string;
  code: string;
  price: number;
  leadTimeDays: number;
  properties: string[];
}

const client = initClient(geometryContract, {
  baseUrl: process.env.BACKEND_API_BASE_URL ?? "",
  baseHeaders: {},
  throwOnUnknownStatus: true,
  api: async (args: ApiFetcherArgs) => {
    const result = await tsRestFetchApi({
      ...args,
      fetchOptions: { cache: "no-store" },
    });
    return result;
  },
});

export type GetGeometryResult = ReturnType<typeof client.getGeometryResult>;

export default async function MaterialSelectionPage() {
  const geometryResponse = client.getGeometryResult({
    params: {
      id: "fooBar",
    },
  });

  const materialsResponse = client.getMaterials();

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
