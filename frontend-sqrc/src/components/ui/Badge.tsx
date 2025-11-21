import React from "react";

// Definimos variantes de color estándar para toda la app
const variants = {
  success: "bg-green-100 text-green-700 border-green-200",
  warning: "bg-yellow-100 text-yellow-700 border-yellow-200",
  danger: "bg-red-100 text-red-700 border-red-200",
  neutral: "bg-gray-100 text-gray-700 border-gray-200",
  blue: "bg-blue-100 text-blue-700 border-blue-200",
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: keyof typeof variants; // success, warning, etc.
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = "blue" }) => {
  const styles = variants[variant] || variants.blue;

  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles}`}
    >
      {children}
    </span>
  );
};
