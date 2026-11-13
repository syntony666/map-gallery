import type { ReactNode } from "react";

type FieldLabelProps = {
  /** `label` for a single control; `span` when labelling a control group. */
  as?: "label" | "span";
  htmlFor?: string;
  className?: string;
  children: ReactNode;
};

export function FieldLabel({
  as: Tag = "label",
  className = "",
  children,
  ...rest
}: FieldLabelProps) {
  return (
    <Tag
      className={`mb-1 block text-sm font-medium text-ink ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
