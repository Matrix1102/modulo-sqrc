import React from "react";
import { Check } from "lucide-react";

interface ChannelMenuProps {
  channels: string[];
  selected?: string;
  onSelect: (channel: string) => void;
}

const ChannelMenu: React.FC<ChannelMenuProps> = ({
  channels,
  selected,
  onSelect,
}) => {
  if (!channels || channels.length === 0) return null;

  return (
    <div
      role="menu"
      aria-label="Seleccionar canal"
      className="py-1"
    >
      {channels.map((ch) => (
        <button
          key={ch}
          role="menuitem"
          onClick={() => onSelect(ch)}
          className={`flex items-center justify-between w-full px-3 py-2 text-sm text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none ${
            selected === ch ? "bg-primary-50" : ""
          }`}
        >
          <span className="truncate">{ch}</span>
          {selected === ch ? (
            <Check size={16} className="text-primary-600" />
          ) : null}
        </button>
      ))}
    </div>
  );
};

export default ChannelMenu;
