import { PenTool, Users, Sparkles } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-5xl">About Sketchify AI</h1>
      <p className="mt-5 text-lg text-ink-muted dark:text-paper/70">
        Sketchify AI started from a simple observation: most photo filters make an image look
        processed, not drawn. We wanted the actual texture of graphite, charcoal, and ink — the
        kind of imperfection that makes a sketch feel made by hand.
      </p>
      <div className="mt-12 grid gap-8 sm:grid-cols-3">
        <div>
          <PenTool className="text-pencil-deep dark:text-pencil" size={22} />
          <h3 className="mt-3 font-medium">Craft over filters</h3>
          <p className="mt-1 text-sm text-ink-mist">Each style is a distinct image-processing pipeline, tuned for its own medium.</p>
        </div>
        <div>
          <Sparkles className="text-pencil-deep dark:text-pencil" size={22} />
          <h3 className="mt-3 font-medium">Built for control</h3>
          <p className="mt-1 text-sm text-ink-mist">Intensity, contrast, brightness, and edge sharpness are all yours to adjust.</p>
        </div>
        <div>
          <Users className="text-pencil-deep dark:text-pencil" size={22} />
          <h3 className="mt-3 font-medium">Made for everyone</h3>
          <p className="mt-1 text-sm text-ink-mist">From quick social posts to gifts you can print and frame.</p>
        </div>
      </div>
    </div>
  );
}
