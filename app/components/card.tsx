export default function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-foreground p-4 rounded-lg">{children}</div>
  );
}
