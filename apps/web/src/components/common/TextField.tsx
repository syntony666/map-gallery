import type { ChangeEvent, ReactNode } from "react";
import { FieldLabel } from "./FieldLabel";
import { inputClassName } from "../../utils/field-classes";

type TextFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "date" | "url";
  required?: boolean;
  /** Render a textarea instead of an input. */
  multiline?: boolean;
  rows?: number;
  /** Extra content rendered under the control (e.g. an image preview). */
  children?: ReactNode;
};

export function TextField({
  id,
  label,
  value,
  onChange,
  type = "text",
  required = false,
  multiline = false,
  rows,
  children,
}: TextFieldProps) {
  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => onChange(event.target.value);

  return (
    <div>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {multiline ? (
        <textarea
          id={id}
          rows={rows ?? 5}
          required={required}
          value={value}
          onChange={handleChange}
          className={`${inputClassName} w-full`}
        />
      ) : (
        <input
          id={id}
          type={type}
          required={required}
          value={value}
          onChange={handleChange}
          className={`${inputClassName} w-full`}
        />
      )}
      {children}
    </div>
  );
}
