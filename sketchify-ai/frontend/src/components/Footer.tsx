'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PenLine } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();
  const hideOn = ['/login', '/register', '/forgot-password'];
  if (hideOn.includes(pathname)) return null;

  return (
    <footer className="border-t border-ink/8 dark:border-paper/8 bg-paper dark:bg-graphite-950">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 font-display text-xl italic">
              <PenLine size={18} className="text-pencil-deep dark:text-pencil" />
              Sketchify AI
            </div>
            <p className="mt-3 max-w-xs text-sm text-ink-muted dark:text-paper/60">
              Every photo has a sketch hiding inside it. We just draw it out.
            </p>
          </div>
          <div>
            <h4 className="mb-3 font-mono text-xs uppercase tracking-wider text-ink-mist">Product</h4>
            <ul className="space-y-2 text-sm text-ink-muted dark:text-paper/60">
              <li><a href="/#features">Features</a></li>
              <li><a href="/#how-it-works">How it works</a></li>
              <li><Link href="/pricing">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-mono text-xs uppercase tracking-wider text-ink-mist">Company</h4>
            <ul className="space-y-2 text-sm text-ink-muted dark:text-paper/60">
              <li><Link href="/about">About</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-mono text-xs uppercase tracking-wider text-ink-mist">Legal</h4>
            <ul className="space-y-2 text-sm text-ink-muted dark:text-paper/60">
              <li><a href="#">Privacy</a></li>
              <li><a href="#">Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-ink/8 dark:border-paper/8 pt-6 text-xs text-ink-mist">
          © {new Date().getFullYear()} Sketchify AI. Built as a demo full-stack application.
        </div>
      </div>
    </footer>
  );
}
