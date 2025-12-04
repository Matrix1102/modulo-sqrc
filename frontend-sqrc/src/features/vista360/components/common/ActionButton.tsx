import React from "react";

interface Props {
  onClick?: () => void;
  children?: React.ReactNode;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  className?: string;
}

const ActionButton: React.FC<Props> = ({ 
  onClick, 
  children, 
  disabled,
  variant = "primary",
  className = ""
}) => {
  const baseStyles = "mt-4 w-full rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantStyles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "border border-gray-300 text-gray-700 hover:bg-gray-50"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default ActionButton;
