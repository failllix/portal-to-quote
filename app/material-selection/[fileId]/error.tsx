"use client";

import HomeButton from "@/app/components/home-button";
import type { MaterialSelectionError } from "./errors";

export default function MaterialSelectionErrorDispaly({
  error,
}: {
  error: MaterialSelectionError;
}) {
  if (error.name === "FileDataTimeoutError") {
    return (
      <>
        <p>
          We are having trouble extracting your geometry data at the moment. We
          will send you an email once your files were processed.
        </p>
        <HomeButton className="mt-4">Upload New File</HomeButton>
      </>
    );
  }

  if (error.name === "FileDataFetchError") {
    return (
      <>
        <p>
          There is an issue fetching your file data. Please try again later.
        </p>
        <HomeButton className="mt-4">Upload New File</HomeButton>
      </>
    );
  }

  if (error.name === "GeometryExtractionFailedError") {
    return (
      <>
        <p>Geometry extraction of your provided file failed.</p>
        <HomeButton className="mt-4">Upload New File</HomeButton>
      </>
    );
  }

  if (error.name === "QuoteCreationError") {
    return (
      <>
        <p>We could not create a new draft quote for your uploaded file.</p>
        <HomeButton className="mt-4">Upload New File</HomeButton>
      </>
    );
  }

  return <p>There was an unexpected issue. Please try again later.</p>;
}
