'use client';

import { useRef, useState, useCallback } from 'react';
import { Maximize2 } from 'lucide-react';

export default function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  onFullscreen,
}: {
  beforeSrc: string;
  afterSrc: string;
  onFullscreen?: () => void;
}) {
  const [pos, setPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(100, Math.max(0, pct)));
  }, []);

  return (
    <div
      ref={containerRef}
      className="group relative aspect-[4/3] w-full select-none overflow-hidden rounded-2xl border border-ink/10 bg-graphite-900 dark:border-paper/10"
      onMouseDown={(e) => {
        dragging.current = true;
        updateFromClientX(e.clientX);
      }}
      onMouseMove={(e) => dragging.current && updateFromClientX(e.clientX)}
      onMouseUp={() => (dragging.current = false)}
      onMouseLeave={() => (dragging.current = false)}
      onTouchStart={(e) => updateFromClientX(e.touches[0].clientX)}
      onTouchMove={(e) => updateFromClientX(e.touches[0].clientX)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={afterSrc} alt="Sketch result" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={beforeSrc}
          alt="Original"
          className="h-full object-cover"
          style={{ width: containerRef.current?.clientWidth ?? '100%', maxWidth: 'none' }}
          draggable={false}
        />
      </div>

      <div
        className="absolute inset-y-0 w-0.5 bg-pencil"
        style={{ left: `${pos}%` }}
      >
        <div className="absolute top-1/2 left-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-pencil text-ink shadow-lg">
          <div className="flex gap-0.5">
            <div className="h-3 w-0.5 bg-ink/60" />
            <div className="h-3 w-0.5 bg-ink/60" />
          </div>
        </div>
      </div>

      <span className="absolute left-3 top-3 rounded-full bg-graphite-950/70 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-paper">
        Original
      </span>
      <span className="absolute right-3 top-3 rounded-full bg-pencil/90 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-ink">
        Sketch
      </span>

      {onFullscreen && (
        <button
          onClick={onFullscreen}
          className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-graphite-950/70 text-paper opacity-0 transition group-hover:opacity-100"
          aria-label="Fullscreen"
        >
          <Maximize2 size={15} />
        </button>
      )}
    </div>
  );
}
