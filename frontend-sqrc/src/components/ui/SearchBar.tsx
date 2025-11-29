import React, { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import useDebouncedValue from "./useDebouncedValue";

interface SearchBarProps {
  value?: string;
  onChange: (q: string) => void;
  onSubmit?: (q: string) => void;
  placeholder?: string;
  debounceMs?: number;
  showClear?: boolean;
  className?: string;
  ariaLabel?: string;
}

export default function SearchBar({
  value = "",
  onChange,
  onSubmit,
  placeholder = "Buscar...",
  debounceMs = 300,
  showClear = true,
  className = "",
  ariaLabel = "Buscar",
}: SearchBarProps) {
  const [input, setInput] = useState<string>(value);
  const debounced = useDebouncedValue(input, debounceMs);

  useEffect(() => setInput(value), [value]);
  useEffect(() => onChange(debounced), [debounced]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onSubmit) onSubmit(input);
  };

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      <input
        aria-label={ariaLabel}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full pl-10 pr-8 py-2 bg-gray-50 border-none rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all"
      />
      {showClear && input && (
        <button
          onClick={() => {
            setInput("");
            onChange("");
          }}
          aria-label="Limpiar búsqueda"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
