import type React from "react";

export default function Button({
  children,
  onClick,
  type,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type: "button" | "submit" | "reset";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="px-4 py-2 border rounded-lg"
    >
      {children}
    </button>
  );
}
