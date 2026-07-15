'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <h1 className="font-display text-4xl">Get in touch</h1>
      <p className="mt-2 text-ink-mist">Questions, feedback, or partnership ideas — we read everything.</p>

      {sent ? (
        <div className="mt-8 rounded-2xl border border-ink/8 p-6 text-center dark:border-paper/8">
          <Mail className="mx-auto text-pencil-deep dark:text-pencil" size={24} />
          <p className="mt-3 font-medium">Thanks — we&apos;ll get back to you soon.</p>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
          className="mt-8 space-y-4"
        >
          <Input label="Name" required placeholder="Jane Doe" />
          <Input label="Email" type="email" required placeholder="you@example.com" />
          <div>
            <label className="mb-1.5 block text-sm font-medium">Message</label>
            <textarea
              required
              rows={5}
              placeholder="How can we help?"
              className="w-full rounded-xl border border-ink/15 bg-paper-card px-4 py-2.5 text-sm outline-none focus:border-pencil-deep dark:border-paper/15 dark:bg-graphite-800 dark:focus:border-pencil"
            />
          </div>
          <Button type="submit" className="w-full">Send message</Button>
        </form>
      )}
    </div>
  );
}
