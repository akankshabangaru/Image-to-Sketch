'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { api, getErrorMessage, formatBytes } from '@/lib/api';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

function ProfileContent() {
  const { user, refreshUser, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setMessage('');
    setSavingProfile(true);
    try {
      await api.put('/users/me', { name });
      await refreshUser();
      setMessage('Profile updated');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setMessage('');
    setSavingPassword(true);
    try {
      await api.put('/users/me/password', { currentPassword, newPassword });
      setMessage('Password changed');
      setCurrentPassword(''); setNewPassword('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSavingPassword(false);
    }
  };

  const deleteAccount = async () => {
    if (!confirm('This will permanently delete your account and all sketches. Continue?')) return;
    await api.delete('/users/me');
    logout();
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="font-display text-3xl">Your profile</h1>

      <Card className="mt-8 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-pencil/20 font-display text-xl">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-ink-mist">{user.email}</p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-wide text-pencil-deep dark:text-pencil">{user.plan} plan · {user.authProvider}</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-ink-mist">Storage used: {formatBytes(user.storageUsedBytes)}</p>
      </Card>

      {message && <p className="mt-4 text-sm text-emerald-600">{message}</p>}
      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      <Card className="mt-6 p-6">
        <h2 className="font-medium">Edit profile</h2>
        <form onSubmit={saveProfile} className="mt-4 space-y-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Button type="submit" isLoading={savingProfile}>Save changes</Button>
        </form>
      </Card>

      {user.authProvider === 'local' && (
        <Card className="mt-6 p-6">
          <h2 className="font-medium">Change password</h2>
          <form onSubmit={changePassword} className="mt-4 space-y-4">
            <Input label="Current password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
            <Input label="New password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            <Button type="submit" isLoading={savingPassword}>Update password</Button>
          </form>
        </Card>
      )}

      <Card className="mt-6 border-red-200 p-6 dark:border-red-900/40">
        <h2 className="font-medium text-red-600">Danger zone</h2>
        <p className="mt-1 text-sm text-ink-mist">Deleting your account removes all sketches and history permanently.</p>
        <Button variant="danger" className="mt-4" onClick={deleteAccount}>Delete account</Button>
      </Card>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
