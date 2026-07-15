'use client';

import { useEffect, useRef, useState } from 'react';
import { renderSketchPreview } from '@/lib/canvasSketch';
import type { SketchStyle } from '@/types';

const DEMO_IMAGE = 'https://picsum.photos/seed/sketchify-hero/900/700';
const STYLES: SketchStyle[] = ['pencil', 'charcoal', 'cartoon'];

export default function HeroDemo() {
  const sourceRef = useRef<HTMLCanvasElement>(null);
  const targetRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [style, setStyle] = useState<SketchStyle>('pencil');
  const [reveal, setReveal] = useState(0);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = sourceRef.current!;
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext('2d')!.drawImage(img, 0, 0);
      setReady(true);
    };
    img.src = DEMO_IMAGE;
  }, []);

  useEffect(() => {
    if (!ready || !sourceRef.current || !targetRef.current) return;
    renderSketchPreview(sourceRef.current, targetRef.current, style, {
      intensity: 65,
      contrast: 55,
      brightness: 52,
      edgeSharpness: 60,
    });
  }, [ready, style]);

  useEffect(() => {
    if (!ready) return;
    let raf: number;
    const start = performance.now();
    const animate = (t: number) => {
      const pct = Math.min(100, ((t - start) / 1400) * 100);
      setReveal(pct);
      if (pct < 100) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [ready]);

  return (
    <div className="relative">
      <div className="relative aspect-[9/7] w-full overflow-hidden rounded-3xl border border-ink/10 bg-graphite-900 shadow-2xl">
        <canvas ref={sourceRef} className="hidden" />
        <img src={DEMO_IMAGE} alt="Original photo" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - reveal}% 0 0)` }}>
          <canvas ref={targetRef} className="h-full w-full object-cover" style={{ width: '100%', height: '100%' }} />
        </div>
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center bg-graphite-900 text-paper/60 text-sm font-mono">
            sketching…
          </div>
        )}
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 rounded-full bg-graphite-950/80 p-1.5 backdrop-blur">
          {STYLES.map((s) => (
            <button
              key={s}
              onClick={() => setStyle(s)}
              className={`rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide transition ${
                style === s ? 'bg-pencil text-ink' : 'text-paper/70 hover:text-paper'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-3 text-center font-mono text-xs text-ink-mist">
        Live in-browser preview · same engine ships in your upload flow
      </p>
    </div>
  );
}
