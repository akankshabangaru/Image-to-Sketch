'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { api, getErrorMessage } from '@/lib/api';
import type { AdminStats, User } from '@/types';
import { Users, ImageIcon, TrendingUp, AlertTriangle } from 'lucide-react';

function AdminContent() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users', { params: search ? { search } : {} }),
      ]);
      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const updateRole = async (id: string, role: 'user' | 'admin') => {
    await api.patch(`/admin/users/${id}`, { role });
    load();
  };

  const removeUser = async (id: string) => {
    if (!confirm('Delete this user and all their images?')) return;
    await api.delete(`/admin/users/${id}`);
    load();
  };

  if (error) return <p className="mx-auto max-w-3xl px-6 py-12 text-red-500">{error}</p>;
  if (!stats) return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-pencil border-t-transparent" /></div>;

  const maxTrend = Math.max(1, ...stats.dailyTrend.map((d) => d.count));

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="font-display text-3xl">Admin dashboard</h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5"><Users size={16} className="text-pencil-deep dark:text-pencil" /><p className="mt-2 text-2xl font-semibold">{stats.totalUsers}</p><p className="text-xs text-ink-mist">Total users ({stats.newUsersToday} today)</p></Card>
        <Card className="p-5"><ImageIcon size={16} className="text-pencil-deep dark:text-pencil" /><p className="mt-2 text-2xl font-semibold">{stats.totalImages}</p><p className="text-xs text-ink-mist">Images processed</p></Card>
        <Card className="p-5"><TrendingUp size={16} className="text-pencil-deep dark:text-pencil" /><p className="mt-2 text-2xl font-semibold">{stats.imagesThisMonth}</p><p className="text-xs text-ink-mist">This month ({stats.imagesToday} today)</p></Card>
        <Card className="p-5"><AlertTriangle size={16} className="text-red-500" /><p className="mt-2 text-2xl font-semibold">{stats.failedImages}</p><p className="text-xs text-ink-mist">Failed conversions</p></Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="font-medium">Processing volume (14 days)</h2>
          <div className="mt-4 flex h-32 items-end gap-1">
            {stats.dailyTrend.map((d) => (
              <div key={d._id} className="flex-1 rounded-t bg-pencil-deep/70 dark:bg-pencil/70" style={{ height: `${(d.count / maxTrend) * 100}%` }} title={`${d._id}: ${d.count}`} />
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="font-medium">Most used style: <span className="capitalize text-pencil-deep dark:text-pencil">{stats.mostUsedStyle || '—'}</span></h2>
          <div className="mt-4 space-y-2">
            {stats.styleBreakdown.map((s) => (
              <div key={s._id}>
                <div className="flex justify-between text-xs"><span className="capitalize">{s._id}</span><span>{s.count}</span></div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-ink/10 dark:bg-paper/10">
                  <div className="h-full rounded-full bg-pencil-deep dark:bg-pencil" style={{ width: `${(s.count / stats.totalImages) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl">User management</h2>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="rounded-full border border-ink/15 bg-paper-card px-4 py-2 text-sm dark:border-paper/15 dark:bg-graphite-800"
          />
        </div>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-ink/8 dark:border-paper/8">
          <table className="w-full text-left text-sm">
            <thead className="bg-paper-dim/60 font-mono text-[10px] uppercase tracking-wider text-ink-mist dark:bg-graphite-900/60">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/8 dark:divide-paper/8">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3 text-ink-mist">{u.email}</td>
                  <td className="px-4 py-3">
                    <select value={u.role} onChange={(e) => updateRole(u.id, e.target.value as 'user' | 'admin')} className="rounded-full border border-ink/15 bg-transparent px-2 py-1 text-xs dark:border-paper/15">
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 capitalize">{u.plan}</td>
                  <td className="px-4 py-3 text-ink-mist">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <Button variant="danger" size="sm" onClick={() => removeUser(u.id)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute adminOnly>
      <AdminContent />
    </ProtectedRoute>
  );
}
