import React, { useMemo, useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import { format } from "date-fns";

interface Props {
  onChange?: (params: { startDate?: string; endDate?: string }) => void;
  initialRange?: "today" | "week" | "month" | "custom";
}

export const DateRangeFilter: React.FC<Props> = ({ onChange, initialRange = "week" }) => {
  const [rangeType, setRangeType] = useState<"today" | "week" | "month" | "custom">(initialRange);
  const [range, setRange] = useState<[Date | null, Date | null]>([null, null]);
  const [showPicker, setShowPicker] = useState(false);
  const [tempRange, setTempRange] = useState<[Date | null, Date | null]>([null, null]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const params = useMemo(() => {
    const now = new Date();
    let start: Date | null = null;
    let end: Date | null = null;

    if (rangeType === "today") {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      end = start;
    } else if (rangeType === "week") {
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      start = new Date(end);
      start.setDate(end.getDate() - 6);
    } else if (rangeType === "month") {
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      start = new Date(end);
      start.setMonth(end.getMonth() - 1);
    } else if (rangeType === "custom") {
      start = range[0];
      end = range[1];
    }

    const toIso = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : undefined);
    return { startDate: toIso(start), endDate: toIso(end) };
  }, [rangeType, range]);

  useEffect(() => {
    onChange?.(params);
  }, [params.startDate, params.endDate, onChange]);

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <button
          className={`px-3 py-1 rounded ${
            rangeType === "today" ? "bg-primary-500 text-white" : "bg-light-100"
          }`}
          onClick={() => {
            setRangeType("today");
            setRange([null, null]);
          }}
        >
          Hoy
        </button>
        <button
          className={`px-3 py-1 rounded ${
            rangeType === "week" ? "bg-primary-600 text-white" : "bg-light-100"
          }`}
          onClick={() => {
            setRangeType("week");
            setRange([null, null]);
          }}
        >
          Última semana
        </button>
        <button
          className={`px-3 py-1 rounded ${
            rangeType === "month" ? "bg-primary-600 text-white" : "bg-light-100"
          }`}
          onClick={() => {
            setRangeType("month");
            setRange([null, null]);
          }}
        >
          Último mes
        </button>
        <div className="relative" ref={containerRef}>
          <button
            className={`px-3 py-1 rounded ${
              rangeType === "custom" ? "bg-primary-600 text-white" : "bg-light-100"
            }`}
            onClick={() => setShowPicker((s) => !s)}
          >
            Personalizado
          </button>

          {showPicker && (
            <div className="absolute right-0 mt-2 w-[340px] bg-white shadow-lg rounded border border-gray-100 p-3 z-50">
              <DatePicker
                selectsRange
                startDate={tempRange[0]}
                endDate={tempRange[1]}
                onChange={(update: [Date | null, Date | null]) => {
                  setTempRange(update);
                }}
                isClearable
                dateFormat="yyyy-MM-dd"
                className="w-full px-3 py-2 border border-neutral-200 rounded mb-3"
                placeholderText="Selecciona un rango"
              />
              <div className="flex justify-end gap-2">
                <button
                  className="px-3 py-1 rounded bg-white border border-gray-200 text-sm"
                  onClick={() => {
                    setTempRange([null, null]);
                  }}
                >
                  Limpiar
                </button>
                <button
                  className="px-3 py-1 rounded bg-primary-600 text-white text-sm"
                  onClick={() => {
                    setRange(tempRange);
                    setRangeType("custom");
                    setShowPicker(false);
                  }}
                >
                  Aplicar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        {rangeType === "custom" && (
          <div className="flex items-center gap-2">
            <div className="text-sm text-dark-700 px-3 py-1 bg-white border border-neutral-200 rounded">
              {range[0] ? format(range[0], "yyyy-MM-dd") : "-"}
            </div>
            <div className="text-sm text-dark-700">—</div>
            <div className="text-sm text-dark-700 px-3 py-1 bg-white border border-neutral-200 rounded">
              {range[1] ? format(range[1], "yyyy-MM-dd") : "-"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DateRangeFilter;
