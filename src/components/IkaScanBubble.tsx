import React, { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import ika from "@/assets/ika.png";
// Key for localStorage to remember if the panel was open
const STORAGE_KEY = "ika-scan-bubble-open";
const SIZE_KEY = "ika-scan-bubble-size";

/**
 * Floating bubble that toggles an iframe panel to https://ikascan.io/mainnet/home
 * NOTE: Because the site is cross-origin, we cannot (without that site's cooperation)
 * introspect or persist the in-iframe navigation path. We only persist whether the
 * panel is open. If deeper state persistence is required, the external site must
 * send postMessage events we can store, or you can open it in a new tab.
 */
interface IkaScanBubbleProps {
  initialWidth?: number;
  initialHeight?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export const IkaScanBubble: React.FC<IkaScanBubbleProps> = ({
  initialWidth = 380,
  initialHeight = 520,
  minWidth = 300,
  minHeight = 320,
  maxWidth = 1200,
  maxHeight = 900,
}) => {
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState(() => {
    try {
      const raw = localStorage.getItem(SIZE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (
          typeof parsed?.w === "number" &&
          typeof parsed?.h === "number" &&
          parsed.w > 0 &&
          parsed.h > 0
        ) {
          return { w: parsed.w, h: parsed.h };
        }
      }
    } catch {/* ignore */}
    return { w: initialWidth, h: initialHeight };
  });

  const resizingRef = useRef<{
    startX: number;
    startY: number;
    startW: number;
    startH: number;
  } | null>(null);

  // Load persisted open state
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === "1") setOpen(true);
    } catch {/* ignore */}
  }, []);

  // Persist open state
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, open ? "1" : "0");
    } catch {/* ignore */}
  }, [open]);

  // Persist size
  useEffect(() => {
    try {
      localStorage.setItem(SIZE_KEY, JSON.stringify({ w: size.w, h: size.h }));
    } catch {/* ignore */}
  }, [size.w, size.h]);

  const toggle = useCallback(() => setOpen(o => !o), []);

  const onPointerDownResize = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    resizingRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startW: size.w,
      startH: size.h,
    };
  }, [size.w, size.h]);

  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!resizingRef.current) return;
    const { startX, startY, startW, startH } = resizingRef.current;
    // Since panel is anchored bottom-right, increasing drag left/up increases size
    const dx = startX - e.clientX; // moving left increases width
    const dy = startY - e.clientY; // moving up increases height
    let newW = startW + dx;
    let newH = startH + dy;
    newW = Math.min(Math.max(newW, minWidth), maxWidth);
    newH = Math.min(Math.max(newH, minHeight), maxHeight);
    setSize({ w: newW, h: newH });
  }, [minWidth, maxWidth, minHeight, maxHeight]);

  const onPointerUp = useCallback(() => {
    resizingRef.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [onPointerMove, onPointerUp]);

  const resetSize = useCallback(() => {
    setSize({ w: initialWidth, h: initialHeight });
  }, [initialWidth, initialHeight]);

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Panel */}
      <div
        className={cn(
          "transition-all duration-300",
          open
            ? "scale-100 opacity-100 translate-y-0"
            : "pointer-events-none scale-95 opacity-0 translate-y-2"
        )}
      >
        {open && (
          <div
            className="pointer-events-auto shadow-lg ring-1 ring-border/50 border border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70 rounded-lg flex flex-col overflow-hidden relative"
            style={{ width: size.w, height: size.h }}
          >
            <div
              className="flex items-center justify-between px-3 py-2 text-sm font-medium bg-muted/50 border-b border-border/60 select-none"
              onDoubleClick={resetSize}
              title="Double click to reset size"
            >
              <span>IkaScan</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.open("https://ikascan.io/mainnet/home", "_blank")}
                  className="text-xs px-2 py-1 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  Open in new tab
                </button>
                <button
                  onClick={toggle}
                  aria-label="Close IkaScan panel"
                  className="size-6 flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-xs"
                >
                  ×
                </button>
              </div>
            </div>
            <iframe
              title="IkaScan"
              src="https://ikascan.io/mainnet/home"
              className="flex-1 w-full h-full bg-white dark:bg-zinc-900"
              referrerPolicy="no-referrer"
            />
            {/* Resize handle */}
            <div
              onPointerDown={onPointerDownResize}
              role="separator"
              aria-label="Resize"
              className="absolute left-1 top-1/2 -translate-y-1/2 cursor-ew-resize w-2 rounded-full bg-transparent"
              title="Drag to resize"
            />
            <div
              onPointerDown={onPointerDownResize}
              role="separator"
              aria-label="Resize"
              className="absolute top-1 left-1 cursor-nwse-resize size-4 opacity-70 flex items-start justify-start"
            >
              <div className="border-l border-t border-border/60 w-3 h-3 pointer-events-none" />
            </div>
            <div
              onPointerDown={onPointerDownResize}
              role="separator"
              aria-label="Resize"
              className="absolute bottom-0 left-0 cursor-nwse-resize p-2 text-[10px] text-muted-foreground"
            >
              {Math.round(size.w)}×{Math.round(size.h)}
            </div>
          </div>
        )}
      </div>

      {/* Bubble Button */}
      <button
        onClick={toggle}
        aria-label="Toggle IkaScan"
        className={cn(
          "pointer-events-auto relative size-14 rounded-full shadow-xl border border-border/60 bg-gradient-to-br from-primary to-primary/70 text-primary-foreground flex items-center justify-center font-semibold text-sm transition-all",
          "hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          open && "ring-2 ring-ring"
        )}
      >
        <img src={ika} alt="IkaScan" className="w-13 h-13 rounded-full" />
      </button>
    </div>
  );
};

export default IkaScanBubble;