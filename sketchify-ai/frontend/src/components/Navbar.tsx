'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X, PenLine } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from './ThemeToggle';

const links = [
  { href: '/#features', label: 'Features' },
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const hideOn = ['/login', '/register', '/forgot-password'];
  if (hideOn.includes(pathname)) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-ink/8 dark:border-paper/8 bg-paper/90 dark:bg-graphite-950/90 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-display text-2xl italic">
          <PenLine size={20} className="text-pencil-deep dark:text-pencil" strokeWidth={2.2} />
          Sketchify <span className="not-italic text-pencil-deep dark:text-pencil">AI</span>
        </Link>

        <div className="hidden items-center gap-8 text-sm md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-ink-muted transition hover:text-ink dark:text-paper/70 dark:hover:text-paper">
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {!loading && !user && (
            <>
              <Link href="/login" className="rounded-full px-4 py-2 text-sm font-medium text-ink dark:text-paper hover:text-pencil-deep dark:hover:text-pencil">
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-paper transition hover:bg-pencil hover:text-ink dark:bg-pencil dark:text-ink dark:hover:bg-pencil-soft"
              >
                Get started
              </Link>
            </>
          )}
          {!loading && user && (
            <>
              <Link href="/dashboard" className="rounded-full px-4 py-2 text-sm font-medium text-ink dark:text-paper hover:text-pencil-deep dark:hover:text-pencil">
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="rounded-full border border-ink/15 dark:border-paper/15 px-4 py-2 text-sm font-medium text-ink dark:text-paper hover:border-pencil hover:text-pencil-deep dark:hover:text-pencil"
              >
                Log out
              </button>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-ink/8 dark:border-paper/8 px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4 text-sm">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-ink dark:text-paper">
                {l.label}
              </a>
            ))}
            <div className="flex items-center justify-between pt-2">
              <ThemeToggle />
              {!user ? (
                <div className="flex gap-3">
                  <Link href="/login" className="text-sm font-medium">Log in</Link>
                  <Link href="/register" className="rounded-full bg-pencil px-4 py-2 text-sm font-medium text-ink">Sign up</Link>
                </div>
              ) : (
                <Link href="/dashboard" className="rounded-full bg-pencil px-4 py-2 text-sm font-medium text-ink">Dashboard</Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
