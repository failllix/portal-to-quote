export default function Input({
  label,
  id,
  name,
  required,
}: {
  label: string;
  id: string;
  name: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id}>{label}</label>
      <input
        type="text"
        className="bg-foreground text-background px-2 py 1 rounded-sm"
        id={id}
        name={name}
        required={required}
      />
    </div>
  );
}
