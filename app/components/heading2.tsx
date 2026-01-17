export default function Heading2({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <h1 className={`text-2xl font-bold ${className}`}>{children}</h1>;
}
