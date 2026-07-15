'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Search, HardDrive, ImagePlus, Star, ListChecks } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import HistoryGrid from '@/components/HistoryGrid';
import Card from '@/components/ui/Card';
import { api, formatBytes, getErrorMessage } from '@/lib/api';
import type { SketchImage, StorageStats } from '@/types';

function DashboardContent() {
  const [images, setImages] = useState<SketchImage[]>([]);
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [search, setSearch] = useState('');
  const [style, setStyle] = useState('');
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (style) params.style = style;
      if (favoriteOnly) params.favorite = 'true';
      const [imgRes, statsRes] = await Promise.all([
        api.get('/images', { params }),
        api.get('/images/stats/storage'),
      ]);
      setImages(imgRes.data.images);
      setStats(statsRes.data.stats);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [search, style, favoriteOnly]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const toggleFavorite = async (id: string) => {
    await api.patch(`/images/${id}/favorite`);
    load();
  };

  const deleteImage = async (id: string) => {
    if (!confirm('Delete this sketch permanently?')) return;
    await api.delete(`/images/${id}`);
    load();
  };

  const storagePct = stats ? Math.min(100, (stats.storageUsedBytes / stats.storageLimitBytes) * 100) : 0;

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Your dashboard</h1>
          <p className="mt-1 text-sm text-ink-mist">Manage every sketch you&apos;ve created.</p>
        </div>
        <Link href="/upload" className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper hover:bg-pencil hover:text-ink dark:bg-pencil dark:text-ink">
          <ImagePlus size={16} /> New sketch
        </Link>
      </div>

      {stats && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-5">
            <ListChecks size={16} className="text-pencil-deep dark:text-pencil" />
            <p className="mt-2 text-2xl font-semibold">{stats.totalImages}</p>
            <p className="text-xs text-ink-mist">Total sketches</p>
          </Card>
          <Card className="p-5">
            <Star size={16} className="text-pencil-deep dark:text-pencil" />
            <p className="mt-2 text-2xl font-semibold">{stats.favoriteImages}</p>
            <p className="text-xs text-ink-mist">Favorites</p>
          </Card>
          <Card className="p-5">
            <ListChecks size={16} className="text-pencil-deep dark:text-pencil" />
            <p className="mt-2 text-2xl font-semibold">{stats.completedImages}</p>
            <p className="text-xs text-ink-mist">Completed</p>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-2">
              <HardDrive size={16} className="text-pencil-deep dark:text-pencil" />
              <p className="text-xs text-ink-mist">Storage used</p>
            </div>
            <p className="mt-2 text-sm font-medium">{formatBytes(stats.storageUsedBytes)} / {formatBytes(stats.storageLimitBytes)}</p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ink/10 dark:bg-paper/10">
              <div className="h-full bg-pencil-deep dark:bg-pencil" style={{ width: `${storagePct}%` }} />
            </div>
          </Card>
        </div>
      )}

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mist" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by filename..."
            className="w-full rounded-full border border-ink/15 bg-paper-card py-2 pl-9 pr-4 text-sm outline-none focus:border-pencil-deep dark:border-paper/15 dark:bg-graphite-800 dark:focus:border-pencil"
          />
        </div>
        <select
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          className="rounded-full border border-ink/15 bg-paper-card px-4 py-2 text-sm dark:border-paper/15 dark:bg-graphite-800"
        >
          <option value="">All styles</option>
          <option value="pencil">Pencil</option>
          <option value="colored">Colored</option>
          <option value="charcoal">Charcoal</option>
          <option value="cartoon">Cartoon</option>
        </select>
        <button
          onClick={() => setFavoriteOnly(!favoriteOnly)}
          className={`rounded-full border px-4 py-2 text-sm ${
            favoriteOnly ? 'border-pencil-deep bg-pencil/15 dark:border-pencil' : 'border-ink/15 dark:border-paper/15'
          }`}
        >
          <Star size={13} className="mr-1.5 inline" /> Favorites
        </button>
      </div>

      <div className="mt-6">
        {error && <p className="text-sm text-red-500">{error}</p>}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-pencil border-t-transparent" />
          </div>
        ) : (
          <HistoryGrid images={images} onToggleFavorite={toggleFavorite} onDelete={deleteImage} />
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
