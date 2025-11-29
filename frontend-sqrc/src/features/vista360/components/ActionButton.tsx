import React from "react";

interface Props {
  onClick?: () => void;
  children?: React.ReactNode;
  disabled?: boolean;
}

const ActionButton: React.FC<Props> = ({ onClick, children, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
};

export default ActionButton;
