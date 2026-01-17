import { type ApiFetcherArgs, initClient, tsRestFetchApi } from "@ts-rest/core";
import { geometryContract } from "./contract";

export const apiClient = initClient(geometryContract, {
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

export const disabledMemoizatioApiClient = initClient(geometryContract, {
  baseUrl: process.env.BACKEND_API_BASE_URL ?? "",
  baseHeaders: {},
  throwOnUnknownStatus: true,
  api: async (args: ApiFetcherArgs) => {
    const { signal } = new AbortController();
    const result = await tsRestFetchApi({
      ...args,
      fetchOptions: { cache: "no-store", signal },
    });
    return result;
  },
});
