export class OrderFetchError extends Error {
  constructor() {
    super("Fetching order data failed");
    this.name = "OrderFetchError";
  }
}

export class QuoteFetchError extends Error {
  constructor() {
    super("Fetching quote data failed");
    this.name = "QuoteFetchError";
  }
}

type OrderFetchErrorType = {
  name: "OrderFetchError";
  message: string;
};
type QuoteFetchErrorType = {
  name: "QuoteFetchError";
  message: string;
};

export type OrderCompletionError = OrderFetchErrorType | QuoteFetchErrorType;
