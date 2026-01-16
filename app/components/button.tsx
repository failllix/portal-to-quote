import type React from "react";

export default function Button({
  children,
  onClick,
  type,
  disabled,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 border rounded-lg cursor-pointer ${
        disabled && "opacity-50"
      } ${className}`}
    >
      {children}
    </button>
  );
}
