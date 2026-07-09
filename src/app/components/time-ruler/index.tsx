import React from "react";

export interface TimeRulerProps {
  validFromMinutes: number;
  validToMinutes: number;
  disabled: boolean;
  rulerRef: React.RefObject<HTMLDivElement | null>;
  onFromMouseDown: (e: React.MouseEvent) => void;
  onToMouseDown: (e: React.MouseEvent) => void;
  onFromTimeChange: (time: string) => void;
  onToTimeChange: (time: string) => void;
}

// Precompute static arrays outside the component to avoid recreating them on every render.
// The ruler renders 25 hour labels + 25 ticks + dynamic dimmed regions + handles.
const HOUR_LABELS = Array.from({ length: 25 }, (_, i) => ({
  key: i,
  label: `${String(i % 24).padStart(2, "0")}:00`,
  left: `${(i / 24) * 100}%`,
}));

const HOUR_TICKS = Array.from({ length: 25 }, (_, i) => ({
  key: i,
  left: `${(i / 24) * 100}%`,
}));

/**
 * The 24-hour draggable time range ruler.
 * Contains hour labels, ticks, dimmed regions, and draggable handles.
 */
const TimeRuler = React.memo(function TimeRuler({
  validFromMinutes,
  validToMinutes,
  disabled,
  rulerRef,
  onFromMouseDown,
  onToMouseDown,
  onFromTimeChange,
  onToTimeChange,
}: TimeRulerProps) {
  return (
    <div
      ref={rulerRef}
      className={`relative h-7 rounded overflow-hidden cursor-default ${
        disabled ? "opacity-50 pointer-events-none" : ""
      }`}
      style={{ background: "linear-gradient(to bottom, #DCE8D8, #C8DEC8)" }}
    >
      {/* Hour labels */}
      {HOUR_LABELS.map(({ key, label, left }) => (
        <span
          key={key}
          className="absolute text-[8px] pointer-events-none text-[#204D4C]"
          style={{ left, transform: "translateX(-50%)", top: 2 }}
        >
          {label}
        </span>
      ))}

      {/* Hour ticks */}
      {HOUR_TICKS.map(({ key, left }) => (
        <div
          key={key}
          className="absolute pointer-events-none h-1.5"
          style={{
            left,
            width: 1,
            top: 12,
            backgroundColor: "rgba(32, 77, 76, 0.2)",
          }}
        />
      ))}

      {/* Dimmed left */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: 0,
          width: `${validFromMinutes / 1440 * 100}%`,
          top: 0,
          height: "100%",
          background: "rgba(32, 77, 76, 0.5)",
        }}
      />

      {/* Dimmed right */}
      <div
        className="absolute pointer-events-none"
        style={{
          right: 0,
          width: `${(1440 - validToMinutes) / 1440 * 100}%`,
          top: 0,
          height: "100%",
          background: "rgba(32, 77, 76, 0.5)",
        }}
      />

      {/* Selected range fill */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: `${validFromMinutes / 1440 * 100}%`,
          width: `${(validToMinutes - validFromMinutes) / 1440 * 100}%`,
          top: 0,
          height: "100%",
          background: "rgba(81, 160, 144, 0.15)",
        }}
      />

      {/* Handle tracks */}
      <div
        className="absolute h-4 pointer-events-none"
        style={{
          left: `${validFromMinutes / 1440 * 100}%`,
          width: 16,
          top: 10,
          transform: "translateX(-50%)",
        }}
      />
      <div
        className="absolute h-4 pointer-events-none"
        style={{
          left: `${validToMinutes / 1440 * 100}%`,
          width: 16,
          top: 10,
          transform: "translateX(-50%)",
        }}
      />

      {/* From handle */}
      <div
        className="absolute w-3 h-5 cursor-ew-resize rounded-sm"
        style={{
          left: `${validFromMinutes / 1440 * 100}%`,
          top: 10,
          transform: "translateX(-50%)",
          background: "#51A090",
        }}
        onMouseDown={(e) => onFromMouseDown(e)}
        onKeyDown={(e) => {
          const step = e.shiftKey ? 60 : 5;
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            const newMinutes = Math.max(0, validFromMinutes - step);
            const h = String(Math.floor(newMinutes / 60)).padStart(2, "0");
            const m = String(newMinutes % 60).padStart(2, "0");
            onFromTimeChange(`${h}:${m}`);
          }
          if (e.key === "ArrowRight") {
            e.preventDefault();
            const newMinutes = Math.min(1439, validFromMinutes + step);
            const h = String(Math.floor(newMinutes / 60)).padStart(2, "0");
            const m = String(newMinutes % 60).padStart(2, "0");
            onFromTimeChange(`${h}:${m}`);
          }
        }}
        tabIndex={0}
        role="slider"
        aria-label="From time"
        aria-valuemin={0}
        aria-valuemax={1439}
        aria-valuenow={validFromMinutes}
      >
        <div
          className="absolute w-1 h-4 bg-blue-400 rounded-full"
          style={{ left: "50%", top: 0, transform: "translateX(-50%)" }}
        />
      </div>

      {/* To handle */}
      <div
        className="absolute w-3 h-5 cursor-ew-resize rounded-sm"
        style={{
          left: `${validToMinutes / 1440 * 100}%`,
          top: 10,
          transform: "translateX(-50%)",
          background: "#51A090",
        }}
        onMouseDown={(e) => onToMouseDown(e)}
        onKeyDown={(e) => {
          const step = e.shiftKey ? 60 : 5;
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            const newMinutes = Math.max(0, validToMinutes - step);
            const h = String(Math.floor(newMinutes / 60)).padStart(2, "0");
            const m = String(newMinutes % 60).padStart(2, "0");
            onToTimeChange(`${h}:${m}`);
          }
          if (e.key === "ArrowRight") {
            e.preventDefault();
            const newMinutes = Math.min(1439, validToMinutes + step);
            const h = String(Math.floor(newMinutes / 60)).padStart(2, "0");
            const m = String(newMinutes % 60).padStart(2, "0");
            onToTimeChange(`${h}:${m}`);
          }
        }}
        tabIndex={0}
        role="slider"
        aria-label="To time"
        aria-valuemin={0}
        aria-valuemax={1439}
        aria-valuenow={validToMinutes}
      >
        <div
          className="absolute w-1 h-4 bg-blue-400 rounded-full"
          style={{ left: "50%", top: 0, transform: "translateX(-50%)" }}
        />
      </div>

      {/* Subtle inner shadow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ boxShadow: "inset 0 1px 2px rgba(0,0,0,0.08)" }}
      />
    </div>
  );
});

export default TimeRuler;
