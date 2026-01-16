export default function RadioButton({
  id,
  value,
  label,
  name,
  required,
  disabled,
}: {
  label: string;
  disabled?: boolean;
  id: string;
  name: string;
  value: string;
  required?: boolean;
}) {
  return (
    <div>
      <input
        type="radio"
        id={id}
        name={name}
        value={value}
        required={required}
        disabled={disabled}
      />
      <label htmlFor={id} className="ml-4">
        {label}
      </label>
    </div>
  );
}
