'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { PenLine } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token') || '';
  const email = params.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/reset-password', { email, token, password });
      localStorage.setItem('sketchify_token', data.token);
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
          <h1 className="font-display text-2xl">Set a new password</h1>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input label="New password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            <Input label="Confirm password" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" isLoading={loading}>Update password</Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
