import RadioButton from "./radio-button";

export default function RadioGroup({
  label,
  name,
  required,
  options,
}: {
  label: string;
  name: string;
  required?: boolean;
  options: {
    label: string;
    id: string;
    disabled?: boolean;
    value: string;
  }[];
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name}>{label}</label>
      {options.map((option) => (
        <RadioButton
          key={option.id}
          id={option.id}
          name={name}
          label={option.label}
          value={option.value}
          disabled={option.disabled}
          required={required}
        ></RadioButton>
      ))}
    </div>
  );
}
