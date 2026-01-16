import Checkbox from "./checkbox";

export default function CheckboxGroup({
  label,
  name,
  options,
}: {
  label: string;
  name: string;
  options: {
    label: string;
    id: string;
    value: string;
    required?: boolean;
  }[];
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name}>{label}</label>
      {options.map((option) => (
        <Checkbox
          key={option.id}
          id={option.id}
          label={option.label}
          name={name}
          value={option.value}
          required={option.required}
        ></Checkbox>
      ))}
    </div>
  );
}
