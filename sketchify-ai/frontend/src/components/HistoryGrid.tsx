'use client';

import Link from 'next/link';
import { Heart, Trash2, Clock, CheckCircle2, XCircle } from 'lucide-react';
import type { SketchImage } from '@/types';
import clsx from 'clsx';

const statusIcon = {
  uploaded: <Clock size={13} className="text-ink-mist" />,
  processing: <Clock size={13} className="animate-pulse text-pencil-deep" />,
  completed: <CheckCircle2 size={13} className="text-emerald-600" />,
  failed: <XCircle size={13} className="text-red-500" />,
};

export default function HistoryGrid({
  images,
  onToggleFavorite,
  onDelete,
}: {
  images: SketchImage[];
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  if (images.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-ink/15 py-20 text-center dark:border-paper/15">
        <p className="text-ink-mist">No sketches yet. Upload a photo to get started.</p>
        <Link href="/upload" className="mt-3 inline-block text-sm font-medium text-pencil-deep dark:text-pencil">
          Create your first sketch →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {images.map((img) => (
        <div key={img._id} className="group relative overflow-hidden rounded-xl border border-ink/8 bg-paper-card dark:border-paper/8 dark:bg-graphite-800">
          <Link href={`/results/${img._id}`}>
            <div className="aspect-square overflow-hidden bg-graphite-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.resultUrl || img.originalUrl}
                alt={img.originalFileName}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
            </div>
          </Link>
          <div className="p-3">
            <div className="flex items-center justify-between">
              <span className="truncate text-xs font-medium text-ink dark:text-paper">{img.originalFileName}</span>
              {statusIcon[img.status]}
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-wide text-ink-mist">{img.style}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => onToggleFavorite(img._id)} aria-label="Toggle favorite">
                  <Heart
                    size={14}
                    className={clsx(img.isFavorite ? 'fill-pencil-deep text-pencil-deep' : 'text-ink-mist')}
                  />
                </button>
                <button onClick={() => onDelete(img._id)} aria-label="Delete">
                  <Trash2 size={14} className="text-ink-mist hover:text-red-500" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
