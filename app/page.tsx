"use client";

import type React from "react";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import Button from "./components/button";
import Heading1 from "./components/heading1";

interface DropZoneText {
  text: string;
  isError: boolean;
}

export default function Home() {
  const dropZoneDefaultText =
    "Drop your .step or .stp file here, or click to upload.";
  const [dropZoneText, setDropZoneText] = useState<DropZoneText>({
    text: dropZoneDefaultText,
    isError: false,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const dropZoneRef = useRef<HTMLLabelElement>(null);

  function validateAndUpdateSelectedFiles(file: File) {
    setSelectedFile(null);

    if (!(file.name.endsWith(".step") || file.name.endsWith(".stp"))) {
      setDropZoneText({
        text: "File must be of type .step or .stp",
        isError: true,
      });
      return;
    }

    if (file.size > 50_000_000) {
      setDropZoneText({
        text: "Filesize must be smaller than 50MB",
        isError: true,
      });
      return;
    }

    setDropZoneText({
      text: file.name,
      isError: false,
    });
    setSelectedFile(file);
  }

  function changeHandler(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files ? Array.from(event.target.files) : [];
    if (files.length > 1) {
      return;
    }

    validateAndUpdateSelectedFiles(files[0]);
    event.target.value = "";
  }

  function dropHandler(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    const files = [...event.dataTransfer.items]
      .map((item) => item.getAsFile())
      .filter((file): file is File => file !== null);

    if (files.length > 1) {
      return;
    }

    validateAndUpdateSelectedFiles(files[0]);
  }

  function clearButtonHandler(): void {
    setSelectedFile(null);
    setDropZoneText({ text: dropZoneDefaultText, isError: false });
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

        if (fileItems.length > 1) {
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
    <main className="px-12 mx-auto max-w-300 mt-12">
      <Heading1>File upload</Heading1>
      <label
        ref={dropZoneRef}
        className={`mt-8 border-2 flex items-center justify-center border-amber-400 h-80 cursor-pointer rounded-lg ${
          dropZoneText.isError && "text-(--error)"
        }`}
        onDrop={dropHandler}
      >
        {dropZoneText.text}
        <input
          className="hidden"
          onChange={changeHandler}
          type="file"
          accept=".step,.stp"
        />
      </label>

      <div className="mt-8 flex gap-4">
        <Button type="button" onClick={clearButtonHandler}>
          Clear
        </Button>
        <Button
          type="button"
          disabled={selectedFile == null || dropZoneText.isError}
        >
          Configure Materials
        </Button>
      </div>
    </main>
  );
}
