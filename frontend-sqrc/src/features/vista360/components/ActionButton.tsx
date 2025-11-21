import React from "react";

interface Props {
  onClick?: () => void;
  children?: React.ReactNode;
}

const ActionButton: React.FC<Props> = ({ onClick, children }) => {
  return (
    <button
      onClick={onClick}
      className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
    >
      {children}
    </button>
  );
};

export default ActionButton;
