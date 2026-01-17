"use client";

import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import type React from "react";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { startFileProcessing } from "./actions";
import Button from "./components/button";
import Heading1 from "./components/heading1";
import LoadingSpinner from "./components/loading-spinner";

interface DropZoneText {
  text: string;
  isError: boolean;
}

export default function Home() {
  const router = useRouter();

  const dropZoneDefaultText =
    "Drop your .step or .stp file here, or click to upload.";
  const [dropZoneText, setDropZoneText] = useState<DropZoneText>({
    text: dropZoneDefaultText,
    isError: false,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const dropZoneRef = useRef<HTMLLabelElement>(null);

  async function handleUpload() {
    if (selectedFile === null) {
      return;
    }

    setIsLoading(true);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    );

    const fileId = crypto.randomUUID();
    const storagePath = `stepFiles/${fileId}`;

    const fileBody = await selectedFile.text();

    const { error } = await supabase.storage
      .from("uploads")
      .upload(storagePath, fileBody, {
        upsert: true,
      });

    if (error) {
      throw error;
    }

    const result = await startFileProcessing({
      fileId,
      storagePath,
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
    });

    router.push(`/material-selection/${result.id}`);
    setIsLoading(false);
  }

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
          (item) => item.kind === "file",
        )
      ) {
        event.preventDefault();
      }
    };

    const onDragOver = (event: DragEvent) => {
      const fileItems = [...(event.dataTransfer?.items ?? [])].filter(
        (item) => item.kind === "file",
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
    <main className="px-12 mx-auto max-w-300">
      <Heading1>File upload</Heading1>
      <label
        ref={dropZoneRef}
        className={`mt-8 border-2 flex items-center justify-center border-foreground h-80 cursor-pointer rounded-lg ${
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

      <div className="mt-8 flex gap-4 items-center">
        <Button type="button" onClick={clearButtonHandler}>
          Clear
        </Button>
        <Button
          type="button"
          disabled={selectedFile == null || dropZoneText.isError || isLoading}
          onClick={handleUpload}
        >
          Upload
        </Button>
        {isLoading && <LoadingSpinner></LoadingSpinner>}
      </div>
    </main>
  );
}
