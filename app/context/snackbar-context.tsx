"use client";

import React, { createContext, useCallback, useContext, useState } from "react";

interface SnackbarContextType {
  (message: string, variant?: "error", duration?: number): void;
}

interface SnackBarMessage {
  id: string;
  message: string;
  variant: "error";
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(
  undefined,
);

export default function SnackbarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [snackbarItems, setSnackbarItems] = useState<SnackBarMessage[]>([]);

  const showSnackbar = useCallback<SnackbarContextType>(
    (message, variant = "error", duration = 3000) => {
      const id = crypto.randomUUID();
      setSnackbarItems((currentItems) => {
        const newItems = [...currentItems, { message, variant, id }];
        return newItems;
      });

      setTimeout(() => {
        setSnackbarItems((currentSnackbars) => {
          const filteredSnackBars = [...currentSnackbars].filter(
            (item) => item.id !== id,
          );
          return filteredSnackBars;
        });
      }, duration);
    },
    [],
  );

  return (
    <SnackbarContext.Provider value={showSnackbar}>
      {children}
      <div className="flex flex-col fixed bottom-8 left-8 gap-2">
        {snackbarItems.map((snackbarItem) => {
          return (
            <div
              key={snackbarItem.id}
              className={`bg-foreground text-background items-center shadow-md  max-w-[50vw] px-4 py-2 rounded-lg whitespace-nowrap ${snackbarItem?.variant === "error" && "bg-red-500 text-white"}`}
            >
              {snackbarItem.message}
            </div>
          );
        })}
      </div>
    </SnackbarContext.Provider>
  );
}

export const useSnackbar = (): SnackbarContextType => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error("useSnackbar must be used within a SnackbarProvider");
  }
  return context;
};
