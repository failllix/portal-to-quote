export default function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-2 py-1  bg-foreground text-background rounded-full">
      {children}
    </span>
  );
}
