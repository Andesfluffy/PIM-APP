import type { ChangeEvent, InputHTMLAttributes } from "react";

type FormInputProps = {
  /**
   * Optional label displayed above the input.
   */
  label?: string;
  /**
   * Form control name. Also used as the input id when an id prop is not supplied.
   */
  name: string;
  /**
   * Current value for the input.
   */
  value: string;
  /**
   * Change handler invoked whenever the field mutates.
   */
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  /**
   * Optional supporting copy rendered beneath the field.
   */
  helperText?: string;
  /**
   * Validation message displayed under the field and reflected in accessibility attributes.
   */
  error?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "name">;

export default function FormInput({
  label,
  name,
  value,
  onChange,
  helperText,
  error,
  id,
  className = "",
  type = "text",
  required,
  ...rest
}: FormInputProps) {
  const inputId = id ?? name;
  const descriptionId = helperText ? `${inputId}-helper` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-semibold text-oxford-blue-500" htmlFor={inputId}>
          {label}
          {required && <span className="ml-1 text-red-crayola-500">*</span>}
        </label>
      )}
      <input
        id={inputId}
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        aria-invalid={Boolean(error)}
        aria-describedby={[descriptionId, errorId].filter(Boolean).join(" ") || undefined}
        required={required}
        className={`w-full rounded-xl border px-4 py-3 text-sm text-oxford-blue-500 placeholder:text-charcoal-400 focus:outline-none focus:ring-2 ${
          error
            ? "border-red-crayola-400 bg-red-crayola-900 focus:ring-red-crayola-200"
            : "border-tea-green-700 bg-white/85 focus:border-red-crayola-400 focus:ring-red-crayola-200"
        } ${className}`.trim()}
        {...rest}
      />
      {helperText && (
        <p id={descriptionId} className="text-xs text-charcoal-500">
          {helperText}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-xs font-medium text-red-crayola-500">
          {error}
        </p>
      )}
    </div>
  );
}
