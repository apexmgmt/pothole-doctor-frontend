import React from "react";

const CustomButton = ({
  children,
  type = "button",
  variant = "primary", // primary, secondary, outline, ghost
  size = "md", // sm, md, lg
  icon,
  iconPosition = "left", // left, right
  fullWidth = false,
  className = "",
  disabled,
  onClick,
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer";

  const sizeClasses = {
    sm: "px-3 py-2 text-[12px] gap-2",
    md: "px-4 py-2.5 text-[14px] gap-2",
    lg: "px-6 py-3 text-[16px] gap-3",
  };

  const variantClasses = {
    primary:
      "bg-light text-dark hover:opacity-90 active:opacity-80 border border-light",
    secondary:
      "bg-bg-2 text-light border border-border hover:bg-light hover:text-dark active:bg-light active:text-dark",
    outline:
      "bg-transparent text-light border border-border hover:bg-bg-2/20 active:bg-bg-2/40",
    ghost: "bg-transparent text-light hover:bg-bg-2/20 active:bg-bg-2/40",
  };

  const widthClass = fullWidth ? "w-full" : "";

  const iconElement = icon && <span className="flex-shrink-0">{icon}</span>;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${className}`}
      {...props}
    >
      {iconPosition === "left" && iconElement}
      {children}
      {iconPosition === "right" && iconElement}
    </button>
  );
};

export default CustomButton;
