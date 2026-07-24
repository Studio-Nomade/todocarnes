"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export function ResponsiveCatalogFrame({
  children,
  maxScale = 1,
}: {
  children: ReactNode;
  maxScale?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(maxScale);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const updateScale = () => setScale(Math.min(maxScale, container.clientWidth / 1440));
    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(container);
    return () => observer.disconnect();
  }, [maxScale]);

  return (
    <div
      className="relative w-full overflow-hidden rounded-lg border border-ink/10 bg-white shadow-sm"
      ref={containerRef}
      style={{ aspectRatio: "16 / 9", maxWidth: 1440 * maxScale }}
    >
      <div
        className="absolute left-0 top-0 h-[810px] w-[1440px] origin-top-left"
        style={{ transform: `scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
}
