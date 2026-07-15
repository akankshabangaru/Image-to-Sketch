'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PenLine, MailCheck } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper-dim/40 px-6 dark:bg-graphite-900/40">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2 font-display text-2xl italic">
          <PenLine size={20} className="text-pencil-deep dark:text-pencil" />
          Sketchify <span className="not-italic text-pencil-deep dark:text-pencil">AI</span>
        </Link>

        <div className="rounded-2xl border border-ink/8 bg-paper-card p-8 shadow-sm dark:border-paper/8 dark:bg-graphite-800">
          {sent ? (
            <div className="text-center">
              <MailCheck className="mx-auto text-pencil-deep dark:text-pencil" size={28} />
              <h1 className="mt-3 font-display text-2xl">Check your email</h1>
              <p className="mt-2 text-sm text-ink-mist">
                If an account exists for <span className="font-medium">{email}</span>, we&apos;ve sent a link to reset your password.
              </p>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl">Reset your password</h1>
              <p className="mt-1 text-sm text-ink-mist">We&apos;ll email you a link to get back in.</p>
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" className="w-full" isLoading={loading}>Send reset link</Button>
              </form>
            </>
          )}
          <p className="mt-6 text-center text-sm text-ink-mist">
            <Link href="/login" className="font-medium text-pencil-deep dark:text-pencil">Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
