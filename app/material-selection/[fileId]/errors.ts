export class FileDataFetchEror extends Error {
  constructor() {
    super("Fetching file data failed");
    this.name = "FileDataFetchEror";
  }
}

export class GeometryExtractionFailedError extends Error {
  constructor() {
    super("Geometry extraction failed");
    this.name = "GeometryExtractionFailedError";
  }
}

export class FileDataTimeoutError extends Error {
  constructor() {
    super("File Data Timeout");
    this.name = "FileDataTimeoutError";
  }
}

export class QuoteCreationError extends Error {
  constructor() {
    super("Quote creation failed");
    this.name = "QuoteCreationError";
  }
}

type FileDataTimeoutErrorType = {
  name: "FileDataTimeoutError";
  message: string;
};
type GeometryExtractionFailedErrorType = {
  name: "GeometryExtractionFailedError";
  message: string;
};
type FileDataFetchErorType = {
  name: "FileDataFetchEror";
  message: string;
};

type QuoteCreationErrorType = {
  name: "QuoteCreationError";
  message: string;
};

export type MaterialSelectionError =
  | FileDataTimeoutErrorType
  | GeometryExtractionFailedErrorType
  | FileDataFetchErorType
  | QuoteCreationErrorType;
