import Link from 'next/link';
import { ArrowRight, PenTool, Palette, Brush, Clapperboard, Sliders, Zap, Shield, Download } from 'lucide-react';
import HeroDemo from '@/components/HeroDemo';
import PencilUnderline from '@/components/PencilUnderline';
import Card from '@/components/ui/Card';

const FEATURES = [
  { icon: PenTool, title: 'Four sketch styles', text: 'Pencil, colored, charcoal, and cartoon — each with its own texture and stroke behavior, not just a filter swap.' },
  { icon: Sliders, title: 'Fine-grained control', text: 'Dial in intensity, contrast, brightness, and edge sharpness until the sketch matches what you pictured.' },
  { icon: Zap, title: 'Fast processing', text: 'A dedicated OpenCV pipeline converts most images in under two seconds.' },
  { icon: Shield, title: 'Private by default', text: 'Your photos are yours. Delete any upload and its sketch permanently, any time.' },
  { icon: Download, title: 'Export anywhere', text: 'Download in PNG or JPG, or share straight to social from the results page.' },
  { icon: Clapperboard, title: 'Full history', text: 'Every conversion is saved to your dashboard so you can revisit, favorite, or re-export later.' },
];

const STEPS = [
  { title: 'Upload a photo', text: 'Drag in a PNG, JPG, or WEBP — up to 10MB.' },
  { title: 'Pick a style & adjust', text: 'Choose pencil, colored, charcoal, or cartoon, then fine-tune the sliders.' },
  { title: 'Download your sketch', text: 'Compare before/after, then export or share the result.' },
];

const TESTIMONIALS = [
  { quote: 'I turned my dog into a charcoal portrait and printed it — looks hand-drawn.', name: 'Priya N.', role: 'Hobbyist illustrator' },
  { quote: 'The edge sharpness control is the difference between a filter and an actual sketch.', name: 'Marcus O.', role: 'Product designer' },
  { quote: 'Fast enough that I use it to storyboard client concepts on the fly.', name: 'Elena R.', role: 'Freelance creative director' },
];

const PLANS = [
  { name: 'Free', price: '$0', period: '/mo', features: ['20 sketches / month', 'All 4 styles', '500MB storage', 'Standard resolution'] },
  { name: 'Pro', price: '$9', period: '/mo', highlighted: true, features: ['Unlimited sketches', 'All 4 styles', '10GB storage', 'High resolution export', 'Priority processing'] },
  { name: 'Business', price: '$29', period: '/mo', features: ['Everything in Pro', 'Batch processing', '100GB storage', 'API access', 'Team seats'] },
];

const FAQS = [
  { q: 'What image formats are supported?', a: 'PNG, JPG, JPEG, and WEBP, up to 10MB per file.' },
  { q: 'Is my data kept private?', a: 'Yes. Only you can see your uploads and sketches, and you can permanently delete either at any time from your dashboard.' },
  { q: 'Can I use Sketchify AI on mobile?', a: 'The app is fully responsive and works in any modern mobile browser.' },
  { q: 'Do you offer an API?', a: 'API access is included on the Business plan for programmatic batch conversion.' },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-16 md:pt-24">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="animate-fade-up">
            <span className="font-mono text-xs uppercase tracking-widest text-pencil-deep dark:text-pencil">
              AI-powered · image-to-sketch
            </span>
            <h1 className="mt-4 font-display text-5xl leading-[1.05] md:text-6xl">
              Every photo has a <PencilUnderline>sketch</PencilUnderline> hiding inside it.
            </h1>
            <p className="mt-6 max-w-md text-lg text-ink-muted dark:text-paper/70">
              Sketchify AI turns ordinary photos into pencil, charcoal, colored, or cartoon
              sketches in seconds — with real controls, not just a one-click filter.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/register" className="group inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-medium text-paper transition hover:bg-pencil hover:text-ink dark:bg-pencil dark:text-ink">
                Start sketching free
                <ArrowRight size={16} className="transition group-hover:translate-x-1" />
              </Link>
              <a href="#how-it-works" className="text-sm font-medium text-ink-muted hover:text-ink dark:text-paper/70 dark:hover:text-paper">
                See how it works
              </a>
            </div>
          </div>
          <HeroDemo />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-ink/8 bg-paper-dim/40 py-24 dark:border-paper/8 dark:bg-graphite-900/40">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-lg">
            <h2 className="font-display text-4xl">Built like a sketchbook, not a filter preset</h2>
            <p className="mt-3 text-ink-muted dark:text-paper/70">Everything you need to go from photo to finished sketch, and back to your dashboard for safekeeping.</p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <Card key={f.title} className="p-6">
                <f.icon size={20} className="text-pencil-deep dark:text-pencil" />
                <h3 className="mt-4 font-medium">{f.title}</h3>
                <p className="mt-2 text-sm text-ink-muted dark:text-paper/60">{f.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="font-display text-4xl">Three steps, start to sketch</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.title} className="relative">
                <span className="font-display text-6xl text-pencil/40">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-2 text-lg font-medium">{s.title}</h3>
                <p className="mt-2 text-sm text-ink-muted dark:text-paper/60">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t border-ink/8 bg-paper-dim/40 py-24 dark:border-paper/8 dark:bg-graphite-900/40">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="font-display text-4xl">People sketching with it</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <Card key={t.name} className="p-6">
                <Palette size={18} className="text-pencil-deep dark:text-pencil" />
                <p className="mt-4 text-sm italic text-ink dark:text-paper">&ldquo;{t.quote}&rdquo;</p>
                <p className="mt-4 text-xs font-mono text-ink-mist">{t.name} · {t.role}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing-preview" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="font-display text-4xl">Simple pricing</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {PLANS.map((p) => (
              <Card
                key={p.name}
                className={`p-8 ${p.highlighted ? 'border-2 border-pencil-deep dark:border-pencil' : ''}`}
              >
                <h3 className="font-medium">{p.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-display text-4xl">{p.price}</span>
                  <span className="text-sm text-ink-mist">{p.period}</span>
                </div>
                <ul className="mt-6 space-y-2 text-sm text-ink-muted dark:text-paper/70">
                  {p.features.map((f) => <li key={f}>· {f}</li>)}
                </ul>
                <Link
                  href="/register"
                  className={`mt-8 block rounded-full py-2.5 text-center text-sm font-medium transition ${
                    p.highlighted ? 'bg-pencil text-ink hover:bg-pencil-soft' : 'border border-ink/15 text-ink hover:border-pencil dark:border-paper/15 dark:text-paper'
                  }`}
                >
                  Choose {p.name}
                </Link>
              </Card>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-ink-mist">
            Full plan comparison on the <Link href="/pricing" className="underline">pricing page</Link>.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-ink/8 bg-paper-dim/40 py-24 dark:border-paper/8 dark:bg-graphite-900/40">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="font-display text-4xl">Questions, answered</h2>
          <div className="mt-10 divide-y divide-ink/8 dark:divide-paper/8">
            {FAQS.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
                  {f.q}
                  <Brush size={16} className="text-ink-mist transition group-open:rotate-45" />
                </summary>
                <p className="mt-3 text-sm text-ink-muted dark:text-paper/60">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section id="contact" className="py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-display text-4xl">Ready to see your photos sketched?</h2>
          <p className="mt-3 text-ink-muted dark:text-paper/70">Free to start. No credit card required.</p>
          <Link href="/register" className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-8 py-3.5 text-sm font-medium text-paper hover:bg-pencil hover:text-ink dark:bg-pencil dark:text-ink">
            Get started free <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
