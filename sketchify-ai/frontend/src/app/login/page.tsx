'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PenLine } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getErrorMessage } from '@/lib/api';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import GoogleAuthButton from '@/components/GoogleAuthButton';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
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
          <h1 className="font-display text-2xl">Welcome back</h1>
          <p className="mt-1 text-sm text-ink-mist">Log in to keep sketching.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            <Input label="Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-xs font-medium text-pencil-deep dark:text-pencil">Forgot password?</Link>
            </div>
            <Button type="submit" className="w-full" isLoading={loading}>Log in</Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-ink/10 dark:bg-paper/10" />
            <span className="text-xs text-ink-mist">or</span>
            <div className="h-px flex-1 bg-ink/10 dark:bg-paper/10" />
          </div>

          <GoogleAuthButton />

          <p className="mt-6 text-center text-sm text-ink-mist">
            Don&apos;t have an account? <Link href="/register" className="font-medium text-pencil-deep dark:text-pencil">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
