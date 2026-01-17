export class MaterialDiscontinuedError extends Error {
  constructor() {
    super("Material Discontinued");
    this.name = "MaterialDiscontinuedError";
  }
}

export class QuoteFetchError extends Error {
  constructor() {
    super("Quote Fetch Error");
    this.name = "QuoteFetchError";
  }
}
export class QuoteNotReadyError extends Error {
  constructor() {
    super("Quote Not Ready");
    this.name = "QuoteNotReadyError";
  }
}
export class StripeError extends Error {
  constructor() {
    super("Stripe Error");
    this.name = "StripeError";
  }
}

type MaterialDiscontinuedErrorType = {
  name: "MaterialDiscontinuedError";
  message: string;
};

type QuoteFetchErrorType = {
  name: "QuoteFetchError";
  message: string;
};

type QuoteNotReadyErrorType = {
  name: "QuoteNotReadyError";
  message: string;
};

type StripeErrorType = {
  name: "StripeError";
  message: string;
};

export type OrderError =
  | MaterialDiscontinuedErrorType
  | QuoteFetchErrorType
  | QuoteNotReadyErrorType
  | StripeErrorType;
