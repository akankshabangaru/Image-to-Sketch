'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { useAuth, getErrorMessage } from '@/context/AuthContext';

// Renders Google's official "Sign in with Google" button via Google Identity
// Services. Requires NEXT_PUBLIC_GOOGLE_CLIENT_ID (see frontend/.env.local.example)
// and a matching GOOGLE_CLIENT_ID/SECRET on the backend. Until configured, this
// renders a disabled explainer instead of a broken button.
export default function GoogleAuthButton() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const buttonRef = useRef<HTMLDivElement>(null);
  const { loginWithGoogle } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    if (!scriptReady || !clientId || !buttonRef.current) return;
    // @ts-expect-error - google is injected by the GSI script
    window.google?.accounts.id.initialize({
      client_id: clientId,
      callback: async (response: { credential: string }) => {
        try {
          await loginWithGoogle(response.credential);
          router.push('/dashboard');
        } catch (err) {
          setError(getErrorMessage(err));
        }
      },
    });
    // @ts-expect-error - google is injected by the GSI script
    window.google?.accounts.id.renderButton(buttonRef.current, {
      theme: 'outline',
      size: 'large',
      width: 320,
      shape: 'pill',
    });
  }, [scriptReady, clientId, loginWithGoogle, router]);

  if (!clientId) {
    return (
      <div className="rounded-full border border-dashed border-ink/20 px-4 py-2.5 text-center text-xs text-ink-mist dark:border-paper/20">
        Google sign-in isn&apos;t configured. Set <code>NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> to enable it.
      </div>
    );
  }

  return (
    <div>
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onLoad={() => setScriptReady(true)} />
      <div ref={buttonRef} className="flex justify-center" />
      {error && <p className="mt-2 text-center text-xs text-red-500">{error}</p>}
    </div>
  );
}
