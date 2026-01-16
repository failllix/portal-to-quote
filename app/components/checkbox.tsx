export default function Checkbox({
  label,
  id,
  name,
  value,
  required,
}: {
  label: string;
  id: string;
  name: string;
  value: string;
  required?: boolean;
}) {
  return (
    <div>
      <input
        type="checkbox"
        id={id}
        name={name}
        value={value}
        required={required}
      />
      <label htmlFor={id} className="ml-4">
        {label}
      </label>
    </div>
  );
}
