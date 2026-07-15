'use client';

import type { SketchSettings, SketchStyle } from '@/types';
import clsx from 'clsx';

const STYLES: { value: SketchStyle; label: string; blurb: string }[] = [
  { value: 'pencil', label: 'Pencil', blurb: 'Classic graphite linework' },
  { value: 'colored', label: 'Colored', blurb: 'Soft color pencil shading' },
  { value: 'charcoal', label: 'Charcoal', blurb: 'Heavy, textured strokes' },
  { value: 'cartoon', label: 'Cartoon', blurb: 'Bold ink outlines + flat color' },
];

const SLIDERS: { key: keyof SketchSettings; label: string }[] = [
  { key: 'intensity', label: 'Sketch intensity' },
  { key: 'contrast', label: 'Contrast' },
  { key: 'brightness', label: 'Brightness' },
  { key: 'edgeSharpness', label: 'Edge sharpness' },
];

export default function SketchControls({
  style,
  settings,
  onStyleChange,
  onSettingsChange,
}: {
  style: SketchStyle;
  settings: SketchSettings;
  onStyleChange: (s: SketchStyle) => void;
  onSettingsChange: (s: SketchSettings) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 font-mono text-xs uppercase tracking-wider text-ink-mist">Style</h3>
        <div className="grid grid-cols-2 gap-2">
          {STYLES.map((s) => (
            <button
              key={s.value}
              onClick={() => onStyleChange(s.value)}
              className={clsx(
                'rounded-xl border px-3 py-3 text-left transition',
                style === s.value
                  ? 'border-pencil-deep bg-pencil/15 dark:border-pencil dark:bg-pencil/10'
                  : 'border-ink/10 hover:border-ink/25 dark:border-paper/10 dark:hover:border-paper/25'
              )}
            >
              <div className="text-sm font-medium text-ink dark:text-paper">{s.label}</div>
              <div className="mt-0.5 text-xs text-ink-mist">{s.blurb}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-mono text-xs uppercase tracking-wider text-ink-mist">Adjust</h3>
        {SLIDERS.map(({ key, label }) => (
          <div key={key}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="text-ink dark:text-paper">{label}</span>
              <span className="font-mono text-xs text-ink-mist">{settings[key]}</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={settings[key]}
              onChange={(e) => onSettingsChange({ ...settings, [key]: Number(e.target.value) })}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-ink/10 accent-pencil-deep dark:bg-paper/10 dark:accent-pencil"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
