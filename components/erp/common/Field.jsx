import { EyeCloseIcon, EyeOpenIcon } from "@/public/icons/icons";
import React, { useMemo, useState } from "react";

/**
 * Reusable Field component
 * Supports: text, email, password (with show/hide), select, checkbox, radio, textarea
 * Tailwind classes use your theme tokens (bg-bg-2, text-gray, text-light-2, border-border)
 */
const Field = ({
  // common
  type = "text",
  label,
  name,
  value,
  onChange,
  placeholder,
  required,
  disabled,
  onBlur,
  // select / radio / checkbox
  options = [], // [{ value: string, label: string }]
  // textarea
  rows = 4,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const labelClass = useMemo(
    () => "block text-[14px] font-medium text-light-2 font-inter",
    []
  );

  const baseFieldClass = useMemo(
    () =>
      [
        "w-full appearance-none outline-none",
        "px-3 py-2 rounded-lg",
        "border border-border",
        "bg-bg-2 text-light text-[14px] font-normal font-inter",
        "placeholder:text-gray",
      ].join(" "),
    []
  );

  const renderTextLike = (resolvedType) => (
    <div className="relative">
      <input
        type={resolvedType}
        name={name}
        value={value}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        onChange={onChange}
        onBlur={onBlur}
        className={baseFieldClass}
      />
      {type === "password" && (
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          aria-label={showPassword ? "Hide password" : "Show password"}
          title={showPassword ? "Hide password" : "Show password"}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray hover:text-light-2 cursor-pointer"
        >
          {showPassword ? EyeCloseIcon : EyeOpenIcon}
        </button>
      )}
    </div>
  );

  const renderSelect = () => (
    <select
      name={name}
      value={value}
      required={required}
      disabled={disabled}
      onChange={onChange}
      onBlur={onBlur}
      className={baseFieldClass}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="text-dark">
          {opt.label}
        </option>
      ))}
    </select>
  );

  const renderCheckboxGroup = () => {
    // Supports single or multiple checkbox via value array
    const current = Array.isArray(value) ? value : value ? [value] : [];
    const handleToggle = (val) => {
      if (!onChange) return;
      let next;
      if (current.includes(val)) {
        next = current.filter((v) => v !== val);
      } else {
        next = [...current, val];
      }
      onChange({ target: { name, value: next } });
    };
    return (
      <div className="grid gap-2">
        {options.length > 0 ? (
          options.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-3 text-[14px] text-gray cursor-pointer select-none group"
            >
              <input
                type="checkbox"
                checked={current.includes(opt.value)}
                onChange={() => handleToggle(opt.value)}
                className="peer sr-only"
              />
              <span
                className="relative inline-flex size-5 items-center justify-center rounded-sm border border-border bg-light/10
                transition-colors duration-150
                peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-light
                peer-checked:border-light peer-checked:bg-bg/60"
              >
                <svg
                  className="absolute w-3 h-3 text-light opacity-0 group-has-[input:checked]:opacity-100 transition-opacity duration-150 pointer-events-none z-10"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <span className="text-light-2">{opt.label}</span>
            </label>
          ))
        ) : (
          <label className="flex items-center gap-3 text-[14px] text-gray cursor-pointer select-none group">
            <input
              type="checkbox"
              name={name}
              checked={!!value}
              onChange={onChange}
              className="peer sr-only"
            />
            <span
              className="relative inline-flex size-5 items-center justify-center rounded-sm border border-border bg-light/10
              transition-colors duration-150
              peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-light
              peer-checked:border-light peer-checked:bg-bg/60"
            >
              <svg
                className="absolute w-3 h-3 text-light opacity-0 group-has-[input:checked]:opacity-100 transition-opacity duration-150 pointer-events-none z-10"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <span className="text-light-2">{placeholder}</span>
          </label>
        )}
      </div>
    );
  };

  const renderRadioGroup = () => (
    <div className="grid gap-2">
      {options.map((opt) => (
        <label
          key={opt.value}
          className="flex items-center gap-2 text-[14px] text-gray"
        >
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={onChange}
            className="size-4 accent-light"
          />
          {opt.label}
        </label>
      ))}
    </div>
  );

  const renderTextarea = () => (
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      rows={rows}
      required={required}
      disabled={disabled}
      className={`${baseFieldClass} resize-y`}
    />
  );

  const content = useMemo(() => {
    if (type === "textarea") return renderTextarea();
    if (type === "select") return renderSelect();
    if (type === "checkbox") return renderCheckboxGroup();
    if (type === "radio") return renderRadioGroup();
    if (type === "password")
      return renderTextLike(showPassword ? "text" : "password");
    // text/email
    return renderTextLike(type);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, value, showPassword, options, placeholder, disabled, required]);

  return (
    <div className="grid gap-2 mb-3">
      {label ? <label className={labelClass}>{label}</label> : null}
      {content}
    </div>
  );
};

export default Field;
