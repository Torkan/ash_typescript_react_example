import React from "react";

interface CheckboxInputProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  errors?: string[];
  id?: string;
  className?: string;
}

export default function CheckboxInput({
  label,
  checked,
  onChange,
  errors,
  id,
  className,
}: CheckboxInputProps) {
  const hasErrors = errors && errors.length > 0;

  return (
    <div className={`flex flex-col ${className || ""}`}>
      <div className="flex items-center">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mr-2"
        />
        <label
          htmlFor={id}
          className="text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      </div>
      {hasErrors && (
        <div className="mt-1">
          {errors.map((error, index) => (
            <p key={index} className="text-sm text-red-600">{error}</p>
          ))}
        </div>
      )}
    </div>
  );
}