import { useState, useRef, useCallback, useEffect } from "react";

export type RulerDragHandle = "from" | "to" | null;

export interface RulerDragState {
  isDragging: boolean;
  dragHandle: RulerDragHandle;
  handleRulerMouseDown: (e: React.MouseEvent, handle: "from" | "to") => void;
}

/**
 * Handles mouse drag logic for the time range ruler.
 * Attaches window-level mousemove/mouseup listeners while dragging.
 */
export function useRulerDrag(
  rulerRef: React.RefObject<HTMLDivElement | null>,
  fromTimeRef: React.RefObject<string>,
  toTimeRef: React.RefObject<string>,
  fromTimeSetter: (t: string) => void,
  toTimeSetter: (t: string) => void
): RulerDragState {
  const [isDragging, setIsDragging] = useState(false);
  const [dragHandle, setDragHandle] = useState<RulerDragHandle>(null);
  const isDraggingRef = useRef(isDragging);
  const dragHandleRef = useRef(dragHandle);

  // Keep refs in sync with state for use in event handlers
  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);

  useEffect(() => {
    dragHandleRef.current = dragHandle;
  }, [dragHandle]);

  const handleRulerMouseDown = useCallback(
    (e: React.MouseEvent, handle: "from" | "to") => {
      e.preventDefault();
      setIsDragging(true);
      setDragHandle(handle);
    },
    []
  );

  useEffect(() => {
    if (!isDragging || !dragHandle || !rulerRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = rulerRef.current!.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const minutes = Math.round(ratio * 1440);

      if (dragHandle === "from") {
        const toTimeParts = toTimeRef.current.split(":");
        const toMinutes = parseInt(toTimeParts[0], 10) * 60 + parseInt(toTimeParts[1], 10);
        const clamped = Math.min(minutes, toMinutes - 1);
        const h = String(Math.floor(clamped / 60)).padStart(2, "0");
        const m = String(clamped % 60).padStart(2, "0");
        fromTimeSetter(`${h}:${m}`);
      } else {
        const fromTimeParts = fromTimeRef.current.split(":");
        const fromMinutes = parseInt(fromTimeParts[0], 10) * 60 + parseInt(fromTimeParts[1], 10);
        const clamped = Math.max(minutes, fromMinutes + 1);
        const h = String(Math.floor(clamped / 60)).padStart(2, "0");
        const m = String(clamped % 60).padStart(2, "0");
        toTimeSetter(`${h}:${m}`);
      }
    };

    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        setIsDragging(false);
        setDragHandle(null);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragHandle, rulerRef, fromTimeRef, toTimeRef, fromTimeSetter, toTimeSetter]);

  return { isDragging, dragHandle, handleRulerMouseDown };
}
