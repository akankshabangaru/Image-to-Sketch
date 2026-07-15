import Link from 'next/link';
import { Check } from 'lucide-react';

const PLANS = [
  { name: 'Free', price: '$0', features: [['20 sketches / month', true], ['All 4 styles', true], ['500MB storage', true], ['High-resolution export', false], ['Batch processing', false], ['API access', false]] },
  { name: 'Pro', price: '$9', highlighted: true, features: [['Unlimited sketches', true], ['All 4 styles', true], ['10GB storage', true], ['High-resolution export', true], ['Batch processing', false], ['API access', false]] },
  { name: 'Business', price: '$29', features: [['Unlimited sketches', true], ['All 4 styles', true], ['100GB storage', true], ['High-resolution export', true], ['Batch processing', true], ['API access', true]] },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="text-center">
        <h1 className="font-display text-5xl">Pricing that scales with your sketchbook</h1>
        <p className="mt-3 text-ink-muted dark:text-paper/70">Start free. Upgrade when you need more room to create.</p>
      </div>
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {PLANS.map((p) => (
          <div key={p.name} className={`rounded-2xl border p-8 ${p.highlighted ? 'border-2 border-pencil-deep dark:border-pencil' : 'border-ink/8 dark:border-paper/8'}`}>
            <h2 className="font-medium">{p.name}</h2>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-display text-4xl">{p.price}</span><span className="text-sm text-ink-mist">/mo</span>
            </div>
            <ul className="mt-6 space-y-3 text-sm">
              {p.features.map(([label, included]) => (
                <li key={label as string} className={`flex items-center gap-2 ${included ? '' : 'text-ink-mist line-through'}`}>
                  <Check size={14} className={included ? 'text-pencil-deep dark:text-pencil' : 'opacity-30'} /> {label}
                </li>
              ))}
            </ul>
            <Link href="/register" className={`mt-8 block rounded-full py-2.5 text-center text-sm font-medium ${p.highlighted ? 'bg-pencil text-ink' : 'border border-ink/15 dark:border-paper/15'}`}>
              Choose {p.name}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
