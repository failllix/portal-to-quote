export default function Heading1({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <h1 className={`text-4xl font-bold ${className}`}>{children}</h1>;
}
