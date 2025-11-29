import React, { useMemo, useState, useEffect } from "react";
import DatePicker from "react-datepicker";

interface Props {
  onChange?: (params: { startDate?: string; endDate?: string }) => void;
  initialRange?: "today" | "week" | "month" | "custom";
}

export const DateRangeFilter: React.FC<Props> = ({ onChange, initialRange = "week" }) => {
  const [rangeType, setRangeType] = useState<"today" | "week" | "month" | "custom">(initialRange);
  const [range, setRange] = useState<[Date | null, Date | null]>([null, null]);

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
            rangeType === "week" ? "bg-primary-500 text-white" : "bg-light-100"
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
            rangeType === "month" ? "bg-primary-500 text-white" : "bg-light-100"
          }`}
          onClick={() => {
            setRangeType("month");
            setRange([null, null]);
          }}
        >
          Último mes
        </button>
        <button
          className={`px-3 py-1 rounded ${
            rangeType === "custom" ? "bg-primary-500 text-white" : "bg-light-100"
          }`}
          onClick={() => setRangeType("custom")}
        >
          Personalizado
        </button>
      </div>

      <div>
        {rangeType === "custom" && (
          <div className="flex items-center gap-2">
            <DatePicker
              selectsRange
              startDate={range[0]}
              endDate={range[1]}
              onChange={(update: [Date | null, Date | null]) => {
                setRange(update);
              }}
              isClearable
              dateFormat="yyyy-MM-dd"
              showPopperArrow
              popperPlacement="bottom-start"
              popperClassName="react-datepicker-custom-popper"
              className="px-3 py-1 border border-neutral-200 rounded bg-light-100 text-dark-900 focus:outline-none focus:ring-2 focus:ring-primary-400"
              placeholderText="Selecciona un rango"
            />
            <div className="text-sm text-dark-700">
              {range[0] ? range[0].toISOString().slice(0, 10) : "-"} — {range[1] ? range[1].toISOString().slice(0, 10) : "-"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DateRangeFilter;
