import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  title: string;
  defaultOpen?: boolean;
  children?: React.ReactNode;
}

const CollapsibleSection: React.FC<Props> = ({ title, defaultOpen = true, children }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen((s) => !s)}
        className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
      >
        <span className="font-medium">{title}</span>
        <span>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {open && <div className="mt-3">{children}</div>}
    </div>
  );
};

export default CollapsibleSection;
