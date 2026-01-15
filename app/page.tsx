"use client";

import type React from "react";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import Button from "./components/button";

interface FileError {
  fileName: string;
  message: string;
}

export default function Home() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileErrors, setFileErrors] = useState<FileError[]>([]);
  const dropZoneRef = useRef<HTMLLabelElement>(null);

  function validateAndUpdateSelectedFiles(files: File[]) {
    setFileErrors([]);
    setSelectedFiles([]);

    const updatedFileErrors: FileError[] = [];

    const validatedFiles = files
      .filter((file) => {
        if (file.name.endsWith(".step") || file.name.endsWith(".stp")) {
          return true;
        }

        updatedFileErrors.push({
          fileName: file.name,
          message: `File type${file.name.split(".").at(-1)} is not supported`,
        });

        return false;
      })
      .filter((file) => {
        if (file.size < 50_000_000) {
          return true;
        }

        updatedFileErrors.push({
          fileName: file.name,
          message: "Filesize is larger than 50MB",
        });

        return false;
      });

    setFileErrors(updatedFileErrors);
    setSelectedFiles(validatedFiles);
  }

  function changeHandler(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files ? Array.from(event.target.files) : [];
    validateAndUpdateSelectedFiles(files);
    event.target.value = "";
  }

  function dropHandler(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    const files = [...event.dataTransfer.items]
      .map((item) => item.getAsFile())
      .filter((file): file is File => file !== null);

    validateAndUpdateSelectedFiles(files);
  }

  function clearButtonHandler(): void {
    setSelectedFiles([]);
    setFileErrors([]);
  }

  useEffect(() => {
    const onDrop = (event: DragEvent) => {
      if (
        [...(event.dataTransfer?.items ?? [])].some(
          (item) => item.kind === "file"
        )
      ) {
        event.preventDefault();
      }
    };

    const onDragOver = (event: DragEvent) => {
      const fileItems = [...(event.dataTransfer?.items ?? [])].filter(
        (item) => item.kind === "file"
      );
      if (fileItems.length > 0) {
        event.preventDefault();
        if (!dropZoneRef.current?.contains(event.target as Node)) {
          if (event.dataTransfer != null) {
            event.dataTransfer.dropEffect = "none";
          }
        }
      }
    };

    window.addEventListener("drop", onDrop);
    window.addEventListener("dragover", onDragOver);

    return () => {
      window.removeEventListener("drop", onDrop);
      window.removeEventListener("dragover", onDragOver);
    };
  }, []);

  return (
    <main className="px-12 mx-auto max-w-300">
      <h1>File upload</h1>
      <label
        ref={dropZoneRef}
        className="mt-8 border-2 flex items-center justify-center border-amber-400 h-80 cursor-pointer rounded-lg"
        onDrop={dropHandler}
      >
        Drop .step or .stp files here, or click to upload.
        <input
          className="hidden"
          onChange={changeHandler}
          type="file"
          accept=".step,.stp"
        />
      </label>

      {selectedFiles.length > 0 && (
        <div className="mt-8">
          <h2>Selected Files</h2>
          <ul>
            {selectedFiles.map((file) => (
              <li key={file.name}>{file.name}</li>
            ))}
          </ul>
        </div>
      )}

      {fileErrors.length > 0 && (
        <div className="mt-8">
          <h2>Errors</h2>
          <ul className="text-(--error)">
            {fileErrors.map((error) => (
              <li key={error.fileName}>
                {error.fileName}: {error.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 flex gap-4">
        <Button type="button" onClick={clearButtonHandler}>
          Clear
        </Button>
        <Button type="button">Configure Materials</Button>
      </div>
    </main>
  );
}
